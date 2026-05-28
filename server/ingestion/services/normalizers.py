import pandas as pd

from constants.airports import (
    airport_distance
)

from ingestion.models import (
    NormalizedRecord
)

from .validators import (
    validate_sap,
    validate_travel
)
def normalize_sap(df, batch):
    records = []
    if len(df.columns) == 1:

        rows = (
            df.iloc[:, 0]
            .astype(str)
            .str.split(",", expand=True)
        )

        rows.columns = [
            str(col).strip().lower()
            for col in rows.iloc[0]
        ]

        df = rows[1:].reset_index(
            drop=True
        )

    else:
        df.columns = [
            str(col).strip().lower()
            for col in df.columns
        ]

    print("SAP COLUMNS:")
    print(df.columns.tolist())

    # -----------------------------
    # NORMALIZATION
    # -----------------------------
    for index, row in df.iterrows():

        try:
            status, issue = validate_sap(row)

            quantity = pd.to_numeric(
                row.get("quantity"),
                errors="coerce"
            )

            records.append(
                NormalizedRecord(
                    batch=batch,
                    source="sap",
                    activity_type=
                        row.get("fuel_type")
                        or "Unknown Fuel",

                    activity_details=
                        f"{row.get('plant_code', '')} / "
                        f"{row.get('vendor', '')}",

                    quantity=(
                        float(quantity)
                        if not pd.isna(quantity)
                        else 0
                    ),

                    unit=
                        row.get("unit")
                        or "unknown",

                    scope="Scope 1",
                    status=status,
                    issue=issue,
                )
            )

        except Exception as e:
            print(
                f"SAP row {index} failed:",
                e
            )

    NormalizedRecord.objects.bulk_create(
        records,
        batch_size=500
    )

    print(
        "TOTAL SAP RECORDS:",
        len(records)
    )

    return records


import pandas as pd
from ingestion.models import NormalizedRecord


def normalize_utility(df, batch):
    records = []

    # -----------------------------
    # HANDLE BOTH CSV TYPES
    # -----------------------------

    # Case 1:
    # CSV parsed into one column
    if len(df.columns) == 1:

        rows = (
            df.iloc[:, 0]
            .astype(str)
            .str.split(",", expand=True)
        )

        # first row = header
        rows.columns = [
            str(col).strip().lower()
            for col in rows.iloc[0]
        ]

        df = rows[1:].reset_index(
            drop=True
        )

    # Case 2:
    # normal csv
    else:
        df.columns = [
            str(col).strip().lower()
            for col in df.columns
        ]

    print("UTILITY COLUMNS:")
    print(df.columns.tolist())

    # -----------------------------
    # NORMALIZATION
    # -----------------------------

    for index, row in df.iterrows():

        try:
            status = "valid"
            issue = ""

            facility = str(
                row.get(
                    "facility_name", ""
                )
            ).strip()

            vendor = str(
                row.get("vendor", "")
            ).strip()

            usage = pd.to_numeric(
                row.get("usage_kwh"),
                errors="coerce"
            )

            # validation
            if pd.isna(usage):
                status = "failed"
                issue = (
                    "Missing electricity usage"
                )
                quantity = 0

            elif usage < 0:
                status = "suspicious"
                issue = (
                    "Negative electricity usage"
                )
                quantity = float(usage)

            else:
                quantity = float(usage)

            records.append(
                NormalizedRecord(
                    batch=batch,
                    source="utility",
                    activity_type=
                        "Electricity",
                    activity_details=
                        f"{facility} / {vendor}",
                    quantity=quantity,
                    unit="kWh",
                    scope="Scope 2",
                    status=status,
                    issue=issue,
                )
            )

        except Exception as e:
            print(
                f"Row {index} failed:",
                e
            )
            continue

    NormalizedRecord.objects.bulk_create(
        records,
        batch_size=500
    )

    print(
        "TOTAL UTILITY RECORDS:",
        len(records)
    )

    return records


from constants.airports import (
    airport_distance
)

def normalize_travel(df, batch):

    records = []

    if len(df.columns) == 1:

        rows = (
            df.iloc[:, 0]
            .astype(str)
            .str.split(",", expand=True)
        )

        rows.columns = [
            str(col).strip().lower()
            for col in rows.iloc[0]
        ]

        df = rows[1:].reset_index(
            drop=True
        )

    else:
        df.columns = [
            str(col).strip().lower()
            for col in df.columns
        ]

    print("TRAVEL COLUMNS:")
    print(df.columns.tolist())

    # --------------------------------
    # NORMALIZATION
    # --------------------------------
    for index, row in df.iterrows():

        try:

            status, issue = (
                validate_travel(row)
            )

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

            # handle 0/None/nan
            if (
                destination == "0"
                or destination.lower()
                == "nan"
            ):
                destination = ""

            if (
                origin == "0"
                or origin.lower()
                == "nan"
            ):
                origin = ""

            route = (
                f"{origin}-"
                f"{destination}"
            )

            distance = (
                airport_distance.get(
                    route,
                    0
                )
            )

            records.append(
                NormalizedRecord(
                    batch=batch,
                    source="travel",
                    activity_type=
                        "Flight",

                    activity_details=
                        route,

                    quantity=
                        distance,

                    unit="km",
                    scope="Scope 3",
                    status=status,
                    issue=issue,
                )
            )

        except Exception as e:

            print(
                f"Travel row {index} failed:"
            )
            print(row)
            print(e)

            continue

    NormalizedRecord.objects.bulk_create(
        records,
        batch_size=500
    )

    print(
        "TOTAL TRAVEL RECORDS:",
        len(records)
    )

    return records