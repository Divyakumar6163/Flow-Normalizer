import pandas as pd
from io import TextIOWrapper
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    ImportBatch,
    NormalizedRecord,
)

from .services.validators import (
    validate_sap,
    validate_utility,
    validate_travel,
)

from .services.normalizers import (
    normalize_sap,
    normalize_utility,
    normalize_travel,
)

from .serializers import (
    RecordSerializer
)


class UploadCSVView(APIView):

    def post(self, request, source):
        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "No file"},
                status=400
            )

        batch = ImportBatch.objects.create(
            source=source,
            file_name=file.name
        )

        try:
            csv_file = TextIOWrapper(
                file.file,
                encoding="utf-8-sig"
            )

            # safer CSV parsing
            df = pd.read_csv(
                csv_file,
                low_memory=False
            )

            # safe headers
            df.columns = [
                str(col).strip().lower()
                for col in df.columns
            ]

            print("COLUMNS:")
            print(df.columns.tolist())

            df = df.where(
                pd.notnull(df),
                None
            )

        except Exception as e:
            return Response(
                {
                    "error":
                    f"CSV parsing failed: {str(e)}"
                },
                status=400
            )

        try:
            if source == "sap":
                normalize_sap(df, batch)

            elif source == "utility":
                normalize_utility(df, batch)

            elif source == "travel":
                normalize_travel(df, batch)

            else:
                return Response(
                    {"error": "Invalid source"},
                    status=400
                )

        except Exception as e:
            print(e)

            return Response(
                {
                    "error":
                    f"Normalization failed: {str(e)}"
                },
                status=400
            )

        return Response({
            "batchId": batch.id
        })


class ReviewView(APIView):
    def get(
        self,
        request,
        batch_id
    ):
        records = (
            NormalizedRecord.objects
            .filter(batch_id=batch_id)
        )

        serializer = RecordSerializer(
            records,
            many=True
        )

        return Response(
            serializer.data
        )
    

class RecordActionView(APIView):

    def patch(
        self,
        request,
        record_id
    ):
        try:
            record = (
                NormalizedRecord.objects
                .get(id=record_id)
            )

            if record.audited:
                return Response(
                    {
                        "error":
                        "Record already audited"
                    },
                    status=400
                )

            data = request.data

            record.activity_type = (
                data.get(
                    "activity_type",
                    record.activity_type
                )
            )

            record.quantity = (
                data.get(
                    "quantity",
                    record.quantity
                )
            )

            record.unit = (
                data.get(
                    "unit",
                    record.unit
                )
            )

            record.status = (
                data.get(
                    "status",
                    record.status
                )
            )

            record.save()

            return Response({
                "message":
                "updated"
            })

        except (
            NormalizedRecord
            .DoesNotExist
        ):
            return Response(
                {
                    "error":
                    "not found"
                },
                status=404
            )

    def delete(
        self,
        request,
        record_id
    ):
        try:
            record = (
                NormalizedRecord.objects
                .get(id=record_id)
            )

            if record.audited:
                return Response(
                    {
                        "error":
                        "Record already audited"
                    },
                    status=400
                )

            record.delete()

            return Response({
                "message":
                "deleted"
            })

        except (
            NormalizedRecord
            .DoesNotExist
        ):
            return Response(
                {
                    "error":
                    "not found"
                },
                status=404
            )
    
class FinalAuditView(APIView):

    def post(
        self,
        request,
        batch_id
    ):
        records = (
            NormalizedRecord.objects
            .filter(batch_id=batch_id)
        )

        if not records.exists():
            return Response(
                {"error": "No records"},
                status=404
            )

        # already audited?
        if records.filter(
            audited=True
        ).exists():
            return Response(
                {
                    "error":
                    "Audit already completed"
                },
                status=400
            )

        records.update(
            audited=True
        )

        return Response({
            "message":
            "Audit completed"
        })
    
class UploadsView(APIView):

    def get(
        self,
        request
    ):
        records = (
            NormalizedRecord.objects
            .all()
            .order_by("-id")
        )

        serializer = (
            RecordSerializer(
                records,
                many=True
            )
        )

        return Response(
            serializer.data
        )