from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard_schema import DashboardMetricsResponse, ChartResponse, RecentTransactionsResponse
from app.core.database import get_database
from app.api.dependencies.deps import get_current_user_from_cookie
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

async def get_dashboard_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return DashboardService(db)

@router.get("/metrics", response_model=DashboardMetricsResponse)
async def get_dashboard_metrics(service: DashboardService = Depends(get_dashboard_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try: 
        dashboard_metrics = await service.dashboard_metrics(current_user["id_user"])
        return DashboardMetricsResponse(**dashboard_metrics)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener la información: {str(e)}")
    
@router.get("/chart", response_model=List[ChartResponse])
async def get_weekly_chart(service: DashboardService = Depends(get_dashboard_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        chart_day = await service.get_weekly_chart(current_user["id_user"])
        return [ChartResponse(**day) for day in chart_day]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener la información: {str(e)}")
    
@router.get("/recent_transactions", response_model=Optional[List[RecentTransactionsResponse]])
async def get_recent_transactions(service: DashboardService = Depends(get_dashboard_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        recent_transactions = await service.get_recent_transactions(current_user["id_user"])
        return [RecentTransactionsResponse(**transaction) for transaction in recent_transactions]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener las transacciones: {str(e)}")
    
@router.get("/tips")
async def get_daily_tip(service: DashboardService = Depends(get_dashboard_service), current_user: dict = Depends(get_current_user_from_cookie)):
    try:
        return service.daily_tip(current_user["id_user"])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocurrió un error al obtener el tip: {str(e)}")