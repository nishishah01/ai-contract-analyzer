import { Link } from 'react-router-dom';

const RecentDocuments = ({ documents }) => {
  const getRiskLevel = (doc) => {
    if (doc.analysis && doc.analysis.structured) {
      const score = doc.analysis.structured.overall_risk_score;
      if (score >= 70) return { level: 'High', color: 'bg-red-100 text-red-700' };
      if (score >= 40) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
      return { level: 'Low', color: 'bg-green-100 text-green-700' };
    }
    return { level: 'Not Analyzed', color: 'bg-gray-100 text-gray-700' };
  };

  const getDocumentName = (doc) => {
    if (doc.file) {
      const fileName = doc.file.split('/').pop();
      return fileName.replace('.pdf', '');
    }
    return `Document #${doc.id}`;
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h4 className="font-semibold mb-2">Recent Documents</h4>
      <ul>
        {documents && documents.length > 0 ? (
          documents.map((doc) => {
            const risk = getRiskLevel(doc);
            const documentName = getDocumentName(doc);
            return (
              <li key={doc.id} className="py-2 border-b flex justify-between items-center">
                <Link 
                  to={`/documents/${doc.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {documentName}
                </Link>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${risk.color}`}>
                    {risk.level}
                  </span>
                  {doc.analysis && doc.analysis.structured && (
                    <span className="text-xs text-gray-500">
                      Score: {doc.analysis.structured.overall_risk_score}
                    </span>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-gray-500">No recent documents.</li>
        )}
      </ul>
    </div>
  );
};

export default RecentDocuments;