from fastapi import APIRouter, Depends, HTTPException, status
from app.services.income_service import IncomeService
from app.schemas.income_schema import CreateIncome, UpdateIncome, AllIncomeResponse, IncomeResponse
from app.core.database import get_database
from app.api.dependencies.deps import get_current_user_from_cookie
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

router = APIRouter(prefix="/income", tags=["Income"])

async def get_income_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return IncomeService(db)

@router.get("/", response_model=List[AllIncomeResponse])
async def get_all_incomes(service: IncomeService = Depends(get_income_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        result = await service.get_all_incomes(current_user["id_user"])
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No tienes ingresos registrados por el momento.")
        return [AllIncomeResponse(**income) for income in result]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener la información: {str(e)}")
    
@router.get("/{id_income}", response_model=IncomeResponse)
async def get_income_details(id_income: str, service: IncomeService = Depends(get_income_service), 
                            current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        result = await service.get_income_details(id_income)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se encontró registro del ingreso seleccionado")
        return IncomeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener la información: {str(e)}")

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_income(income_data: CreateIncome, service: IncomeService = Depends(get_income_service), 
                        current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        return await service.register_income(income_data.model_dump(), current_user["id_user"])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al registrar la información: {str(e)}")
    
@router.post("/update/{id_income}", response_model=dict)
async def update_income(id_income: str, income_update: UpdateIncome, service: IncomeService = Depends(get_income_service),
                        current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        return await service.update_income(income_update.model_dump(exclude_unset=True), id_income)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al actualizar el ingreso: {str(e)}")
    
@router.delete("/delete/{id_income}", response_model=dict)
async def delete_income(id_income: str, service: IncomeService = Depends(get_income_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        return await service.delete_income(id_income)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al eliminar la infomración: {str(e)}")