from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from bson import ObjectId
from typing import List, Optional

class IncomeService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def get_all_incomes(self, user_id: str) -> Optional[List[dict]]:
        cursor = self.db.income.find({"user_id": user_id}, {"_id": 1, "title": 1, "amount": 1})
        result = await cursor.to_list()
        if not result: 
            return None
        for income in result:
            income["_id"] = str(income["_id"])
        return result  
    
    async def get_income_details(self, income_id: str) -> Optional[dict]:
        result = await self.db.income.find_one({"_id": ObjectId(income_id)})
        if not result:
            return None
        result["_id"] = str(result["_id"])
        result["date"] = result["date"].strftime('%Y-%m-%d %H:%M:%S')
        return result
        
    async def register_income(self, income_data: dict, user_id: str) -> dict:
        if not income_data.get("date"):
            income_data["date"] = datetime.now(timezone.utc)
        income_data["user_id"] = user_id
        income_result = await self.db.income.insert_one(income_data)
        if income_result.inserted_id:
            return {"message": "El ingreso se ha registrado correctamente."}
        raise ValueError("Ocurrio un error al registrar el ingreso.")
    
    async def update_income(self, income_update: dict, income_id: str) -> dict:
        income = await self.db.income.find_one({"_id": ObjectId(income_id)})
        if not income:
            raise ValueError("No se logró encontrar el ingreso")
        result = await self.db.income.update_one({"_id": ObjectId(income_id)}, {"$set": income_update})
        if result.modified_count == 0:
            raise ValueError("Ocurrió un error al actualizar los datos")
        return {"message": "El ingreso se ha modificado correctamente"}
    
    async def delete_income(self, income_id: str) -> dict:
        income = await self.db.income.find_one({"_id": ObjectId(income_id)})
        if not income:
            raise ValueError("No se logró encontrar el ingreso")
        result = await self.db.income.delete_one({"_id": ObjectId(income_id)})
        if result.deleted_count == 0:
            raise ValueError("Ocurrió un error al eliminar los datos")
        return {"message": "El registro se eliminó correctamente"}