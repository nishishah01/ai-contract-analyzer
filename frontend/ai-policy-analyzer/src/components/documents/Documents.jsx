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
    
    console.log("Fetching documents from:", url);
    console.log("Auth token present:", token ? "Yes" : "No");
    
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Documents API Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Documents API Response:", data);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
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