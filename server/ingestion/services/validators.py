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


from constants.airports import (
    airport_distance
)


def validate_travel(row):

    origin = str(
        row.get(
            "origin_airport", ""
        ) or ""
    ).strip()

    destination = str(
        row.get(
            "destination_airport", ""
        ) or ""
    ).strip()

    if origin == "0":
        origin = ""

    if destination == "0":
        destination = ""

    if not origin or not destination:

        return (
            "failed",
            "Missing airport code"
        )

    route = (
        f"{origin}-"
        f"{destination}"
    )

    distance = airport_distance.get(
        route,
        0
    )

    if distance <= 0:

        return (
            "suspicious",
            "Invalid route or zero distance"
        )

    return (
        "valid",
        ""
    )