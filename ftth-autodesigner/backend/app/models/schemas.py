from pydantic import BaseModel
from typing import Optional

class ODCBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    capacity: Optional[int] = None  # contoh kapasitas port

class ODC(ODCBase):
    id: int

    class Config:
        orm_mode = True
