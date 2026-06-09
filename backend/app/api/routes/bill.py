from fastapi import APIRouter, Depends, HTTPException, status
from app.services.bill_service import BillService
from app.schemas.bill_schema import CreateBill, UpdateBill, AllBillResponse, BillResponse
from app.core.database import get_database
from app.api.dependencies.deps import get_current_user_from_cookie
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

router = APIRouter(prefix="/bill", tags=["Bill"])

async def get_bill_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return BillService(db)

@router.get("/", response_model=List[AllBillResponse])
async def get_all_bills(service: BillService = Depends(get_bill_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        result = await service.get_all_bills(current_user["id_user"])
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No tienes gastos registrados por el momento.")
        return [AllBillResponse(**bill) for bill in result]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener la información: {str(e)}")
    
@router.get("/{id_bill}", response_model=BillResponse)
async def get_bill_details(id_bill: str, service: BillService = Depends(get_bill_service), 
                            current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        result = await service.get_bill_details(id_bill)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se encontró registro del gasto seleccionado")
        return BillResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener la información: {str(e)}")

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_bill(bill_data: CreateBill, service: BillService = Depends(get_bill_service), 
                        current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        return await service.register_bill(bill_data.model_dump(), current_user["id_user"])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al registrar la información: {str(e)}")
    
@router.post("/update/{id_bill}", response_model=dict)
async def update_bill(id_bill: str, bill_update: UpdateBill, service: BillService = Depends(get_bill_service),
                        current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        return await service.update_bill(bill_update.model_dump(exclude_unset=True), id_bill)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al actualizar el gasto: {str(e)}")
    
@router.delete("/delete/{id_bill}", response_model=dict)
async def delete_bill(id_bill: str, service: BillService = Depends(get_bill_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        return await service.delete_bill(id_bill)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al eliminar la infomración: {str(e)}")