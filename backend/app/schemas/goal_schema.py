from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CreateGoal(BaseModel):
    title: str
    target_amount: float = Field(..., gt=0)
    current_amount: float = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    class Config:
        from_attributes = True
        populate_by_name = True

class AddAmountGoal(BaseModel):
    amount: float = Field(..., gt=0)

class UpdateGoal(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = Field(default=None, gt=0)
    current_amount: Optional[float] = Field(default=None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None

class ResponseGoal(BaseModel):
    id: str
    title: str
    target_amount: float 
    current_amount: float = 0
    progress: float
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True