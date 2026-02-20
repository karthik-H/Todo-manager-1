# How to Run Frontend (React + Vite)

## 1. Install dependencies

```bash
cd frontend
npm install
```

## 2. Configure environment variables

Edit `.env` as needed. Default:

- VITE_API_URL=http://localhost:8000

## 3. Start the development server

```bash
npm run dev
```

## 4. Notes
- Backend API URL is read from `.env`.
- All fields are required when adding a new task.
- Ensure backend is running and CORS is properly configured.
