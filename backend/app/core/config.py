from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    MONGODB_URI: str
    MONGODB_NAME: str
    MAX_SESSIONS_PER_USER: int
    SESSION_SECRET: str
    ENVIROMENT: str
    
    @property
    def MONGODB_URL(self) -> str:
        return self.MONGODB_URI
    
    @property
    def CORS_ORIGIN(self) -> List[str]:
        if self.ENVIROMENT == "production":
            return [""]
        else:
            return ["http://localhost:4321", "http://127.0.0.1:4321", "http://localhost:3000", "http://127.0.0.1", "http://localhost5173"]
        
    class Config:
        env_file = ".env"
        case_sensitive = False
        
settings = Settings()