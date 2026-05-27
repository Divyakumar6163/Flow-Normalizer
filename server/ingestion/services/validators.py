def validate_sap(row):
    if not row.get("fuel_type"):
        return (
            "failed",
            "Missing fuel type"
        )

    try:
        qty = float(
            row.get("quantity", 0)
        )

        if qty < 0:
            return (
                "suspicious",
                "Negative quantity"
            )

    except Exception:
        return (
            "failed",
            "Invalid quantity"
        )

    return "valid", ""


def validate_utility(row):
    try:
        qty = float(
            row.get("usage_kwh", 0)
        )

        if qty < 0:
            return (
                "suspicious",
                "Negative electricity"
            )

    except Exception:
        return (
            "failed",
            "Invalid electricity value"
        )

    return "valid", ""


def validate_travel(row):
    destination = row.get(
        "destination_airport"
    )

    if not destination:
        return (
            "failed",
            "Missing airport"
        )

    return "valid", ""