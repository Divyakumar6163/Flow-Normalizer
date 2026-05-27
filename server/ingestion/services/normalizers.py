def normalize_sap(row):
    return {
        "activity_type":
            row.get("fuel_type")
            or "Unknown Fuel",

        "activity_details":
            f"{row.get('plant_code', '')} / "
            f"{row.get('vendor', '')}",

        "quantity":
            float(
                row.get("quantity", 0)
            )
            if row.get("quantity")
            else 0,

        "unit":
            row.get("unit")
            or "unknown",

        "scope":
            "Scope 1",
    }


def normalize_utility(row):
    return {
        "activity_type":
            "Electricity",

        "activity_details":
            f"{row.get('facility_name', '')} / "
            f"{row.get('vendor', '')}",

        "quantity":
            float(
                row.get(
                    "usage_kwh",
                    0
                )
            )
            if row.get(
                "usage_kwh"
            )
            else 0,

        "unit":
            "kWh",

        "scope":
            "Scope 2",
    }


def normalize_travel(row):
    airport_distance = {
        "DEL-BLR": 1740,
        "DEL-BBI": 1260,
        "DEL-BOM": 1150,
    }

    origin = (
        row.get(
            "origin_airport"
        )
        or ""
    )

    destination = (
        row.get(
            "destination_airport"
        )
        or ""
    )

    route = (
        f"{origin}-{destination}"
    )

    distance = (
        airport_distance.get(
            route,
            0
        )
    )

    return {
        "activity_type":
            "Flight",

        "activity_details":
            route,

        "quantity":
            distance,

        "unit":
            "km",

        "scope":
            "Scope 3",
    }