import { useNavigate } from "react-router-dom";

const DocumentList = ({ documents, filter, onFilter }) => {
  const navigate = useNavigate();

  const filteredDocs = filter === "all"
    ? documents
    : documents.filter(doc => filter === "analyzed" ? doc.analyzed : !doc.analyzed);

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => onFilter("all")}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === "analyzed" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => onFilter("analyzed")}
        >
          Analyzed
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => onFilter("pending")}
        >
          Pending
        </button>
      </div>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Upload Date</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length > 0 ? (
              filteredDocs.map(doc => (
                <tr
                  key={doc.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <td className="p-2">{doc.name || doc.title || `Document #${doc.id}`}</td>
                  <td className="p-2">{doc.uploaded_at?.slice(0, 10)}</td>
                  <td className="p-2">
                    {doc.analyzed ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Analyzed</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-2 text-gray-500 text-center">No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;