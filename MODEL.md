# MODEL.md

# Data Model & Processing Flow

## Overview

The project is designed around the idea of handling ESG data coming from multiple heterogeneous sources and converting them into a single normalized format for easier review, analytics, and auditing.

Initially, the system accepts three different input sources:

1. **SAP Fuel Procurement Data**
2. **Utility Electricity Consumption Data**
3. **Corporate Travel Data**

Each source has its own schema and fields, which makes direct comparison difficult. To solve this, all uploaded records are normalized into a common structure and stored together in a single table.

This allows the platform to treat all ESG records consistently regardless of where the data originally came from.

---

# High-Level Flow

```text
CSV Upload (SAP / Utility / Travel)
                ↓
          Source Validation
                ↓
         Data Normalization
                ↓
       Common Normalized Table
                ↓
         Analyst Review Page
                ↓
      Approve / Reject / Edit
                ↓
            Final Audit
                ↓
        Analytics Dashboard
```

---

# Input Data Sources

The platform currently supports three ESG-related sources.

## 1. SAP Data

SAP data mainly focuses on fuel procurement and is mapped to:

**Scope 1 emissions**

Typical fields:

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

Example:

```text
Diesel procurement at Plant A
```

---

## 2. Utility Data

Utility datasets capture electricity usage and are mapped to:

**Scope 2 emissions**

Typical fields:

```text
meter_id
facility_name
usage_kwh
billing_month
vendor
```

Example:

```text
Electricity consumed at Plant B
```

---

## 3. Travel Data

Travel datasets contain corporate travel information and are mapped to:

**Scope 3 emissions**

Typical fields:

```text
employee_id
origin_airport
destination_airport
travel_date
travel_type
```

Example:

```text
DEL → BLR flight
```

---

# Normalized Data Model

After upload, all source-specific records are converted into a shared normalized structure.

This normalized data is visible in the **Uploads page**, where records from all sources are stored together in a unified format.

The common schema used is:

| Field            | Description                              |
| ---------------- | ---------------------------------------- |
| id               | Unique record ID                         |
| batch            | Upload batch identifier                  |
| source           | Original source (sap / utility / travel) |
| activity_type    | ESG activity name                        |
| activity_details | Additional contextual information        |
| quantity         | Numeric ESG quantity                     |
| unit             | Unit of measurement                      |
| scope            | ESG scope classification                 |
| status           | Record validation status                 |
| issue            | Validation issue description             |
| audited          | Audit lock status                        |
| created_at       | Timestamp                                |

### Example

Instead of keeping separate structures:

#### SAP

```text
plant_code
fuel_type
vendor
quantity
```

#### Utility

```text
facility_name
usage_kwh
vendor
```

#### Travel

```text
origin_airport
destination_airport
distance
```

everything is transformed into:

```text
activity_type
activity_details
quantity
unit
scope
status
```

This makes filtering, reviewing, and analytics much simpler.

---

# Validation Logic

Every uploaded record passes through a validation layer.

The system assigns one of the following statuses:

### Valid

The record looks correct and no anomaly is found.

Example:

```text
Positive electricity usage
Valid travel route
Proper fuel procurement entry
```

---

### Suspicious

Suspicious records are not immediately rejected because they may still be fixable through analyst review.

Typical reasons:

- Missing quantity
- Negative values
- Zero or invalid travel distance
- Unknown airport route mapping

For example:

If electricity usage is missing:

```text
usage_kwh = null
```

the system marks it as:

```text
suspicious
```

instead of failing it directly.

The reason is that the analyst/reviewer may already know the correct value and can edit the record to fix it.

Similarly:

```text
quantity < 0
```

or

```text
distance = 0
```

are marked suspicious.

---

### Failed

Records with missing critical information are treated as failed.

Examples:

- Missing airport code
- Missing source-specific required fields
- Missing fuel type
- Missing important identifiers

These are directly marked as:

```text
failed
```

because there is insufficient information to trust the record.

---

# Travel Distance Mapping

For travel data, airport-to-airport mappings are maintained in the backend.

Example:

```text
DEL-BLR → 1740 km
DEL-BOM → 1150 km
```

This mapping is used to automatically determine travel distance during normalization.

Currently, predefined mappings are used for simplicity and consistency.

However, in a production-scale system this could also be implemented using airport coordinates from a third-party geolocation API or aviation service, where distances are calculated dynamically.

For example:

```text
Airport Coordinates
        ↓
Haversine Distance Formula
        ↓
Travel Distance Computation
```

This would make the system scalable for all possible airport combinations.

---

# Analyst Review Workflow

After upload, records are available on the **Review page**.

Analysts can:

- Edit records
- Approve records
- Reject records
- Delete records

The goal is to ensure human review before final acceptance.

This step is important because ESG datasets may contain inconsistencies or incomplete values that require manual verification.

---

# Final Audit

After review, batches can be audited.

Once a batch is audited:

- Editing is disabled
- Approve/Reject is disabled
- Delete is disabled

In simple words:

> audited data becomes immutable

This ensures audit integrity and prevents accidental modification of finalized records.

---

# Uploads Page

The **Uploads page** acts as the central normalized repository.

Instead of storing SAP, Utility, and Travel separately, all normalized data is visible together.

This makes it easy to:

- Search records
- Filter by source
- Filter by status
- Review audit state
- Compare data across sources

---

# Analytics Dashboard

An analytics page is included to provide a quick overview of the uploaded ESG data.

Charts include:

### Pie Charts

- Source distribution
- Status distribution
- Audited vs non-audited records

### Bar Graphs

- Scope distribution
- Quantity by source

The dashboard helps quickly identify:

- approved records
- rejected records
- suspicious records
- failed records
- valid records

without manually checking the raw data.

---

# Design Philosophy

The overall goal of the model is:

> Convert heterogeneous ESG data into one normalized, reviewable, auditable system.

Instead of treating every source separately, the platform creates a common workflow:

```text
Source Data
      ↓
Normalization
      ↓
Validation
      ↓
Review
      ↓
Audit
      ↓
Analytics
```

This makes ESG reporting easier, more scalable, and easier to monitor.
