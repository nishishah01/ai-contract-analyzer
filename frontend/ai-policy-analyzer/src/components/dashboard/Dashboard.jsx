import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://127.0.0.1:8000/api/dashboard/aggregates/", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAnalyzePending = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(`http://127.0.0.1:8000/api/${data?.document?.id}/analyze/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Document analysis initiated!");
      // Refresh the dashboard data
      window.location.reload();
    } catch (err) {
      alert("Error analyzing document.");
    }
  };

  const handleReviewHighRisk = () => {
    navigate('/documents?filter=high-risk');
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

  const document = data.document;
  const summary = data.summary;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* Document Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl font-bold">{summary?.total_clauses_analyzed || 0}</span>
          <span className="text-gray-500 mt-2">Total Clauses Analyzed</span>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold">{document?.analysis?.overall_risk_score || 0}</span>
          <span className="text-gray-500 mt-2">Overall Risk Score</span>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold">{summary?.high_risk_count || 0}</span>
          <span className="text-gray-500 mt-2">High Risk Clauses</span>
        </div>
      </div>

      {/* Risk Distribution and Document Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded shadow p-4">
          <h4 className="font-semibold mb-2">Risk Distribution</h4>
          <div className="flex gap-4">
            <div>
              <span className="block text-lg font-bold text-green-600">{summary?.low_risk_count || 0}</span>
              <span className="text-gray-500">Low Risk</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-yellow-600">{summary?.medium_risk_count || 0}</span>
              <span className="text-gray-500">Medium Risk</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-red-600">{summary?.high_risk_count || 0}</span>
              <span className="text-gray-500">High Risk</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded shadow p-4">
          <h4 className="font-semibold mb-2">Current Document</h4>
          {document ? (
            <div>
              <div className="text-sm text-gray-600 mb-2">
                <Link 
                  to={`/documents/${document.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {document.file?.split('/').pop()?.replace('.pdf', '') || `Document #${document.id}`}
                </Link>
              </div>
              <div className="text-xs text-gray-500">
                Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  document.analysis?.overall_risk_score >= 70 ? 'bg-red-100 text-red-700' :
                  document.analysis?.overall_risk_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {document.analysis?.overall_risk_score >= 70 ? 'High' :
                   document.analysis?.overall_risk_score >= 40 ? 'Medium' : 'Low'} Risk
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No document available</div>
          )}
        </div>
      </div>

      {/* Document Tags */}
      {document?.analysis?.tags && (
        <div className="bg-white rounded shadow p-4 mb-8">
          <h4 className="font-semibold mb-2">Document Tags</h4>
          <div className="flex flex-wrap gap-2">
            {document.analysis.tags.map((tag, index) => (
              <span key={index} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Clauses */}
      {document?.analysis?.clauses && (
        <div className="bg-white rounded shadow p-4 mb-8">
          <h4 className="font-semibold mb-2">Risk Clauses</h4>
          <div className="space-y-3">
            {document.analysis.clauses.slice(0, 3).map((clause, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Clause {index + 1}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    clause.risk === 'High' ? 'bg-red-100 text-red-700' :
                    clause.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {clause.risk}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{clause.text}</p>
              </div>
            ))}
          </div>
          {document.analysis.clauses.length > 3 && (
            <div className="mt-3">
              <Link 
                to={`/documents/${document.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View all {document.analysis.clauses.length} clauses →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recommended Actions */}
      {summary?.recommended_actions && summary.recommended_actions.length > 0 && (
        <div className="bg-white rounded shadow p-4 mb-8">
          <h4 className="font-semibold mb-2">Recommended Actions</h4>
          <ul className="space-y-2">
            {summary.recommended_actions.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="font-semibold mb-2">Quick Action</span>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleAnalyzePending}
          >
            Re-analyze Document
          </button>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="font-semibold mb-2">Quick Action</span>
          <button 
            onClick={handleReviewHighRisk}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Review High-Risk Clauses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 