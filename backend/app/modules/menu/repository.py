from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import select
from app.modules.menu.models import MenuCategory, MenuItem, BranchMenuItem,ItemType

class MenuRepository:

    @staticmethod
    def create_category(db: Session, data):
        category = MenuCategory(**data.dict())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def create_menu_item(db: Session, data):
        item = MenuItem(**data.dict())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def attach_item_to_branch(db: Session, data):

        existing = db.execute(
            select(BranchMenuItem).where(
                BranchMenuItem.branch_id == data.branch_id,
                BranchMenuItem.item_id == data.item_id
            )
        ).scalar_one_or_none()

        if existing:
            raise HTTPException(409, "Item already attached to branch")


        branch_item = BranchMenuItem(**data.dict())
        db.add(branch_item)
        db.commit()
        db.refresh(branch_item)
        return branch_item

    @staticmethod
    def update_branch_item(db: Session, branch_menu_item_id: int, data):
        item = db.get(BranchMenuItem, branch_menu_item_id)
        if data.price <= 0:
            raise HTTPException(400, "Price must be greater than zero")

        if data.price is not None:
            item.price = data.price
        if data.is_available is not None:
            item.is_available = data.is_available
        db.commit()
        return item
    
    @staticmethod
    def category_exists(db: Session, branch_id: int, category_name: str):
      return db.execute(
        select(MenuCategory)
        .where(
            MenuCategory.branch_id == branch_id,
            MenuCategory.category_name.ilike(category_name),
        )
      ).scalar_one_or_none()

    
    @staticmethod
    def list_branch_menu(db: Session, branch_id: int):
      rows = db.execute(
        select(
            BranchMenuItem.branch_menu_item_id,
            BranchMenuItem.price,
            BranchMenuItem.is_available,

            MenuCategory.category_name,

            MenuItem.item_name,
            MenuItem.image_url,
            MenuItem.item_description,

            ItemType.name.label("item_type"),
        )
        .join(MenuItem, MenuItem.item_id == BranchMenuItem.item_id)
        .join(MenuCategory, MenuCategory.category_id == BranchMenuItem.category_id)
        .join(ItemType, ItemType.item_type_id == MenuItem.item_type_id)
        .where(BranchMenuItem.branch_id == branch_id)
      ).all()


      return [
          {
              "branch_menu_item_id": r.branch_menu_item_id,
              "name": r.item_name,
              "price": float(r.price),
              "image_url": r.image_url,
              "food_type": r.item_type.lower(),
              "is_available": r.is_available,
              "category_name": r.category_name,
              
          }
          for r in rows
      ]


        
    @staticmethod
    def get_branch_menu_for_users(db: Session, branch_id: int):
        return db.execute(
            select(
                BranchMenuItem.branch_menu_item_id,
                BranchMenuItem.price,
                BranchMenuItem.is_available,

                MenuItem.item_id,
                MenuItem.item_name,
                MenuItem.image_url,

                MenuCategory.category_id,
                MenuCategory.category_name,

                ItemType.name.label("item_type")
            )
            .join(MenuItem, MenuItem.item_id == BranchMenuItem.item_id)
            .join(MenuCategory, MenuCategory.category_id == BranchMenuItem.category_id)
            .join(ItemType, ItemType.item_type_id == MenuItem.item_type_id)
            .where(BranchMenuItem.branch_id == branch_id)
            .where(BranchMenuItem.is_available == True)
            .where(MenuCategory.is_active == True)
        ).all()
