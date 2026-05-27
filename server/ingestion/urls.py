from django.urls import path

from .views import (
    FinalAuditView,
    RecordActionView,
    UploadCSVView,
    ReviewView,
    UploadsView
)

urlpatterns = [
    path(
        "upload/<str:source>/",
        UploadCSVView.as_view()
    ),

    path(
        "review/<int:batch_id>/",
        ReviewView.as_view()
    ),

    path(
        "record/<int:record_id>/",
        RecordActionView.as_view()
    ),

    path(
        "audit/<int:batch_id>/",
        FinalAuditView.as_view()
    ),
    path(
        "uploads/",
        UploadsView.as_view()
    ),
]