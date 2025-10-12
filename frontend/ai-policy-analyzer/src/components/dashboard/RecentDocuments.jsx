const RecentDocuments = ({ documents }) => (
  <div className="bg-white rounded shadow p-4">
    <h4 className="font-semibold mb-2">Recent Documents</h4>
    <ul>
      {documents && documents.length > 0 ? (
        documents.map((doc) => (
          <li key={doc.id} className="py-2 border-b flex justify-between items-center">
            <span>{doc.name || doc.title || `Document #${doc.id}`}</span>
            <span className={`px-2 py-1 rounded text-xs ${
              doc.risk === "High" ? "bg-red-100 text-red-700" :
              doc.risk === "Medium" ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>
              {doc.risk}
            </span>
          </li>
        ))
      ) : (
        <li className="text-gray-500">No recent documents.</li>
      )}
    </ul>
  </div>
);

export default RecentDocuments;