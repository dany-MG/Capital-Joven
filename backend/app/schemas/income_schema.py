from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class SourceIncome(str, Enum):
    NOMINA = "Nomina"
    BECA = "Beca"
    VENTAS = "Ventas"
    INVERSIONES = "Inversiones"
    REGALOS = "Regalos"
    OTROS = "Otros"
    
class Frequency(str, Enum):
    UNICO = "Único"
    SEMANAL = "Semanal"
    QUINCENAL = "Quincenal"
    MENSUAL = "Mensual"

class CreateIncome(BaseModel):
    title: str
    amount: float = Field(..., gt=0)
    date: Optional[datetime] = None
    origin: SourceIncome
    description: Optional[str] = None
    frequency: Frequency
    
class UpdateIncome(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    origin: Optional[SourceIncome] = None
    description: Optional[str] = None
    frequency: Optional[Frequency] = None
    
class AllIncomeResponse(BaseModel):
    income_id: str = Field(alias="_id")
    title: str
    amount: float
    
class IncomeResponse(BaseModel):
    income_id: str = Field(alias="_id")
    title: str
    amount: float
    date: datetime
    origin: SourceIncome
    description: Optional[str]
    frequency: Frequency
    
    class Config:
        from_attributes = True
        populate_by_name = True