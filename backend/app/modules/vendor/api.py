from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.vendor.schemas import CafeteriaCreate, CafeBranchCreate
from app.modules.vendor.service import VendorService,CafeService
from app.modules.vendor.schemas import CafeForUserResponse

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.post("/cafeterias")
def create_cafeteria(
    data: CafeteriaCreate,
    db: Session = Depends(get_db)
):
    return VendorService.create_cafeteria(db, data)

@router.get("/cafeterias")
def list_cafeterias(db: Session = Depends(get_db)):
    return VendorService.list_cafeterias(db)

@router.post("/branches")
def create_branch(
    data: CafeBranchCreate,
    db: Session = Depends(get_db)
):
    return VendorService.create_branch(db, data)

@router.get("/cafeterias/{cafe_id}/branches")
def list_branches(
    cafe_id: int,
    db: Session = Depends(get_db)
):
    return VendorService.list_branches(db, cafe_id)


@router.get("/cafes/for-user", response_model=list[CafeForUserResponse],)
def cafes_for_user(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return CafeService.get_for_user(db, user.user_id)
