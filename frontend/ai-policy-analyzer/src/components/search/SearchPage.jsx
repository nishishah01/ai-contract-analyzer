import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const res = await fetch(`http://127.0.0.1:8000/api/search/?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setResults(data.results || []);
    setCount((data.results && data.results.length) || 0);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Search Documents</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>
      {loading ? (
        <div className="p-8 text-center">Searching...</div>
      ) : (
        <>
          <div className="mb-4 text-gray-700 font-semibold">
            {count} result{count === 1 ? "" : "s"} found
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(results) && results.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded shadow p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <h3 className="font-bold text-lg mb-2">{doc.file}</h3>
                <div className="text-sm text-gray-500 mb-2">
                  Uploaded: {doc.uploaded_at?.slice(0, 10)}
                </div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: doc.snippet }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;