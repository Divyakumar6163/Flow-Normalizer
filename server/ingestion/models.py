from django.db import models


class ImportBatch(models.Model):
    SOURCE_CHOICES = [
        ("sap", "SAP"),
        ("utility", "Utility"),
        ("travel", "Travel"),
    ]

    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    file_name = models.CharField(
        max_length=255
    )

    def __str__(self):
        return f"{self.source}-{self.id}"


class NormalizedRecord(models.Model):

    batch = models.ForeignKey(
        ImportBatch,
        on_delete=models.CASCADE
    )

    source = models.CharField(
        max_length=50
    )

    activity_type = models.CharField(
        max_length=255
    )

    activity_details = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    quantity = models.FloatField()

    unit = models.CharField(
        max_length=50
    )

    scope = models.CharField(
        max_length=50
    )

    status = models.CharField(
        max_length=50
    )

    issue = models.TextField(
        blank=True,
        null=True
    )

    audited = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )