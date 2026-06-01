from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from bson import ObjectId

def build_goal_response(goal):
    return {
        "id": str(goal["_id"]),
        "title": goal["title"],
        "target_amount": goal["target_amount"],
        "current_amount": goal.get("current_amount", 0),
        "progress": round(
            (goal.get("current_amount", 0) / goal["target_amount"]) * 100, 2
        ) if goal["target_amount"] > 0 else 0,
        "start_date": goal.get("start_date"),
        "end_date": goal.get("end_date"),
        "description": goal.get("description")
    }
    
class GoalService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_all_goals(self, user_id: str):
        goals = await self.db.goal.find({"user_id": user_id}).to_list(length=100)
        if not goals:
            return []
        list_goals = []
        for goal in goals:
            list_goals.append(build_goal_response(goal))
        return list_goals
    
    async def get_goal_details(self, goal_id: str):
        result = await self.db.goal.find_one({"_id": ObjectId(goal_id)})
        if not result:
            return None
        return build_goal_response(result)

    async def register_goal(self, goal_data: dict, user_id: str):
        goal_data.update({
            "created_at": datetime.now(timezone.utc),
            "user_id": user_id
        })
        
        result = await self.db.goal.insert_one(goal_data)
        if not result.inserted_id: 
            raise ValueError("Error al registrar la meta.")
        goal = await self.db.goal.find_one({"_id": result.inserted_id})
        return build_goal_response(goal)

    async def update_goal(self, goal_update: dict, goal_id: str, user_id: str):
        try:
            obj_id = ObjectId(goal_id)
        except:
            raise ValueError("ID no valido.") 
       
        goal = await self.db.goal.find_one({"_id": ObjectId(goal_id),
                                            "user_id": user_id})
        if not goal:
            raise ValueError("No se encontro la meta.")
        await self.db.goal.update_one({"_id": ObjectId(goal_id)}, 
                                               {"$set": goal_update})
        
        update = await self.db.goal.find_one({"_id": ObjectId(goal_id)})
        return build_goal_response(update)
    
    async def delete_goal(self, goal_id: str, user_id: str) -> dict:
        try:
            obj_id = ObjectId(goal_id)
        except:
            raise ValueError("ID no valido.")
        
        goal = await self.db.goal.find_one({
            "_id": obj_id,
            "user_id": user_id})
        
        if not goal:
            raise ValueError("No se encontro la meta.")
        result = await self.db.goal.delete_one({"_id": obj_id,
                                                "user_id": user_id})
        
        if result.deleted_count == 0:
            raise ValueError("Ocurrió un error al eliminar la meta")
        return {"message": "La meta se elimino correctamente."}
    
    async def add_amount(self, goal_id: str, amount:float, user_id: str):
        try:
            obj_id = ObjectId(goal_id)
        except:
            raise ValueError("ID no valido.")

        goal = await self.db.goal.find_one({
            "_id": ObjectId(goal_id), 
            "user_id": user_id})

        if not goal:
            raise ValueError("Error al encontrar la meta")

        await self.db.goal.update_one(
            {"_id": ObjectId(goal_id)},
            {"$set": {"current_amount": amount}}
        )

        updated = await self.db.goal.find_one({"_id": ObjectId(goal_id)})
        return build_goal_response(updated)
    