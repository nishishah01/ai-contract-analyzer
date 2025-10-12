import { useEffect, useState } from "react";
import DocumentList from "./DocumentList";
import SearchBar from "./SearchBar";
import UploadModal from "./UploadModal";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async (query = "") => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    let url = query
      ? `http://127.0.0.1:8000/api/search/?q=${encodeURIComponent(query)}`
      : "http://127.0.0.1:8000/api/documents/";
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchDocuments(query);
  };

  const handleUpload = () => {
    fetchDocuments(searchQuery);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Documents Library</h2>
      <SearchBar onSearch={handleSearch} />
      <UploadModal onUpload={handleUpload} />
      {loading ? (
        <div className="p-8 text-center">Loading documents...</div>
      ) : (
        <DocumentList
          documents={documents}
          filter={filter}
          onFilter={setFilter}
        />
      )}
    </div>
  );
};

export default Documents;