from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import ODC, ODCBase

router = APIRouter(prefix="/odc", tags=["ODC"])

# Simpan data sementara di memory (kalau belum pakai DB)
odc_list = []
counter = 1

@router.post("/", response_model=ODC)
def create_odc(odc: ODCBase):
    global counter
    new_odc = ODC(id=counter, **odc.dict())
    odc_list.append(new_odc)
    counter += 1
    return new_odc

@router.get("/", response_model=List[ODC])
def get_all_odc():
    return odc_list
