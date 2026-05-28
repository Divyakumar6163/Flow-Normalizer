# DECISIONS.md

# Design Decisions & Assumptions

This document describes the implementation decisions taken while building the ESG Flow Normalizer platform, including ambiguities resolved during development, assumptions made, trade-offs considered, and what would ideally be clarified with a Product Manager (PM).

The goal was to make practical engineering decisions while keeping the system scalable, explainable, and easy to review.

---

# 1. Why Normalization Was Chosen

## Ambiguity

The three provided ESG datasets had completely different schemas.

For example:

### SAP

```text
fuel_type
plant_code
vendor
quantity
```

### Utility

```text
facility_name
usage_kwh
vendor
```

### Travel

```text
origin_airport
destination_airport
travel_type
```

There was no single common structure.

---

## Decision Taken

A normalized common schema was introduced.

Instead of storing source-specific fields separately, all datasets are converted into:

```text
activity_type
activity_details
quantity
unit
scope
status
issue
```

---

## Why This Decision Was Taken

This makes:

- filtering easier
- analytics easier
- auditing easier
- cross-source comparison possible

Without normalization, every screen would require source-specific logic.

Example:

Instead of maintaining:

```text
SAP table
Utility table
Travel table
```

a single normalized repository was created.

---

## What I Would Ask the PM

> Should source-specific fields also be retained for traceability?

Example:

Should `plant_code`, `meter_id`, or `employee_id` be stored separately for audit purposes?

---

# 2. Subset of Each Source Chosen

The assignment allowed flexibility in choosing what fields to process.

Only the subset required for ESG normalization was handled.

The intention was to focus on fields contributing to ESG activity rather than unrelated metadata.

---

## SAP Dataset

### Fields Considered

```text
fuel_type
quantity
unit
plant_code
vendor
```

### Why These Fields?

These fields directly contribute to:

- fuel activity
- emission classification
- contextual details

Example:

```text
Diesel / Plant A / Shell Energy
```

---

### Fields Ignored

```text
document_id
posting_date
cost_center
```

### Why Ignored?

These are useful operational metadata but do not directly affect normalization or ESG calculations in this implementation.

For example:

`document_id`

helps trace ERP transactions but does not influence validation.

`cost_center`

may be useful for departmental reporting but was outside project scope.

---

### PM Clarification

> Should cost-center-wise ESG reporting be supported?

---

## Utility Dataset

### Fields Considered

```text
facility_name
usage_kwh
vendor
```

### Why These Fields?

These fields directly describe electricity consumption.

They were used for:

```text
activity_type
activity_details
quantity
```

---

### Fields Ignored

```text
meter_id
billing_month
```

### Why Ignored?

`meter_id`

was treated as an operational identifier and not essential for normalization.

`billing_month`

could be useful for trend analysis but was intentionally excluded to keep the MVP simpler.

---

### PM Clarification

> Should historical monthly ESG trend analysis be supported?

If yes, billing period should be stored.

---

## Travel Dataset

### Fields Considered

```text
origin_airport
destination_airport
```

### Why These Fields?

Travel emissions primarily depend on travel distance.

Distance was derived from:

```text
origin → destination
```

mapping.

---

### Fields Ignored

```text
employee_id
travel_date
travel_type
vendor
travel_month
```

### Why Ignored?

These were considered contextual metadata.

For example:

`employee_id`

does not impact ESG normalization.

`travel_date`

could support reporting trends but was outside current scope.

`travel_type`

was not used because only flight travel was modeled.

---

### PM Clarification

> Should train, cab, hotel, or multi-modal travel also be supported?

---

# 3. Travel Distance Mapping Strategy

## Ambiguity

No travel distance was provided.

Only airport pairs existed.

Example:

```text
DEL → BLR
```

---

## Decision Taken

A backend airport-distance mapping dictionary was created.

Example:

```text
DEL-BLR → 1740 km
DEL-BOM → 1150 km
```

---

## Why This Decision Was Taken

It provides:

- deterministic outputs
- simple validation
- fast lookup
- zero external API dependency

This also avoids rate limits or API failures.

---

## Alternative Considered

Using airport coordinates from a third-party service.

Example flow:

```text
Airport Coordinates
        ↓
Distance Calculation
        ↓
Travel Quantity
```

This would scale better for all routes.

---

## PM Clarification

> Should all global airports be supported?

If yes, coordinate-based dynamic calculation would be preferable.

---

# 4. Validation Logic Decisions

The biggest ambiguity was deciding when to:

```text
valid
suspicious
failed
```

---

## Decision

### Missing Critical Fields → Failed

Examples:

```text
missing fuel type
missing airport code
missing facility details
```

Reason:

There is insufficient information to trust the record.

---

### Missing Quantity → Suspicious

Examples:

```text
usage_kwh = null
quantity = null
```

Reason:

The reviewer/editor may still know the correct value.

Instead of failing immediately, the analyst can edit and fix it.

This was treated as recoverable data loss.

---

### Negative Quantity → Suspicious

Examples:

```text
-500 kWh
negative fuel quantity
```

Reason:

Usually indicates:

- incorrect entry
- sign issue
- ERP export mistake

Still fixable.

---

### Zero or Invalid Travel Distance → Suspicious

Example:

```text
CCU-MAA → 0 km
```

Reason:

Could indicate:

- unmapped route
- incomplete airport mapping
- ingestion issue

Not necessarily invalid.

---

## PM Clarification

> Should suspicious records automatically block audit approval?

Currently analysts can still manually review them.

---

# 5. Why Editing Was Allowed

## Decision

Suspicious records are editable.

Reason:

Human analysts often know the correct value.

Example:

```text
usage_kwh = missing
```

Analyst may update:

```text
2500
```

without re-uploading the file.

---

## PM Clarification

> Should edits create an audit log?

Example:

```text
Changed by user X
Before: 0
After: 2500
Timestamp
```

---

# 6. Why Final Audit Locks Data

## Decision

After audit:

```text
edit = disabled
approve = disabled
reject = disabled
delete = disabled
```

---

## Why?

Audited ESG data should become immutable.

Otherwise:

```text
reviewed data
↓
modified later
↓
loss of trust
```

This decision ensures audit consistency.

---

## PM Clarification

> Should re-opening an audit be allowed for admins?

---

# 7. Analytics Decisions

## Decision

Added analytics page showing:

### Pie Charts

- source distribution
- status distribution
- audit distribution

### Bar Charts

- scope distribution
- quantity by source

---

## Why?

Manual review becomes difficult at scale.

Analytics gives a quick understanding of:

```text
approved
rejected
suspicious
failed
valid
```

records.

---

## PM Clarification

> Should emissions trends over time be included?

This would require storing timestamps/monthly grouping.

---

# 8. CSV Handling Decision

## Ambiguity

Some CSVs were malformed and loaded as:

```text
single column CSV
```

instead of structured CSV.

---

## Decision Taken

Support both:

```text
normal CSV
single-column CSV
```

during parsing.

---

## Why?

Real-world ERP exports are inconsistent.

This improves robustness and reduces upload failures.

---

# Summary of Key Assumptions

| Decision                        | Reason                        |
| ------------------------------- | ----------------------------- |
| Common normalized table         | Easier querying and analytics |
| Missing quantity → suspicious   | Recoverable by editor         |
| Missing critical field → failed | Insufficient trust            |
| Negative values → suspicious    | Likely human/system error     |
| Travel mapping in backend       | Deterministic and fast        |
| Post-audit lock                 | Preserve audit integrity      |
| Ignore metadata fields          | Focused MVP scope             |
| Support malformed CSV           | Real-world robustness         |
