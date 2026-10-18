# Mini Job Application API

## Overview
Build a high-performance REST API for job applications using Python and FastAPI (or standard library HTTP). The API allows candidates to apply for job postings, validates application fields, and tracks status.

## Requirements
1. **POST /applications**:
   - Accepts `{ "candidate_name": str, "email": str, "role_id": str, "experience_years": int }`
   - Validates that email is valid and `experience_years >= 0`.
   - Returns 201 Created with `{ "id": str, "status": "pending", ... }`.
2. **GET /applications/{id}**:
   - Returns the application object or 404 if not found.
3. **GET /applications?role_id={role_id}**:
   - Filters applications by `role_id`.
4. **PUT /applications/{id}/status**:
   - Updates status to `shortlisted`, `rejected`, or `interviewing`.
   - Returns 400 for invalid status.
5. **Database / Persistence**:
   - Data must be stored in memory or SQLite and persist across queries in the same process.

## Rules
- You may use FastAPI, Pydantic, SQLite, or standard libraries.
- Write clean, modular, and well-documented code.
- Provide clear error responses with descriptive messages.
