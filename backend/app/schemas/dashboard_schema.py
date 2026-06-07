from pydantic import BaseModel
from typing import Optional
    
class DashboardMetricsResponse(BaseModel):
    balanceTotal: float
    balanceTrend: float
    ingresosMensuales: float
    ingresosTrend: float
    gastosTotales: float
    gastosTrend: float
    prediccionGastoActual: float
    prediccionProyeccion: float
    metaAhorroNombre: Optional[str] = ""
    metaAhorroActual: Optional[float] = 0.0
    metaAhorroObjetivo: Optional[float] = 0.0
    
class ChartResponse(BaseModel):
    day: str
    real: Optional[float]
    predicted: float
    
class RecentTransactionsResponse(BaseModel):
    id: str
    title: str
    category: str
    date: str
    amount: float
    type: str