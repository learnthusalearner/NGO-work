# NayePankh Volunteer Management and Document Automation System

Production-ready starter implementation for a decoupled FastAPI + SQLite backend and a React + Tailwind CSS frontend.

## Project Structure

```text
nayepankh-volunteer-system/
  backend/
    database.py
    main.py
    requirements.txt
    templates/
  frontend/
    src/
    package.json
    tailwind.config.js
```

## Backend

The backend exposes volunteer CRUD-style operations and certificate automation. It creates `backend/data/volunteers.db` on first startup and creates `backend/templates/certificate_template.docx` automatically if no custom template exists.

### Run Locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### API Endpoints

```text
GET    /api/health
POST   /api/volunteers
GET    /api/volunteers?search=aarav&role=Tech%20Intern
PATCH  /api/volunteers/{id}/status
POST   /api/volunteers/{id}/generate-certificate
```

### Volunteer Payload

```json
{
  "name": "Aarav Mehta",
  "email": "aarav@example.org",
  "role": "Tech Intern",
  "duration": "3 Months"
}
```

Supported roles are `Content Writer`, `Social Media Manager`, `Field Volunteer`, `Fundraising Coordinator`, and `Tech Intern`.

Supported durations are `1 Month`, `2 Months`, `3 Months`, and `6 Months`.

## Frontend

The frontend is a Vite SPA with three local-state views:

- Onboard New Volunteer
- Volunteer Roster
- Impact Analytics

### Run Locally

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

The default API base URL is `http://localhost:8000`. Override it in `frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Vite 8 requires Node.js `20.19+` or `22.12+`.

## Certificate Templates

Place a custom Word template at:

```text
backend/templates/certificate_template.docx
```

The generator replaces these placeholders wherever they appear in paragraphs or table cells:

```text
{{NAME}}
{{ROLE}}
{{DURATION}}
```

If the template is missing, the backend creates a fallback template automatically.
