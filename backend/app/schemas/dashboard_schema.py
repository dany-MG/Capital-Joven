from pydantic import BaseModel

class BalancePerMonth(BaseModel):
    month: int
    year: int

class BalanceResponse(BaseModel):
    incomes: float
    bills: float
    balance: float