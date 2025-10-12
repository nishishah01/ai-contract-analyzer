import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const riskColors = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
};

const DocumentDetail = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://127.0.0.1:8000/api/${id}/annotated/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDoc(data);
      setLoading(false);
    };
    fetchDoc();
  }, [id]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    const token = localStorage.getItem("authToken");
    await fetch(`http://127.0.0.1:8000/api/${id}/analyze/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setReanalyzing(false);
    // Refresh document data
    const res = await fetch(`http://127.0.0.1:8000/api/${id}/annotated/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDoc(data);
  };

  const handleAcceptRewrite = async (clauseId) => {
    const token = localStorage.getItem("authToken");
    await fetch(`http://127.0.0.1:8000/api/${id}/accept-rewrite/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clause_id: clauseId }),
    });
    alert("Rewrite accepted!");
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`http://127.0.0.1:8000/api/${id}/download/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc?.name || "document.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8 text-center">Loading document...</div>;
  if (!doc) return <div className="p-8 text-center text-red-500">Document not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{doc.name}</h2>
          <div className="text-gray-500 text-sm">Uploaded: {doc.uploaded_at?.slice(0, 10)}</div>
        </div>
        <div>
          <span className={`px-3 py-1 rounded font-bold ${riskColors[doc.overall_risk_level] || "bg-gray-200"}`}>
            {doc.overall_risk_level} Risk ({doc.overall_risk_score})
          </span>
        </div>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Tags: </span>
        {doc.tags?.map((tag) => (
          <span key={tag} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 text-xs">
            {tag}
          </span>
        ))}
      </div>
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Full Text</h4>
        <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm">{doc.text_content}</div>
      </div>
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Annotated Clauses</h4>
        {doc.clauses?.length > 0 ? (
          doc.clauses.map((clause, idx) => (
            <div key={clause.id || idx} className="mb-4 p-4 bg-white rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Clause {idx + 1}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${riskColors[clause.risk] || "bg-gray-200"}`}>
                  {clause.risk}
                </span>
              </div>
              <div className="mb-2 text-sm"><span className="font-semibold">Text:</span> {clause.text}</div>
              <div className="mb-2 text-sm"><span className="font-semibold">Explanation:</span> {clause.explanation}</div>
              <div className="mb-2 text-sm"><span className="font-semibold">Rewrite Suggestion:</span> {clause.rewrite}</div>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded text-xs mt-2"
                onClick={() => handleAcceptRewrite(clause.id)}
              >
                Accept Rewrite
              </button>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No clauses annotated.</div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          onClick={handleReanalyze}
          disabled={reanalyzing}
        >
          {reanalyzing ? "Re-analyzing..." : "Re-analyze"}
        </button>
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded font-semibold"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
    </div>
  );
};
export default DocumentDetail;