import { useEffect, useState } from "react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Fetching dashboard with token:", token ? "Present" : "Missing");
        
        const res = await fetch("http://127.0.0.1:8000/api/dashboard/aggregates/", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log("API Response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const result = await res.json();
        console.log("Dashboard API Response:", result);
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

  const handleViewAllDocuments = () => {
    // Navigate to documents page - implement based on your routing solution
    window.location.href = '/documents';
  };

  const handleReviewHighRisk = () => {
    // Navigate to filtered documents page
    window.location.href = '/documents?filter=high-risk';
  };

  const handleViewDocument = (docId) => {
    // Navigate to individual document
    window.location.href = `/documents/${docId}`;
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="p-8 text-center">Loading dashboard...</div>
    </div>
  );
  
  if (!data) return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* Document Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl font-bold">{data.total_documents || 0}</span>
          <span className="text-gray-500 mt-2 text-center">Total Documents</span>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl font-bold">{data.analyzed_documents || 0}</span>
          <span className="text-gray-500 mt-2 text-center">Analyzed</span>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl font-bold">{data.pending_analysis || 0}</span>
          <span className="text-gray-500 mt-2 text-center">Pending Analysis</span>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl font-bold">{data.average_risk_score || 0}</span>
          <span className="text-gray-500 mt-2 text-center">Avg Risk Score</span>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h4 className="font-semibold text-lg mb-4">Risk Distribution Across All Documents</h4>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <span className="block text-3xl font-bold text-green-600">
              {data.risk_distribution?.Low || 0}
            </span>
            <span className="text-gray-500 mt-2">Low Risk</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-yellow-600">
              {data.risk_distribution?.Medium || 0}
            </span>
            <span className="text-gray-500 mt-2">Medium Risk</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-red-600">
              {data.risk_distribution?.High || 0}
            </span>
            <span className="text-gray-500 mt-2">High Risk</span>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      {data.recent_documents && data.recent_documents.length > 0 && (
        <div className="bg-white rounded shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg">Recent Documents</h4>
            <button
              onClick={handleViewAllDocuments}
              className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {data.recent_documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="border rounded p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <button 
                      onClick={() => handleViewDocument(doc.id)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer bg-transparent border-none p-0"
                    >
                      Document #{doc.id}
                    </button>
                    {doc.analysis?.tags && doc.analysis.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {doc.analysis.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {doc.analysis?.overall_risk_score !== undefined && (
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        doc.analysis.overall_risk_score >= 70 ? 'bg-red-100 text-red-700' :
                        doc.analysis.overall_risk_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        Risk: {doc.analysis.overall_risk_score}
                      </span>
                    )}
                  </div>
                </div>
                {doc.analysis?.clauses && doc.analysis.clauses.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">{doc.analysis.clauses.length}</span> clauses analyzed
                    {doc.analysis.clauses.filter(c => c.risk === 'High').length > 0 && (
                      <span className="ml-3 text-red-600">
                        • {doc.analysis.clauses.filter(c => c.risk === 'High').length} high risk
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
          <span className="font-semibold mb-3 text-lg">Quick Action</span>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition cursor-pointer"
            onClick={handleViewAllDocuments}
          >
            View All Documents
          </button>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
          <span className="font-semibold mb-3 text-lg">Quick Action</span>
          <button 
            onClick={handleReviewHighRisk}
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition cursor-pointer"
          >
            Review High-Risk Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;