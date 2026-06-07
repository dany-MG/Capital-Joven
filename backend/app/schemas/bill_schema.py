from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class CategoryBill(str, Enum):
    COMIDA = "Comida"
    TRANSPORTE = "Transporte"
    SERVICIOS = "Servicios"
    SALUD = "Salud"
    ENTRETENIMIENTO = "Entretenimiento"
    CASA = "Casa"
    OTROS = "Otros"
    SALARIO = "salario"
    FREELANCE = "frelance"
    INVERSIONES = "inversiones"
    
class type(str, Enum):
    INCOME = "Income" 
    SPENT = "Spent"

class Frequency(str, Enum):
    UNICO = "Único"
    SEMANAL = "Semanal"
    QUINCENAL = "Quincenal"
    MENSUAL = "Mensual"
    
class CreateBill(BaseModel):
    title: str
    amount: float
    date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    category: CategoryBill
    description: Optional[str] = None
    frequency: Frequency
    
class UpdateBill(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    categoty: Optional[CategoryBill] = None
    description: Optional[str] = None
    frequency: Optional[Frequency] = None
    date: Optional[datetime]

class AllBillResponse(BaseModel):
    bill_id: str = Field(alias="_id")
    title: str
    amount: float
    date: datetime
    category: str
    
class BillResponse(BaseModel):
    bill_id: str = Field(alias="_id")
    title: str
    amount: float
    date: str
    category: CategoryBill
    description: Optional[str] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True