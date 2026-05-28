# SOURCES.md

# Data Sources, Research, Learnings & Real-World Assumptions

This document explains:

- what real-world source formats were researched
- what was learned from them
- why the sample datasets were designed the way they were
- what deployment and ingestion problems appeared during implementation
- what would likely break in a production-scale deployment

The overall goal was to build a realistic ESG ingestion pipeline rather than simply uploading clean CSV files.

---

# Why Research Was Needed

The three input datasets (SAP procurement, utility electricity, and travel) come from very different operational systems.

In practice, ESG reporting systems do not receive clean and standardized data.

Instead, they usually receive:

- ERP exports
- billing CSVs
- vendor spreadsheets
- inconsistent reports
- incomplete records

Because of this, some research was done into what real-world enterprise formats look like and how ESG reporting platforms usually normalize them.

Useful references explored included:

- [SAP Sustainability Solutions](https://www.sap.com/products/scm/sustainability.html?utm_source=chatgpt.com)
- [GHG Protocol Standards](https://ghgprotocol.org/standards?utm_source=chatgpt.com)
- [EPA Greenhouse Gas Guidance](https://www.epa.gov/climateleadership/ghg-emission-factors-hub?utm_source=chatgpt.com)
- [OpenFlights Airport Database](https://openflights.org/data.html?utm_source=chatgpt.com)
- [IATA Airport Codes Reference](https://www.iata.org/en/publications/directories/code-search/?utm_source=chatgpt.com)

These references helped determine:

- expected fields
- realistic validation assumptions
- ESG scope mapping
- travel distance logic
- operational inconsistencies

---

# 1. SAP Fuel Procurement Source

## What Was Researched

Real-world SAP procurement exports and ERP-like fuel transaction records.

Typical SAP sustainability reporting includes:

- fuel type
- quantity
- unit
- plant/location
- supplier/vendor
- posting information

Research showed that enterprise systems usually export structured tabular data, but fields often contain missing values or inconsistent naming.

Example patterns researched:

```text id="s3jndq"
Diesel
Petrol
Natural Gas
Coal
```

with procurement quantity and supplier context.

---

## What Was Learned

The most useful fields for ESG normalization are:

```text id="5q2d3q"
fuel_type
quantity
unit
plant_code
vendor
```

because they directly contribute to:

```text id="hr7nzl"
activity
quantity
scope
context
```

It was also learned that ERP systems contain large amounts of operational metadata that may not be useful for initial ESG normalization.

Example:

```text id="3uvs2l"
document_id
posting_date
cost_center
```

These help trace transactions internally but are not required for a first-pass ESG pipeline.

---

## Sample Dataset Design

The sample SAP dataset intentionally contains:

### Valid rows

Example:

```text id="sfr9je"
Diesel
Plant A
quantity = 500
```

to simulate normal procurement.

### Suspicious rows

Example:

```text id="nmz6ho"
quantity = -100
```

to simulate ERP export mistakes or human entry errors.

### Failed rows

Example:

```text id="f1xkpz"
fuel_type missing
```

to simulate incomplete enterprise records.

The purpose was to make analyst review meaningful instead of uploading only clean data.

---

## What Could Break in Production

Potential issues:

- inconsistent column names
- different SAP export templates
- unit inconsistency

Example:

```text id="7ccv2x"
litres
liters
L
kg
```

A production system would require stronger schema mapping and unit normalization.

---

# 2. Utility Electricity Source

## What Was Researched

Electricity consumption reporting and utility billing exports.

Typical datasets include:

```text id="xhs8xe"
meter_id
facility_name
usage_kwh
billing_month
vendor
```

Research around sustainability reporting showed electricity consumption contributes to:

> Scope 2 emissions

Most enterprise reporting pipelines use electricity usage as a core sustainability metric.

---

## What Was Learned

A major learning was:

> utility data is often messy

Real billing exports may include:

- blank rows
- missing usage
- malformed CSVs
- inconsistent formatting

During implementation, one major issue encountered was:

```text id="fn6y4l"
CSV parsed into one column
```

instead of structured columns.

Example:

Instead of:

```text id="xzv0kh"
meter_id,facility_name,usage_kwh
```

the parser loaded:

```text id="xrb0gt"
"meter_id,facility_name,usage_kwh"
```

as a single string column.

Because of this, support was added for:

```text id="y06p1w"
normal CSV
single-column malformed CSV
```

This became an important robustness improvement.

---

## Sample Dataset Design

The utility dataset intentionally includes:

### Missing quantity

Example:

```text id="fpkv8u"
usage_kwh = null
```

This is treated as:

```text id="z1s61v"
suspicious
```

instead of failed.

Reason:

Human reviewers may know the correct number and edit it.

### Negative usage

Example:

```text id="kvlmdz"
-500
```

to simulate bad exports or incorrect accounting signs.

### Valid rows

Normal electricity usage.

---

## What Could Break in Production

Real deployments may face:

- inconsistent units
- duplicated meter IDs
- vendor-specific formats
- malformed exports

Example:

kWh
MWh
Wh

````

would require conversion logic.

---

# 3. Corporate Travel Source

## What Was Researched

Travel emissions reporting and airport route tracking.

Typical travel ESG reporting uses:

```text id="2j6j6r"
origin_airport
destination_airport
travel_date
travel_type
````

Research references included:

- OpenFlights airport datasets
- IATA airport codes
- travel emissions methodology

---

## What Was Learned

A major learning was:

> travel distance is usually not directly available

Instead, emissions systems infer distance using:

```text id="ux4yeo"
origin → destination
```

mapping.

Initially, coordinate-based APIs were considered.

Possible approach:

```text id="pt4h7n"
airport code
↓
coordinates API
↓
distance calculation
```

However, this was deliberately avoided.

Since the airport set was small, backend mapping was simpler and faster.

Example:

```text id="mwdqmp"
DEL-BLR → 1740 km
BLR-HYD → 500 km
```

This avoided:

- API latency
- request failures
- slower rendering
- external dependency risk

---

## Sample Dataset Design

The travel sample intentionally includes:

### Missing airports

Example:

```text id="pru1cl"
PNQ-0
```

This becomes:

```text id="qk2miv"
failed
```

because route trust is impossible.

### Unknown routes

Example:

CCU-MAA → not mapped

```

This becomes:

suspicious
```

because the route may still be valid but unavailable in mapping.

### Valid travel rows

Example:

DEL-BLR

```

---

## What Could Break in Production

Real travel systems may include:

- international airports
- multiple travel modes
- route chains

Example:

DEL → DXB → LHR
```

Current implementation assumes:

single-flight mapping

```

A production system would require:

- dynamic distance computation
- coordinate APIs
- layover handling
- emissions factor logic

---

# Deployment Learnings & Problems Faced

Several deployment and debugging issues occurred during implementation.

### 1. PostgreSQL Connectivity

While deploying to Render:

connection timed out
```

issues occurred when local development attempted connecting to Render PostgreSQL.

This highlighted the importance of:

DATABASE_URL
environment setup
migration consistency

```

---

### 2. Dependency Issues

Common issues encountered:

ModuleNotFoundError
No module named django
No module named rest_framework
```

This led to improving:

requirements.txt
environment setup
README clarity

```

---

### 3. CSV Parsing Failures

Some datasets failed parsing because:

headers loaded incorrectly
```

or

entire CSV became one column

```

This resulted in implementing more tolerant normalization logic.

---

### 4. Large File Upload Issues

Larger CSV uploads initially failed due to:

slow row insertion
memory handling
parsing issues

The solution included:

bulk_create()
better normalization
safer dataframe parsing

# How Deployment Helps Analysis

The deployed system improves ESG analysis by converting inconsistent operational datasets into:

reviewable
auditable
analyzable

records.

Instead of manually checking spreadsheets, analysts can:

- upload files
- review anomalies
- fix suspicious rows
- approve/reject entries
- audit finalized batches
- view analytics dashboards

This turns fragmented operational data into a structured ESG review workflow.

---

# Final Learning

The biggest learning from this project was:

> real-world data is rarely clean

The hardest problems were not UI-related, but:

- messy CSVs
- inconsistent schemas
- missing values
- deployment configuration
- validation tradeoffs

Building a usable normalization workflow required balancing:

robustness
simplicity
human review
performance

instead of assuming perfectly structured inputs.
```
