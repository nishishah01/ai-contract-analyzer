# Full-Text Search Setup and Usage

## What Was Fixed

Your full-text search implementation has been corrected and enhanced with the following improvements:

1. **Fixed Model Save Method** - Corrected the search_vector update logic in `contracts/models.py`
2. **Database Trigger** - Added PostgreSQL trigger for automatic search_vector updates (production-ready)
3. **Management Command** - Created command to populate search_vectors for existing documents
4. **Enhanced Search** - Added search highlighting and better ranking

## Setup Instructions

### Step 1: Run the Migration

Apply the database trigger migration:

```bash
cd aipolicy_analyzer
python manage.py migrate contracts 0002_add_search_vector_trigger
```

### Step 2: Update Existing Documents

Populate search_vector for all existing documents:

```bash
python manage.py update_search_vectors
```

This will update the search_vector field for all documents that have text_content.

### Step 3: Test the Search

You can now search documents using the API endpoint:

```bash
# Search for documents containing "healthcare"
curl -X GET "http://localhost:8000/api/contracts/search/?q=healthcare" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## How It Works

### 1. Automatic Indexing

When a document is saved with `text_content`, the PostgreSQL trigger automatically:
- Converts the text to a search vector using English stemming
- Stores it in the `search_vector` field
- Maintains a GIN index for fast searching

### 2. Search Features

The search endpoint provides:
- **Full-text search** with English stemming (finds "running" when searching "run")
- **Relevance ranking** - results ordered by relevance score
- **Highlighted snippets** - search terms highlighted with `<mark>` tags
- **Context-aware excerpts** - shows relevant portions of text around matches

### 3. Search API Response

```json
{
  "results": [
    {
      "id": 1,
      "file": "contract.pdf",
      "file_url": "/media/contracts/contract.pdf",
      "snippet": "This <mark>healthcare</mark> agreement covers...",
      "score": 0.8547,
      "uploaded_at": "2025-10-06T12:00:00Z"
    }
  ],
  "count": 1
}
```

## Performance at Scale

This implementation is designed for production scale:

1. **GIN Index** - Enables fast searches even with millions of documents
2. **Database Trigger** - Automatic indexing without application overhead
3. **Ranked Results** - Returns only the most relevant matches
4. **Limit Results** - Default limit of 20 results prevents large payloads

## Testing the Search

### Example Queries

```bash
# Simple search
GET /api/contracts/search/?q=agreement

# Multi-word search
GET /api/contracts/search/?q=payment+terms

# Phrase search (searches for both words)
GET /api/contracts/search/?q=data+privacy
```

## Troubleshooting

### No Results Returned

1. Ensure search_vector is populated:
```bash
python manage.py update_search_vectors
```

2. Check that documents have text_content:
```python
from contracts.models import Document
docs_without_text = Document.objects.filter(text_content__isnull=True)
print(f"Documents without text: {docs_without_text.count()}")
```

### Search Not Finding Expected Results

- PostgreSQL full-text search uses stemming (e.g., "running" matches "run")
- Try different variations of your search terms
- Check the relevance score threshold (currently 0.01) in `search_utils.py`

## Files Changed

- `contracts/models.py` - Fixed save method
- `contracts/views.py` - Simplified search view
- `contracts/search_utils.py` - New enhanced search utility
- `contracts/migrations/0002_add_search_vector_trigger.py` - Database trigger migration
- `contracts/management/commands/update_search_vectors.py` - Management command
