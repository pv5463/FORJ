"""
Reference solution for Mini Job Application API.
Fully implements validation, CRUD, status transitions, and error handling.
"""
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import uuid

app = FastAPI(title="Job Application API")

class ApplicationCreate(BaseModel):
    candidate_name: str = Field(..., min_length=1)
    email: EmailStr
    role_id: str = Field(..., min_length=1)
    experience_years: int = Field(..., ge=0)

class ApplicationResponse(BaseModel):
    id: str
    candidate_name: str
    email: str
    role_id: str
    experience_years: int
    status: str

# Storage dictionary
applications_db = {}

ALLOWED_STATUSES = {"pending", "shortlisted", "interviewing", "rejected"}

@app.post("/applications", status_code=201, response_model=ApplicationResponse)
async def create_application(app_data: ApplicationCreate):
    app_id = str(uuid.uuid4())
    record = {
        "id": app_id,
        "candidate_name": app_data.candidate_name,
        "email": str(app_data.email),
        "role_id": app_data.role_id,
        "experience_years": app_data.experience_years,
        "status": "pending",
    }
    applications_db[app_id] = record
    return record

@app.get("/applications/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: str):
    if application_id not in applications_db:
        raise HTTPException(status_code=404, detail="Application not found")
    return applications_db[application_id]

@app.get("/applications", response_model=List[ApplicationResponse])
async def list_applications(role_id: Optional[str] = Query(None)):
    if role_id:
        return [app for app in applications_db.values() if app["role_id"] == role_id]
    return list(applications_db.values())

@app.put("/applications/{application_id}/status", response_model=ApplicationResponse)
async def update_status(application_id: str, payload: dict):
    if application_id not in applications_db:
        raise HTTPException(status_code=404, detail="Application not found")

    new_status = payload.get("status")
    if not new_status or new_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{new_status}'. Must be one of: {', '.join(sorted(ALLOWED_STATUSES))}"
        )

    applications_db[application_id]["status"] = new_status
    return applications_db[application_id]
