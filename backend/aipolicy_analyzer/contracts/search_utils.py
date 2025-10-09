from django.contrib.postgres.search import SearchQuery, SearchRank, SearchHeadline
from django.db.models import F
from .models import Document


def search_documents_with_highlight(user, query_text, limit=20):
    if not query_text:
        return []

    search_query = SearchQuery(query_text, config='english')

    results = (
        Document.objects
        .filter(owner=user, search_vector__isnull=False)
        .annotate(
            rank=SearchRank(F('search_vector'), search_query)
        )
        .filter(rank__gte=0.01)
        .order_by('-rank')[:limit]
    )

    formatted_results = []
    for doc in results:
        headline = SearchHeadline(
            'text_content',
            search_query,
            config='english',
            start_sel='<mark>',
            stop_sel='</mark>',
            max_words=50,
            min_words=15,
        )

        highlighted_doc = Document.objects.filter(pk=doc.pk).annotate(
            headline=headline
        ).first()

        formatted_results.append({
            'id': doc.id,
            'file': doc.file.name if doc.file else None,
            'file_url': doc.file.url if doc.file else None,
            'snippet': highlighted_doc.headline if highlighted_doc else doc.text_content[:300],
            'score': float(doc.rank),
            'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        })

    return formatted_results
