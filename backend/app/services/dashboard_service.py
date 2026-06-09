from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
import hashlib
import asyncio

class DashboardService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def dashboard_metrics(self, user_id: str):
        now = datetime.now()
        current_start = datetime(now.year, now.month, 1)
        current_end = datetime(now.year+1, 1, 1) if now.month==12 else datetime(now.year, now.month+1, 1)
        prev_mont = now.month-1 if now.month>1 else 12
        prev_year = now.year if now.month>1 else now.year-1
        prev_start = datetime(prev_year, prev_mont, 1)
        prev_end = current_start
        
        async def fetch_totals(start: datetime, end: datetime):
            incomes, bills = await asyncio.gather(self.db.income.find({"user_id": user_id, "date": {"$gte": start, "$lt": end}}, {"amount": 1}).to_list(None),
                                                self.db.bill.find({"user_id": user_id, "date": {"$gte": start, "$lt": end}}, {"amount": 1}).to_list(None))
            total_inc = round(sum(i["amount"] for i in incomes), 2)
            total_bil = round(sum(b["amount"] for b in bills), 2)
            return total_inc, total_bil
        
        def calc_trend(current: float, previous: float) -> float:
            if previous == 0:
                return 100.0 if current > 0 else 0.0
            if previous < 0:
                return round((current-previous)/abs(previous)*100, 1)    
            return round((current-previous)/previous*100, 1)
        
        (curr_inc, curr_bil), (prev_inc, prev_bil) = await asyncio.gather(
            fetch_totals(current_start, current_end), fetch_totals(prev_start, prev_end))
        
        balance_total = round(curr_inc-curr_bil, 2)
        balance_prev = round(prev_inc-prev_bil, 2)
        
        days_elapsed = now.day
        days_month = (current_end-current_start).days
        
        gasto_actual = curr_bil
        gasto_proyectado = round((curr_bil/days_elapsed)*days_month, 2) if days_elapsed > 0 else 0.0
        
        goal = await self.db.goal.find_one({"user_id": user_id, "end_date": {"$gte": now}, "$expr": {"$lt": ["$current_amount", "$target_amount"]}}, sort=[("end_date", 1)])
        goal_name = goal["title"] if goal else None
        goal_actual = goal["current_amount"] if goal else None
        goal_objetivo = goal["target_amount"] if goal else None
        
        return {
            "balanceTotal": balance_total,
            "balanceTrend": calc_trend(balance_total, balance_prev),
            "ingresosMensuales": curr_inc,
            "ingresosTrend": calc_trend(curr_inc, prev_inc),
            "gastosTotales": curr_bil,
            "gastosTrend": calc_trend(curr_bil, prev_bil),
            "prediccionGastoActual": gasto_actual,
            "prediccionProyeccion": gasto_proyectado,
            "metaAhorroNombre": goal_name,
            "metaAhorroActual": goal_actual,
            "metaAhorroObjetivo": goal_objetivo
        }
        
    async def get_weekly_chart(self, user_id: str):
        now = datetime.now()
        start_week = datetime(now.year, now.month, now.day)-timedelta(days=now.weekday())
        end_week = start_week+timedelta(days=7)
        history = start_week-timedelta(weeks=4)
        current_bills = await self.db.bill.find({"user_id": user_id, "date": {"$gte": start_week, "$lt": end_week}}, {"amount": 1, "date": 1}).to_list(None)
        bills_by_day = {i: 0.0 for i in range(7)}
        
        for bill in current_bills:
            day_index = bill["date"].weekday()
            bills_by_day[day_index] += bill["amount"]
        historicall_bills = await self.db.bill.find({"user_id": user_id, "date": {"$gte": history, "$lt": start_week}}, {"amount": 1, "date": 1}).to_list(None)
        
        history_by_day = {i: 0.0 for i in range(7)}
        history_count = {i: 0.0 for i in range(7)}
        for bill in historicall_bills:
            day_index = bill["date"].weekday()
            history_by_day[day_index] += bill["amount"]
            history_count[day_index] += 1
            
        day_labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
        chart = []
        for i in range(7):
            weeks_with_data = history_count[i] if history_count[i] > 0 else 1
            predicted = round(history_by_day[i]/weeks_with_data, 2)
            real = round(bills_by_day[i], 2) if i <= now.weekday() else None
            chart.append({"day": day_labels[i], "real": real, "predicted": predicted})
        
        return chart
    
    async def get_recent_transactions(self, user_id: str, limit: int = 3):
        incomes, bills = await asyncio.gather(self.db.income.find({"user_id": user_id}, {"_id": 1, "title": 1, "origin": 1, "date": 1, "amount": 1},
                                                                sort=[("date", -1)]).limit(limit).to_list(None),
                                              self.db.bill.find({"user_id": user_id}, {"_id": 1, "title": 1, "category": 1, "date": 1, "amount": 1},
                                                                sort=[("date", -1)]).limit(limit).to_list(None))
        transactions = []
        for item in incomes:
            transactions.append({"id": str(item["_id"]), "title": item.get("title", "Sin título"), "category": item.get("origin", "Sin categoría"),
                                "date": item["date"].strftime("%d-%m-%Y"), "amount": round(item["amount"], 2), "type": "income"})
        for item in bills:
            transactions.append({"id": str(item["_id"]), "title": item.get("title", "Sin título"), "category": item.get("category", "Sin categoría"),
                                "date": item["date"].strftime("%d-%m-%Y"), "amount": round(item["amount"], 2), "type": "expense"})
        transactions.sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%Y"), reverse=True)
        
        return transactions[:limit]
    
    def daily_tip(self, user_id: str) -> dict:
        tips = [
            {
                "title": "Evita Deudas Hormiga",
                "description": "Registra cada pequeño gasto. Ese café diario suma más de $900 al mes. ¡Mantén el control!"
            },
            {
                "title": "Regla del 50/30/20",
                "description": "Destina el 50% de tus ingresos a necesidades, 30% a gustos y 20% a ahorro. Simple y efectivo."
            },
            {
                "title": "Fondo de Emergencia",
                "description": "Intenta tener al menos 3 meses de gastos guardados. Te salva de deudas cuando menos lo esperas."
            },
            {
                "title": "Compras por Impulso",
                "description": "Antes de comprar algo no planeado, espera 24 horas. El 80% de las veces ya no lo querrás."
            },
            {
                "title": "Suscripciones Olvidadas",
                "description": "Revisa tus suscripciones activas cada mes. El mexicano promedio paga 3 servicios que no usa."
            },
            {
                "title": "Aprovecha Descuentos con Cabeza",
                "description": "Un descuento del 50% en algo que no necesitas sigue siendo dinero gastado, no ahorrado."
            },
            {
                "title": "Automatiza tu Ahorro",
                "description": "Configura una transferencia automática el día de quincena. Ahorra antes de gastar, no al revés."
            },
            {
                "title": "Cocina en Casa",
                "description": "Comer fuera puede costarte 3x más que cocinar. Con preparar tu comida 3 días a la semana ya notas la diferencia."
            },
            {
                "title": "Cuidado con las MSI",
                "description": "Las mensualidades sin intereses siguen siendo deuda. No abras más de las que puedes cubrir con tu quincena."
            },
            {
                "title": "Compara Antes de Comprar",
                "description": "Para gastos mayores a $500, compara al menos en 3 lugares. Puedes ahorrar hasta un 30% en el mismo producto."
            },
        ]
        
        now = datetime.now()
        seed = f"{user_id}-{now.year}-{now.timetuple().tm_yday}"
        hash_int = int(hashlib.md5(seed.encode()).hexdigest(), 16)
        index = hash_int%len(tips)
        return tips[index]