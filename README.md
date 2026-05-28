# Flow Normalizer — ESG Data Normalization & Review Platform

## Overview

Flow Normalizer is an ESG data ingestion, normalization, validation, and analyst review platform built for the Breathe ESG technical assignment.

The platform enables ingestion of ESG datasets from multiple heterogeneous sources, normalizes them into a common schema, validates anomalies, allows analyst review, and provides analytics on uploaded data.

---

## Features

### 1. CSV Upload & Normalization

Supports ESG datasets from:

- SAP Fuel Procurement Data
- Utility Electricity Consumption Data
- Corporate Travel Data

Uploaded datasets are:

- Parsed
- Validated
- Normalized into a common schema
- Stored in PostgreSQL

Supported CSV formats:

- Standard CSV format
- Single-column malformed CSV format

---

### 2. Validation System

Each record is automatically validated and assigned one of the following statuses:

#### Valid

Normal record without anomalies.

#### Suspicious

Used for anomalies such as:

- Negative values
- Invalid routes
- Zero travel distance
- Unknown mappings

#### Failed

Used when required data is missing, such as:

- Missing fuel type
- Missing airport code
- Missing electricity usage

---

### 3. Analyst Review Workflow

Each uploaded batch can be reviewed by an analyst.

Available actions:

- Edit Record
- Approve Record
- Reject Record
- Delete Record

---

### 4. Final Audit

A batch can be marked as audited.

After audit:

- Editing disabled
- Approve disabled
- Reject disabled
- Delete disabled

This ensures audit integrity.

---

### 5. Upload History

View all uploaded and normalized records.

Supports filtering by:

- Source
- Status
- Activity Type
- Audited / Not Audited

---

### 6. Analytics Dashboard

Analytics include:

- Source Distribution
- Status Distribution
- Scope Distribution
- Quantity by Source
- Audited vs Non-Audited Records

KPIs:

- Total Records
- Approved Records
- Failed Records
- Audited Records

---

# Tech Stack

## Frontend

- React
- Tailwind CSS
- React Router DOM
- Axios
- React Icons
- Recharts

## Backend

- Django
- Django REST Framework
- Pandas
- PostgreSQL
- django-cors-headers

## Deployment

- Frontend → Vercel
- Backend → Render
- Database → Render PostgreSQL

---

# Project Flow

```text
CSV Upload
      ↓
Parsing
      ↓
Validation
      ↓
Normalization
      ↓
Database Storage
      ↓
Review Page
      ↓
Approve / Reject / Edit
      ↓
Final Audit
      ↓
Analytics Dashboard
```

---

# Normalized Schema

All source-specific data is converted into a common schema:

| Field            | Description             |
| ---------------- | ----------------------- |
| id               | Record ID               |
| batch            | Upload batch            |
| source           | Dataset source          |
| activity_type    | ESG activity            |
| activity_details | Context details         |
| quantity         | Value                   |
| unit             | Unit                    |
| scope            | ESG scope               |
| status           | valid/suspicious/failed |
| issue            | Validation issue        |
| audited          | Audit status            |
| created_at       | Timestamp               |

---

# ESG Scope Mapping

### SAP

- Scope 1

Example:

```text
Diesel Consumption
```

---

### Utility

- Scope 2

Example:

```text
Electricity Consumption
```

---

### Travel

- Scope 3

Example:

```text
Flight Travel
```

---

# Running Locally

## 1. Clone Repository

```bash
git clone <repo-url>
cd Flow-Normalizer
```

---

## 2. Backend Setup

Move to backend:

```bash
cd server
```

Create virtual environment:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### Mac/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. PostgreSQL Setup (Required)

This project uses PostgreSQL as the database.

You need PostgreSQL running locally OR a PostgreSQL cloud database (Render/Supabase/Neon/etc).

Install PostgreSQL:

https://www.postgresql.org/download/

Create a database.

Example:

```text
flow_normalizer
```

---

## 4. Backend Environment Variables

Create a `.env` file inside the `server/` folder.

Example:

```env
SECRET_KEY=your_secret_key

DEBUG=True

DATABASE_URL=postgresql://username:password@localhost:5432/flow_normalizer
```

Example for Render PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@host/database
```

---

## 5. Apply Migrations

Run:

```bash
python manage.py migrate
```

Start backend:

```bash
python manage.py runserver
```

Backend runs at:

```text
http://localhost:8000
```

---

## 6. Frontend Setup

Move to client folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# Important Backend Dependencies

Installed through:

```bash
pip install -r requirements.txt
```

Important packages:

```text
Django
djangorestframework
pandas
psycopg2-binary
django-cors-headers
dj-database-url
python-dotenv
gunicorn
```

---

# Sample Dataset Formats

### SAP

Columns:

```text
document_id
plant_code
fuel_type
quantity
unit
posting_date
vendor
cost_center
```

---

### Utility

Columns:

```text
meter_id
facility_name
usage_kwh
billing_month
vendor
```

---

### Travel

Columns:

```text
employee_id
origin_airport
destination_airport
travel_date
travel_type
```

---

# API Routes

### Upload CSV

```text
/api/upload/<source>/
```

Examples:

```text
/api/upload/sap/
/api/upload/utility/
/api/upload/travel/
```

---

### Review Batch

```text
/api/review/<batch_id>/
```

---

### Upload History

```text
/api/uploads/
```

---

### Final Audit

```text
/api/audit/<batch_id>/
```

---

# Notes

- I have provided the datasets used during development/testing of this project for easier evaluation.
- The system supports both standard CSV files and malformed single-column CSV formats.
- Travel routes are mapped using predefined airport distance mappings.
- Missing required fields are marked as `failed`.
- Invalid, negative, or suspicious values are marked as `suspicious`.

### Performance Note

If the application takes some time to load initially, it may be because a large amount of upload data is already present in the database and/or due to Render cold starts (free-tier behavior). Please allow a few moments for uploads, analytics, and history pages to load.

---

## Author

Divya Kumar
