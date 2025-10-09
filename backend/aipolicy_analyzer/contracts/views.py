from rest_framework import generics, permissions
from .models import Document
from .serializers import DocumentSerializer
from .utils import extract_text_from_file
from .services.nlp_service import analyze_contract_with_gemini  
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Document

class DocumentUploadView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        doc = serializer.save(owner=self.request.user)
        file_path = doc.file.path
        doc.text_content = extract_text_from_file(file_path)
        doc.analysis = analyze_contract_with_gemini(doc.text_content)
        doc.save()
from rest_framework import status
from .services.analysis_pipeline import run_analysis_pipeline



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_document_view(request, pk):
    try:
        doc = Document.objects.get(pk=pk, owner=request.user)
    except Document.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    res = run_analysis_pipeline(doc, force_reanalyze=True)
    return Response(res)



from .search_utils import search_documents_with_highlight

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_documents(request):
    query = request.query_params.get("q", "")
    if not query:
        return Response({"error": "Missing ?q= parameter"}, status=400)

    results = search_documents_with_highlight(request.user, query, limit=20)

    return Response({"results": results, "count": len(results)})
