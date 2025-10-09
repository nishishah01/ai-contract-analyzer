# New API Endpoints Documentation

## Overview
Three new features have been added to your AI Policy Analyzer without modifying any existing code. All endpoints require authentication.

---

## 1️⃣ Annotated Document API

### Endpoint
```
GET /api/contracts/<document_id>/annotated/
```

### Purpose
Returns tokenized/claused text with inline metadata for risk color, explanation, and rewrite suggestions.

### Request Headers
```
Authorization: Bearer <your-auth-token>
```

### Response Format
```json
{
  "document_id": 123,
  "document_name": "contract.pdf",
  "uploaded_at": "2025-10-07T10:30:00Z",
  "overall_risk_score": 65,
  "tags": ["healthcare", "liability", "compliance"],
  "full_text": "Full contract text here...",
  "annotated_clauses": [
    {
      "id": 0,
      "text": "The provider shall maintain insurance...",
      "risk_level": "Medium",
      "risk_color": "#f59e0b",
      "explanation": "Insurance requirements are vague...",
      "rewrite_suggestion": "The provider shall maintain professional liability insurance...",
      "start_position": null,
      "end_position": null
    }
  ]
}
```

### Risk Colors
- **Low**: `#22c55e` (green)
- **Medium**: `#f59e0b` (orange)
- **High**: `#ef4444` (red)

### Example Usage
```bash
curl -X GET "http://localhost:8000/api/contracts/123/annotated/" \
  -H "Authorization: Bearer <your-token>"
```

---

## 2️⃣ Dashboard Aggregates API

### Endpoint
```
GET /api/contracts/dashboard/aggregates/
```

### Purpose
Provides comprehensive data for charts, recent documents, trends, and quick actions.

### Request Headers
```
Authorization: Bearer <your-auth-token>
```

### Response Format
```json
{
  "total_documents": 45,
  "analyzed_documents": 40,
  "pending_analysis": 5,
  "average_risk_score": 58.5,
  "risk_distribution": {
    "Low": 120,
    "Medium": 85,
    "High": 30
  },
  "recent_documents": [
    {
      "id": 123,
      "file": "/media/contracts/contract.pdf",
      "text_content": "Contract text...",
      "analysis": {...},
      "uploaded_at": "2025-10-07T10:30:00Z"
    }
  ],
  "trends": {
    "documents_last_30_days": 12,
    "trend_percentage": 20.0,
    "trend_direction": "up"
  },
  "quick_actions": [
    {
      "action": "analyze_pending",
      "label": "Analyze 5 pending document(s)",
      "count": 5
    },
    {
      "action": "review_high_risk",
      "label": "Review 3 high-risk document(s)",
      "count": 3
    }
  ]
}
```

### Data Points Explained
- **total_documents**: Total number of documents uploaded by user
- **analyzed_documents**: Documents that have been analyzed
- **pending_analysis**: Documents waiting for analysis
- **average_risk_score**: Average risk score across all analyzed documents (0-100)
- **risk_distribution**: Count of clauses by risk level
- **recent_documents**: Last 5 uploaded documents with full details
- **trends**: Upload activity comparison (last 30 days vs previous 30 days)
- **quick_actions**: Actionable items requiring user attention

### Example Usage
```bash
curl -X GET "http://localhost:8000/api/contracts/dashboard/aggregates/" \
  -H "Authorization: Bearer <your-token>"
```

---

## 3️⃣ Inline Editor & Rewrite Update

### Endpoint (Accept Rewrite)
```
POST /api/contracts/<document_id>/accept-rewrite/
```

### Purpose
Allows users to accept a suggested rewrite, which updates the document text content.

### Request Headers
```
Authorization: Bearer <your-auth-token>
Content-Type: application/json
```

### Request Body
```json
{
  "clause_id": 0
}
```

### Response Format
```json
{
  "document_id": 123,
  "clause_id": 0,
  "updated_text": "Full updated contract text...",
  "message": "Rewrite accepted and document updated",
  "download_url": "/api/contracts/123/download/"
}
```

### Example Usage
```bash
curl -X POST "http://localhost:8000/api/contracts/123/accept-rewrite/" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"clause_id": 0}'
```

---

### Endpoint (Download Updated Document)
```
GET /api/contracts/<document_id>/download/
```

### Purpose
Downloads the updated document text as a plain text file.

### Request Headers
```
Authorization: Bearer <your-auth-token>
```

### Response
- **Content-Type**: `text/plain`
- **Content-Disposition**: `attachment; filename="contract_updated.txt"`

### Example Usage
```bash
curl -X GET "http://localhost:8000/api/contracts/123/download/" \
  -H "Authorization: Bearer <your-token>" \
  --output updated_contract.txt
```

---

## Complete Endpoint List

| Feature | Method | Endpoint | Purpose |
|---------|--------|----------|---------|
| Annotated Document | GET | `/api/contracts/<id>/annotated/` | Get clauses with risk metadata |
| Dashboard Aggregates | GET | `/api/contracts/dashboard/aggregates/` | Get dashboard statistics |
| Accept Rewrite | POST | `/api/contracts/<id>/accept-rewrite/` | Apply rewrite suggestion |
| Download Document | GET | `/api/contracts/<id>/download/` | Download updated text file |

---

## Error Responses

### 404 Not Found
```json
{
  "error": "Document not found"
}
```

### 400 Bad Request
```json
{
  "error": "Document has not been analyzed yet"
}
```

```json
{
  "error": "clause_id is required"
}
```

```json
{
  "error": "Invalid clause_id"
}
```

```json
{
  "error": "No rewrite suggestion available for this clause"
}
```

---

## Integration Notes

### Frontend Integration Example
```javascript
// 1. Get annotated document
const response = await fetch(`/api/contracts/${docId}/annotated/`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Display clauses with risk highlighting
data.annotated_clauses.forEach(clause => {
  console.log(`Risk: ${clause.risk_level} (${clause.risk_color})`);
  console.log(`Text: ${clause.text}`);
  console.log(`Suggestion: ${clause.rewrite_suggestion}`);
});

// 2. Accept a rewrite
await fetch(`/api/contracts/${docId}/accept-rewrite/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ clause_id: 0 })
});

// 3. Download updated document
window.location.href = `/api/contracts/${docId}/download/`;
```

---

## Testing the Endpoints

1. **Ensure a document is uploaded and analyzed first**:
   ```bash
   # Upload document
   curl -X POST "http://localhost:8000/api/contracts/documents/" \
     -H "Authorization: Bearer <token>" \
     -F "file=@contract.pdf"

   # Analyze document (if not auto-analyzed)
   curl -X POST "http://localhost:8000/api/contracts/<id>/analyze/" \
     -H "Authorization: Bearer <token>"
   ```

2. **Then test the new endpoints** using the examples above.

---

## Implementation Details

- **File Location**: `/aipolicy_analyzer/contracts/views_extended.py`
- **No Existing Code Modified**: All new functionality is in a separate file
- **Authentication Required**: All endpoints use `IsAuthenticated` permission
- **User Isolation**: Users can only access their own documents

---

## Notes

- The `accept-rewrite` endpoint modifies the `text_content` field in the database
- Original PDF files remain unchanged
- Only the extracted text content is updated
- Downloads provide the updated text as a `.txt` file
- Risk colors use standard web hex format for easy CSS integration
