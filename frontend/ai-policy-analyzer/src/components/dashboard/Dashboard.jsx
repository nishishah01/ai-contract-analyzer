import { useEffect, useState } from "react";
import RecentDocuments from "./RecentDocuments";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Corrected handler: POST to /api/<document_id>/analyze/ for each pending document
  const handleAnalyzePending = async () => {
    try {
      const token = localStorage.getItem("authToken");
      // Find all pending documents (not analyzed)
      const pendingDocs = (data?.recent_documents ?? []).filter(doc => !doc.analyzed);
      if (pendingDocs.length === 0) {
        alert("No pending documents to analyze.");
        return;
      }
      for (const doc of pendingDocs) {
        await fetch(`http://127.0.0.1:8000/api/${doc.id}/analyze/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      alert("Pending documents are being analyzed!");
    } catch (err) {
      alert("Error analyzing pending documents.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl font-bold">{data.total_documents}</span>
          <span className="text-gray-500 mt-2">Total Documents</span>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold">{data.analyzed_documents} / {data.total_documents}</span>
          <span className="text-gray-500 mt-2">Analyzed / Pending</span>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold">{data.average_risk_score}</span>
          <span className="text-gray-500 mt-2">Average Risk Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded shadow p-4">
          <h4 className="font-semibold mb-2">Risk Distribution</h4>
          <div className="flex gap-4">
            <div>
              <span className="block text-lg font-bold text-green-600">{data.risk_distribution?.low ?? 0}</span>
              <span className="text-gray-500">Low</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-yellow-600">{data.risk_distribution?.medium ?? 0}</span>
              <span className="text-gray-500">Medium</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-red-600">{data.risk_distribution?.high ?? 0}</span>
              <span className="text-gray-500">High</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h4 className="font-semibold mb-2">30-Day Upload Trends</h4>
          <div className="flex items-end gap-1 h-24">
            {(data.upload_trends ?? []).map((count, idx) => (
              <div
                key={idx}
                className="bg-blue-500"
                style={{
                  height: `${count * 2}px`,
                  width: "8px",
                  borderRadius: "4px",
                }}
                title={`Day ${idx + 1}: ${count}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <RecentDocuments documents={data.recent_documents ?? []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="font-semibold mb-2">Quick Action</span>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleAnalyzePending}
          >
            Analyze Pending Documents
          </button>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="font-semibold mb-2">Quick Action</span>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            Review High-Risk Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 