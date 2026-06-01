from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from bson import ObjectId
from typing import List, Optional

class BillService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def get_all_bills(self, user_id: str) -> Optional[List[dict]]:
        cursor = self.db.bill.find({"user_id": user_id}, {"_id": 1, "title": 1, "amount": 1})
        result = await cursor.to_list()
        if not result: 
            return None
        for bill in result:
            bill["_id"] = str(bill["_id"])
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
        bill_result = await self.db.bill.insert_one(bill_data)
        if bill_result.inserted_id:
            return {"message": "El gasto se ha registrado correctamente."}
        raise ValueError("Ocurrio un error al registrar el gasto.")
    
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