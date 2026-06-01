from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: EmailStr
    university: str
    
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)
    university: Optional[str] = None
    current_password: Optional[str] = None
    
class UserInDB(UserBase):
    id_user: str = Field(alias="_id")
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserLoginResponse(BaseModel):
    token: str
    token_type: str = "session"
    
class UserRegisterResponse(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: EmailStr
    message: str    
    
class UserProfileResponse(BaseModel):
    id_user : str = Field(alias="_id")
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: EmailStr
    university: str

    class Config:
        from_attributes = True
        populate_by_name = True