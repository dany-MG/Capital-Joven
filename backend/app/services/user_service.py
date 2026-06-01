from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from bson import ObjectId
from app.schemas.user_schema import UserCreate, UserLogin
from app.schemas.user_schema import UserRegisterResponse, UserLoginResponse, UserProfileResponse
from app.services.session_service import SessionService
import bcrypt

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.session_service = SessionService(db)
    
    async def email_exists(self, email: str) -> bool:
        result = await self.db.user.find_one({"email": email, }, {"_id": 1})
        return result is not None
    
    async def create_user(self, user_data: UserCreate) -> UserRegisterResponse:
        try:
            user_dict = user_data.model_dump()
            user_dict["password"] = (bcrypt.hashpw(user_dict["password"].encode('utf-8'), bcrypt.gensalt(rounds=12))).decode('utf-8')
            result = await self.db.user.insert_one(user_dict)
            created_user = await self.db.user.find_one(
                {"_id": result.inserted_id}, 
                {"firstname": 1, "lastname":1, "email": 1})
            if not created_user:
                raise ValueError("Error al crear el usuario")
            created_user["message"] = f"Usuario {created_user['firstname']} con correo electrónico {created_user['email']} creado con éxito"
            return UserRegisterResponse(**created_user)
        except Exception as e:
            raise ValueError("No se pudo crear el usuario")
    
    async def login_user(self, user_data: UserLogin, ip_address: str, user_agent: str) -> Optional[UserLoginResponse]:
        try:
            user = await self.db.user.find_one({"email": user_data.email}, {"_id": 1, "password": 1})
            if not user:
                return None
            if not bcrypt.checkpw(user_data.password.encode('utf-8'), user["password"].encode('utf-8')):
                return None
            session_id, session = await self.session_service.create_session(
                user_id=str(user["_id"]),
                ip_address=ip_address,
                user_agent=user_agent,
                ttl=7
            )
            return UserLoginResponse(token = session_id)
        except Exception as e:
            raise ValueError("No se pudo iniciar sesión")
        
    async def get_user_profile(self, user_id: str) -> Optional[UserProfileResponse]:
        user = await self.db.user.find_one({"_id": ObjectId(user_id)})
        user["_id"] = str(user["_id"])
        if not user:
            return None
        return UserProfileResponse(**user)
    
    async def update_user(self, user_update: dict, user_id: str) -> dict:
        try:
            obj_id = ObjectId(user_id)
        except:
            raise ValueError("ID no valido")
        
        user = await self.db.user.find_one({"_id": obj_id})
        if not user:
            raise ValueError("No se encontro el usuario")
        
        # Verificamos cont actual
        if "password" in user_update and user_update["password"]:
            current_pwd = user_update.pop("current_password", None)
            if not current_pwd:
                raise ValueError("Debes proporcionar tu contraseña actual para cambiarla")
            
            # Comparamos con el hash de la Base de Datos
            if not bcrypt.checkpw(current_pwd.encode('utf-8'), user["password"].encode('utf-8')):
                raise ValueError("La contraseña actual es incorrecta")
            
            user_update["password"] = bcrypt.hashpw( #se encripta la nueva
                user_update["password"].encode('utf-8'),
                bcrypt.gensalt(rounds=12)
            ).decode('utf-8')
        else:
            user_update.pop("current_password", None)

        await self.db.user.update_one(
            {"_id": obj_id},
            {"$set": user_update}
        )
        
        updated = await self.db.user.find_one({"_id": obj_id})
        if not updated:
            raise ValueError("Error al recuperar los datos actualizados")
            
        updated["_id"] = str(updated["_id"])
        return UserProfileResponse(**updated)