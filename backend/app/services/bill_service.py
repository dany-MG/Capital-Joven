from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from typing import List, Optional
from dateutil.relativedelta import relativedelta

class BillService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    def generate_dates(self, start_date: datetime, end_date: datetime, frequency: str) -> list[datetime]:
        dates = []
        current = start_date
        while current <= end_date:
            dates.append(current)
            if frequency == "Semanal":
                current += timedelta(weeks=1)
            elif frequency == "Quincenal":
                current += timedelta(weeks=2)
            elif frequency == "Mensual":
                current += relativedelta(months=1)
            else:
                break
        return dates
        
    async def get_all_bills(self, user_id: str) -> Optional[List[dict]]:
        cursor = self.db.bill.find({"user_id": user_id}, {"_id": 1, "title": 1, "amount": 1, "date": 1, "category": 1})
        result = await cursor.to_list()
        if not result: 
            return None
        for bill in result:
            bill["_id"] = str(bill["_id"])
            bill["date"] = bill["date"].strftime('%Y-%m-%d %H:%M:%S')
        return result  
    
    async def get_bill_details(self, bill_id: str) -> Optional[dict]:
        result = await self.db.bill.find_one({"_id": ObjectId(bill_id)})
        if not result:
            return None
        result["_id"] = str(result["_id"])
        result["date"] = result["date"].strftime('%Y-%m-%d %H:%M:%S')
        return result
        
    async def register_bill(self, bill_data: dict, user_id: str) -> dict:
        if not bill_data.get("date"):
            bill_data["date"] = datetime.now(timezone.utc)
        bill_data["user_id"] = user_id
        frequency = bill_data.pop("frequency", None)
        end_date = bill_data.pop("end_date", None)
        
        if not frequency or not end_date:
            bill_result = await self.db.bill.insert_one(bill_data)
            if bill_result.inserted_id:
                return {"message": "El gasto se ha registrado correctamente."}
            raise ValueError("Ocurrio un error al registrar el gasto.")
        
        start_date = bill_data.pop("date")
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date)
        dates = self.generate_dates(start_date=start_date, end_date=end_date, frequency=frequency)
        if not dates:
            raise ValueError("Ocurrió un error al generar las fechas")
        documents = [{**bill_data, "date": date} for date in dates]
        result = await self.db.bill.insert_many(documents)
        if result.inserted_ids:
            return {"message": f"Se registraron {len(result.inserted_ids)} gastos correctamente"}
        raise ValueError("Ocurrió un error al registrar los gastos")
    
    async def update_bill(self, bill_update: dict, bill_id: str) -> dict:
        bill = await self.db.bill.find_one({"_id": ObjectId(bill_id)})
        if not bill:
            raise ValueError("No se logró encontrar el gasto")
        result = await self.db.bill.update_one({"_id": ObjectId(bill_id)}, {"$set": bill_update})
        if result.modified_count == 0:
            raise ValueError("Ocurrió un error al actualizar los datos")
        return {"message": "El gasto se ha modificado correctamente"}
    
    async def delete_bill(self, bill_id: str) -> dict:
        bill = await self.db.bill.find_one({"_id": ObjectId(bill_id)})
        if not bill:
            raise ValueError("No se logró encontrar el gasto")
        result = await self.db.bill.delete_one({"_id": ObjectId(bill_id)})
        if result.deleted_count == 0:
            raise ValueError("Ocurrió un error al eliminar los datos")
        return {"message": "El registro se eliminó correctamente"}