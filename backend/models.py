from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

class Category(str, Enum):
    work = "Work"
    personal = "Personal"
    study = "Study"

class TaskBase(BaseModel):
    title: str
    description: str
    priority: Priority
    category: Category
    due_date: date
    completed: bool = False

    class Config:
        orm_mode = True

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
