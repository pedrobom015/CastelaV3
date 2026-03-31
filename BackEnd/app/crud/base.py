from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.base import Base


ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model
        self.pk_name = model.__mapper__.primary_key[0].name

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        query = db.query(self.model).filter(getattr(self.model, self.pk_name) == id)
        if hasattr(self.model, "deleted_at"):
            query = query.filter(self.model.deleted_at == None)
        return query.first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        query = db.query(self.model)
        if hasattr(self.model, "deleted_at"):
            query = query.filter(self.model.deleted_at == None)
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType, user_id: Optional[int] = None) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        if user_id and hasattr(self.model, "created_by"):
            obj_in_data["created_by"] = user_id
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
        user_id: Optional[int] = None
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        if user_id and hasattr(self.model, "updated_by"):
            update_data["updated_by"] = user_id

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int, user_id: Optional[int] = None) -> ModelType:
        db_obj = db.query(self.model).get(id)
        if db_obj:
            if hasattr(self.model, "deleted_at"):
                setattr(db_obj, "deleted_at", datetime.now(timezone.utc))
                if user_id and hasattr(self.model, "deleted_by"):
                    setattr(db_obj, "deleted_by", user_id)
                db.add(db_obj)
            else:
                db.delete(db_obj)
            db.commit()
        return db_obj