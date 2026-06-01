from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard_schema import BalancePerMonth, BalanceResponse
from app.core.database import get_database
from app.api.dependencies.deps import get_current_user_from_cookie
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

async def get_dashboard_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return DashboardService(db)

@router.get("/month_balance", response_model=BalanceResponse)
async def balance_per_month(month: int = Query(..., ge=1, le=12), year: int = Query(...), 
                            service: DashboardService = Depends(get_dashboard_service), 
                            current_user: dict = Depends(get_current_user_from_cookie)):
    try: 
        date_balance = BalancePerMonth(month=month, year=year)
        result = await service.month_balance(current_user["id_user"], date_balance.model_dump())
        return BalanceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener el balance general: {str(e)}")