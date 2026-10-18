"""
Starter code for Mini Job Application API.
Implement the required endpoints using FastAPI.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid

app = FastAPI(title="Job Application API")

class ApplicationCreate(BaseModel):
    candidate_name: str
    email: EmailStr
    role_id: str
    experience_years: int

class ApplicationResponse(BaseModel):
    id: str
    candidate_name: str
    email: str
    role_id: str
    experience_years: int
    status: str

# In-memory storage
applications_db = {}

@app.post("/applications", status_code=201)
async def create_application(app_data: ApplicationCreate):
    # TODO: Implement validation and storage
    pass

@app.get("/applications/{application_id}")
async def get_application(application_id: str):
    # TODO: Implement get single application
    pass

@app.get("/applications")
async def list_applications(role_id: Optional[str] = None):
    # TODO: Implement list with role_id filter
    pass

@app.put("/applications/{application_id}/status")
async def update_status(application_id: str, payload: dict):
    # TODO: Implement status update
    pass
