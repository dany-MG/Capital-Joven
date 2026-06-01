from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.schemas.user_schema import UserCreate, UserLogin
from app.schemas.user_schema import UserLoginResponse, UserRegisterResponse, UserProfileResponse, UserUpdate
from app.services.user_service import UserService
from app.api.dependencies.deps import get_current_user_from_cookie
from datetime import timedelta

router = APIRouter(prefix="/user", tags=["User"])

def get_user_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return UserService(db)

@router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, service: UserService = Depends(get_user_service)):
    try:        
        email_verify_exists = await service.email_exists(user_data.email)
        if email_verify_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El correo {user_data.email} ya se encuentra registrado")
        new_user = await service.create_user(user_data)
        return new_user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrio un error al registrar al usaurio: {str(e)}")

@router.post("/login", response_model=UserLoginResponse)
async def login_user(user_data: UserLogin, request: Request, response: Response, service: UserService = Depends(get_user_service)):
    try:    
        result = await service.login_user(user_data, ip_address=request.client.host, user_agent=request.headers.get("user-agent", ""))
        if not result:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
        response.set_cookie(key="session_token", value=result.token, max_age=timedelta(days=7).total_seconds(),
                            httponly=True, secure=False, samesite="lax", path="/")
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrio un error al iniciar sesión: {str(e)}")

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user_from_cookie)):
    return current_user

@router.post("/logout")
async def logout_user(request: Request, response: Response, current_user: dict = Depends(get_current_user_from_cookie), 
                        service: UserService = Depends(get_user_service)):
    
    session_id = request.cookies.get("session_token")
    if session_id:
        await service.session_service.invalidate_session(session_id)
    response.delete_cookie("session_token")
    return {"message": "Sesión cerrada exitosamente"}

@router.post("/logout_all")
async def colse_all_sessions(request: Request, response: Response, current_user: dict = Depends(get_current_user_from_cookie),
                        service: UserService = Depends(get_user_service)):
    session_id = request.cookies.get("session_token")
    if session_id:
        count = await service.session_service.invalidate_all_sessions(current_user["id_user"])
    response.delete_cookie("session_token")
    return {"message": f"Se cerraron {count} sesiones en todos los dispositivos"}

@router.put("/update", response_model=UserProfileResponse)
async def update_user(request: Request, 
                      response: Response,
                      user_update: UserUpdate, 
                      current_user: dict = Depends(get_current_user_from_cookie),
                      service: UserService = Depends(get_user_service)):
    session_id = request.cookies.get("session_token")
    try:
        return await service.update_user(
            user_update.model_dump(exclude_unset=True),
            current_user["id_user"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar los datos: {str(e)}"
        )