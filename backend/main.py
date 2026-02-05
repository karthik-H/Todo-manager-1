from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import Task, TaskCreate
import database

app = FastAPI(title="Personal To-Do Manager API")

from config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/tasks", response_model=List[Task])
async def read_tasks():
    return database.get_tasks()

@app.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    # Validate all required fields
    if not task.title or not task.description or not task.priority or not task.category or not task.due_date:
        raise HTTPException(status_code=400, detail="All fields (title, description, priority, due date, tag) are required.")
    return database.add_task(task)

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task: TaskCreate):
    updated_task = database.update_task(task_id, task)
    if updated_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    success = database.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
