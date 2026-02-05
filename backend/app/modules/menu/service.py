from sqlalchemy.orm import Session
from app.modules.menu.repository import MenuRepository
from fastapi import HTTPException

class MenuService:

    @staticmethod
    def create_category(db: Session, data):
        exists = MenuRepository.category_exists(
            db,
            branch_id=data.branch_id,
            category_name=data.category_name,
        )

        if exists:
          raise HTTPException(
            status_code=409,
            detail="Category already exists for this branch",
           )

        return MenuRepository.create_category(db, data)

    @staticmethod
    def create_menu_item(db: Session, data):
        return MenuRepository.create_menu_item(db, data)

    @staticmethod
    def attach_item_to_branch(db: Session, data):
        return MenuRepository.attach_item_to_branch(db, data)

    @staticmethod
    def update_branch_item(db: Session, branch_menu_item_id: int, data):
        return MenuRepository.update_branch_item(db, branch_menu_item_id, data)

    @staticmethod
    def list_branch_menu(db: Session, branch_id: int):
        return MenuRepository.list_branch_menu(db, branch_id)
    
    @staticmethod
    def list_branch_menu_for_users(db: Session, branch_id: int):
        rows = MenuRepository.get_branch_menu_for_users(db, branch_id)

        categories = {}

        for r in rows:
            if r.category_id not in categories:
                categories[r.category_id] = {
                    "category_id": r.category_id,
                    "category_name": r.category_name,
                    "items": []
                }

            categories[r.category_id]["items"].append({
                "branch_menu_item_id": r.branch_menu_item_id,
                "item_id": r.item_id,
                "name": r.item_name,
                "price": float(r.price),
                "image": r.image_url,
                "is_veg": r.item_type.lower() == "veg",
                "is_available": r.is_available,
                "category_name": r.category_name,
            })

        return {
            "branch_id": branch_id,
            "categories": list(categories.values())
        }
    


