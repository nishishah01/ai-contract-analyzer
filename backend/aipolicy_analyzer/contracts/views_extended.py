from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Document
from .serializers import DocumentSerializer
import json


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def annotated_document_view(request, pk):
    try:
        doc = Document.objects.get(pk=pk, owner=request.user)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

    if not doc.analysis:
        return Response(
            {"error": "Document has not been analyzed yet"},
            status=status.HTTP_400_BAD_REQUEST
        )

    analysis_data = doc.analysis.get('structured', {})
    clauses = analysis_data.get('clauses', [])

    annotated_clauses = []
    for idx, clause in enumerate(clauses):
        annotated_clauses.append({
            "id": idx,
            "text": clause.get("text", ""),
            "risk_level": clause.get("risk", "Low"),
            "risk_color": get_risk_color(clause.get("risk", "Low")),
            "explanation": clause.get("explanation", ""),
            "rewrite_suggestion": clause.get("rewrite", ""),
            "start_position": None,
            "end_position": None
        })

    response_data = {
        "document_id": doc.id,
        "document_name": doc.file.name,
        "uploaded_at": doc.uploaded_at,
        "overall_risk_score": analysis_data.get('overall_risk_score', 0),
        "tags": analysis_data.get('tags', []),
        "annotated_clauses": annotated_clauses,
        "full_text": doc.text_content or ""
    }

    return Response(response_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_aggregates_view(request):
    user = request.user

    total_docs = Document.objects.filter(owner=user).count()

    analyzed_docs = Document.objects.filter(
        owner=user,
        analysis__isnull=False
    ).exclude(analysis={})

    recent_docs = Document.objects.filter(owner=user).order_by('-uploaded_at')[:5]
    recent_docs_data = DocumentSerializer(recent_docs, many=True).data

    risk_distribution = {"Low": 0, "Medium": 0, "High": 0}
    total_risk_score = 0
    analyzed_count = 0

    for doc in analyzed_docs:
        structured = doc.analysis.get('structured', {})
        clauses = structured.get('clauses', [])

        for clause in clauses:
            risk = clause.get('risk', 'Low')
            if risk in risk_distribution:
                risk_distribution[risk] += 1

        overall_risk = structured.get('overall_risk_score', 0)
        if overall_risk:
            total_risk_score += overall_risk
            analyzed_count += 1

    avg_risk_score = round(total_risk_score / analyzed_count, 2) if analyzed_count > 0 else 0

    last_30_days = timezone.now() - timedelta(days=30)
    docs_last_30 = Document.objects.filter(
        owner=user,
        uploaded_at__gte=last_30_days
    ).count()

    prev_30_days = last_30_days - timedelta(days=30)
    docs_prev_30 = Document.objects.filter(
        owner=user,
        uploaded_at__gte=prev_30_days,
        uploaded_at__lt=last_30_days
    ).count()

    trend_percentage = 0
    if docs_prev_30 > 0:
        trend_percentage = round(((docs_last_30 - docs_prev_30) / docs_prev_30) * 100, 1)

    quick_actions = []

    pending_analysis = Document.objects.filter(
    Q(owner=user) & (Q(analysis__isnull=True) | Q(analysis={}))
).count()


    if pending_analysis > 0:
        quick_actions.append({
            "action": "analyze_pending",
            "label": f"Analyze {pending_analysis} pending document(s)",
            "count": pending_analysis
        })

    high_risk_docs = 0
    for doc in analyzed_docs:
        structured = doc.analysis.get('structured', {})
        if structured.get('overall_risk_score', 0) >= 70:
            high_risk_docs += 1

    if high_risk_docs > 0:
        quick_actions.append({
            "action": "review_high_risk",
            "label": f"Review {high_risk_docs} high-risk document(s)",
            "count": high_risk_docs
        })

    response_data = {
        "total_documents": total_docs,
        "analyzed_documents": analyzed_docs.count(),
        "pending_analysis": pending_analysis,
        "average_risk_score": avg_risk_score,
        "risk_distribution": risk_distribution,
        "recent_documents": recent_docs_data,
        "trends": {
            "documents_last_30_days": docs_last_30,
            "trend_percentage": trend_percentage,
            "trend_direction": "up" if trend_percentage > 0 else "down" if trend_percentage < 0 else "stable"
        },
        "quick_actions": quick_actions
    }

    return Response(response_data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_rewrite_view(request, pk):
    try:
        doc = Document.objects.get(pk=pk, owner=request.user)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

    clause_id = request.data.get('clause_id')

    if clause_id is None:
        return Response(
            {"error": "clause_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not doc.analysis:
        return Response(
            {"error": "Document has not been analyzed"},
            status=status.HTTP_400_BAD_REQUEST
        )

    analysis_data = doc.analysis.get('structured', {})
    clauses = analysis_data.get('clauses', [])

    if clause_id < 0 or clause_id >= len(clauses):
        return Response(
            {"error": "Invalid clause_id"},
            status=status.HTTP_400_BAD_REQUEST
        )

    clause = clauses[clause_id]
    original_text = clause.get('text', '')
    rewrite_text = clause.get('rewrite', '')

    if not rewrite_text:
        return Response(
            {"error": "No rewrite suggestion available for this clause"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if doc.text_content and original_text in doc.text_content:
        doc.text_content = doc.text_content.replace(original_text, rewrite_text, 1)
        doc.save()

    updated_text = doc.text_content or ""

    response_data = {
        "document_id": doc.id,
        "clause_id": clause_id,
        "updated_text": updated_text,
        "message": "Rewrite accepted and document updated",
        "download_url": f"/api/contracts/{doc.id}/download/"
    }

    return Response(response_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_updated_document_view(request, pk):
    try:
        doc = Document.objects.get(pk=pk, owner=request.user)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

    from django.http import HttpResponse

    response = HttpResponse(doc.text_content or "", content_type='text/plain')
    filename = doc.file.name.split('/')[-1].rsplit('.', 1)[0] + '_updated.txt'
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    return response


def get_risk_color(risk_level):
    colors = {
        "Low": "#22c55e",
        "Medium": "#f59e0b",
        "High": "#ef4444"
    }
    return colors.get(risk_level, "#6b7280")
