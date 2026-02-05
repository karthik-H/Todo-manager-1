# How to Run Backend (FastAPI)

## 1. Install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2. Configure environment variables

Edit `.env` as needed. Default values:

- API_PORT=8000
- CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
- DB_FILE=tasks.json

## 3. Start the server

```bash
uvicorn main:app --host 0.0.0.0 --port $API_PORT
```

## 4. API Endpoints

- `GET /tasks` — List all tasks
- `POST /tasks` — Create a new task (all fields required)
- `PUT /tasks/{task_id}` — Update a task
- `DELETE /tasks/{task_id}` — Delete a task

## 5. Notes
- All five fields (title, description, priority, due date, tag) are required for task creation.
- CORS is configured for frontend origins.
- Tasks are stored in `tasks.json` by default.
