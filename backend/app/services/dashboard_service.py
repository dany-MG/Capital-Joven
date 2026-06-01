from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from bson import ObjectId
from typing import List, Optional

class DashboardService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def month_balance(self, user_id: str, date_balance: dict):
        start_date = datetime(date_balance["year"], date_balance["month"], 1)
        if date_balance["month"] == 12:
            end_date = datetime(date_balance["year"]+1, 1, 1)
        else:
            end_date = datetime(date_balance["year"], date_balance["month"]+1, 1)
        incomes = await self.db.income.find({"user_id": user_id, "date": {"$gte": start_date, "$lt": end_date}}, {"amount": 1}).to_list()
        bills = await self.db.bill.find({"user_id": user_id, "date": {"$gte": start_date, "$lt": end_date}}, {"amount": 1}).to_list()
        total_incomes = round(sum(item["amount"] for item in incomes), 2)
        total_bills = round(sum(item["amount"] for item in bills), 2)
        balance = round(total_incomes - total_bills, 2)
        
        return {"incomes": total_incomes, "bills": total_bills, "balance": balance}