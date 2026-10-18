# Database & Analytics SQL Challenge

## Overview
You are tasked with querying an opportunities and applications platform schema to compute key performance indicators:
1. Candidate application funnel and conversion rates per role.
2. Top skills in demand by verified requirements.
3. Retention and response time analytics using window functions.

## Expected Queries
1. **Query 1 (Funnel)**: Return `role_title`, `total_applications`, `shortlisted_count`, and `conversion_rate` (percentage rounded to 1 decimal).
2. **Query 2 (Skill Demand)**: Return `skill_name`, `opportunity_count`, ranked by demand using `DENSE_RANK()`.
3. **Query 3 (Avg Response Time)**: Calculate the average hours between application submission and employer status update.

## Execution Environment
- PostgreSQL 15+ compatible SQL.
- Write standard SQL; avoid proprietary vendor-specific extensions.
