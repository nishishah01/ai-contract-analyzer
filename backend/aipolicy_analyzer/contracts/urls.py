from django.urls import path
from .views import DocumentUploadView
from . import views
from .views import search_documents
from . import views_extended


urlpatterns = [
    path('documents/', DocumentUploadView.as_view(), name='document-upload'),
    path("<int:pk>/analyze/", views.analyze_document_view, name="analyze-document"),
    path("search/", search_documents, name="search_documents"),
    path("<int:pk>/annotated/", views_extended.annotated_document_view, name="annotated-document"),
    path("dashboard/aggregates/", views_extended.dashboard_aggregates_view, name="dashboard-aggregates"),
    path("<int:pk>/accept-rewrite/", views_extended.accept_rewrite_view, name="accept-rewrite"),
    path("<int:pk>/download/", views_extended.download_updated_document_view, name="download-document"),

]
