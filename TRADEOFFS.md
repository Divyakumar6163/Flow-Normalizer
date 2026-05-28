# TRADEOFFS.md

# Engineering Tradeoffs

This document explains the major engineering tradeoffs made during development.

The goal of the project was to build a practical ESG normalization and review system within a limited scope and timeline while keeping the application understandable, fast enough to use, and easy to evaluate.

Rather than over-engineering every component, some decisions were intentionally simplified.

---

# 1. Not Using External APIs for Airport Distance Calculation

## What Was Not Built

The travel module does not use a third-party API to dynamically calculate airport distances.

Instead, airport-to-airport distance mapping is handled directly in the backend using predefined mappings.

Example:

```text
DEL-BLR → 1740 km
DEL-BOM → 1150 km
BLR-HYD → 500 km
```

---

## Why This Decision Was Taken

Initially, dynamic distance calculation through APIs or coordinate-based computation was considered.

A possible approach could have been:

```text
Airport Code
      ↓
External API / Coordinates
      ↓
Latitude & Longitude
      ↓
Distance Calculation
```

However, this was intentionally avoided for a few reasons:

### 1. Small Number of Airports

The dataset involved only a relatively small set of airport combinations.

Because of this, predefined mappings were sufficient and easier to manage.

Using APIs for a small controlled dataset would introduce unnecessary complexity.

---

### 2. Faster and More Reliable Processing

API calls introduce:

- network latency
- dependency failures
- rate limits
- retry logic

Since uploads may contain many rows, making repeated external requests during normalization would slow down processing.

Example:

```text
100 rows
↓
100 API calls
↓
Longer upload time
```

By using backend mappings:

```text
dictionary lookup → O(1)
```

distance retrieval becomes almost instant.

---

### 3. Better Render Performance

The application is deployed on Render free-tier infrastructure.

External API calls during uploads would increase:

- request time
- backend render time
- cold start delays

This could make uploads noticeably slower.

Keeping calculations local reduces render overhead and improves responsiveness.

---

## What I Would Do in Production

If this were production-scale with thousands of airports:

I would replace static mappings with:

- airport coordinates
- dynamic geolocation calculation
- caching layer

A scalable architecture would look like:

```text
Airport Code
      ↓
Coordinates Service
      ↓
Distance Calculation
      ↓
Cache Result
```

This would support global travel without maintaining manual mappings.

---

# 2. Not Fully Automating Data Correction (Human-in-the-Loop Review)

## What Was Not Built

The system does not automatically fix suspicious data.

Instead, suspicious records are intentionally routed to human review.

For example:

```text
usage_kwh = missing
quantity = -500
distance = 0
```

are flagged instead of silently corrected.

---

## Why This Decision Was Taken

ESG data often affects compliance, reporting, and audits.

Automatically "guessing" missing values can introduce incorrect reporting.

For example:

Suppose:

```text
usage_kwh = missing
```

The system could attempt:

```text
average usage
median usage
previous month's usage
```

But this becomes assumption-heavy.

Instead, the platform follows:

> human-in-the-loop validation

meaning:

```text
system flags issue
        ↓
human reviews
        ↓
human edits or approves
```

This makes the process safer and easier to trust.

---

## Why Editing Was Preferred

A reviewer may already know the correct value.

Example:

```text
usage_kwh = missing
```

Reviewer knows:

```text
2500
```

Instead of forcing re-upload, the record can simply be edited.

This keeps the workflow practical.

---

## What I Would Improve Later

Future improvements could include:

- AI-assisted suggestions
- anomaly detection
- historical prediction

Example:

```text
"Previous usage ~2450 kWh.
Suggested value: 2500?"
```

while still keeping final approval with humans.

---

# 3. Not Using NoSQL Database

## What Was Not Built

The system intentionally does not use a NoSQL database such as MongoDB.

Instead, PostgreSQL was chosen.

---

## Why This Decision Was Taken

At first glance, NoSQL seems attractive because:

- CSV schemas vary
- different sources have different fields
- flexible JSON storage is easy

However, after evaluating the use case, a relational model was preferred.

---

### Reason 1: Strong Data Consistency

The application revolves around:

```text
review
approval
rejection
audit
analytics
```

These workflows benefit from structured relationships.

Example:

```text
ImportBatch
    ↓
Normalized Records
    ↓
Audit State
```

Relational consistency matters here.

---

### Reason 2: Analytics Become Easier

The dashboard requires aggregation queries like:

```text
approved records
failed records
source distribution
status distribution
quantity totals
```

SQL handles aggregation naturally.

Example:

```sql
COUNT(*)
GROUP BY status
SUM(quantity)
```

In NoSQL, this often becomes more complex or less efficient depending on schema design.

---

### Reason 3: Audit Integrity

Post-audit locking depends on predictable structured updates.

Example:

```text
audited = true
```

then:

```text
editing disabled
```

A relational model made this easier to reason about.

---

### Reason 4: NoSQL Would Add Unnecessary Flexibility

Although SAP, Utility, and Travel datasets have different fields, they are eventually normalized into a common schema.

Meaning:

```text
heterogeneous input
        ↓
common output
```

Because normalized data becomes structured, PostgreSQL fits naturally.

---

## Problems Avoided by Not Choosing NoSQL

Potential issues avoided:

- inconsistent document structure
- harder aggregation logic
- schema drift
- duplicated fields
- weaker relational consistency for audits

---

## What I Would Consider in Future

If the platform needed to ingest:

```text
hundreds of dynamic ESG schemas
deeply nested JSON reports
unstructured supplier data
```

then hybrid storage could make sense:

```text
PostgreSQL → normalized reviewed data

MongoDB → raw ingestion storage
```

This would combine flexibility with analytical reliability.

---

# Final Thought

The guiding principle behind these tradeoffs was:

> prefer simplicity, explainability, and reviewability over over-engineering.

The project intentionally prioritizes:

- deterministic behavior
- human review
- auditability
- maintainability
- practical performance

instead of building highly complex automation too early.
