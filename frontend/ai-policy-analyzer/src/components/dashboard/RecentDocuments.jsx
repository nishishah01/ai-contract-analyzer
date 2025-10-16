import { Link } from 'react-router-dom';

const RecentDocuments = ({ document }) => {
  const getRiskLevel = (doc) => {
    if (doc?.analysis?.overall_risk_score) {
      const score = doc.analysis.overall_risk_score;
      if (score >= 70) return { level: 'High', color: 'bg-red-100 text-red-700' };
      if (score >= 40) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
      return { level: 'Low', color: 'bg-green-100 text-green-700' };
    }
    return { level: 'Not Analyzed', color: 'bg-gray-100 text-gray-700' };
  };

  const getDocumentName = (doc) => {
    if (doc?.file) {
      const fileName = doc.file.split('/').pop();
      return fileName.replace('.pdf', '');
    }
    return `Document #${doc?.id}`;
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h4 className="font-semibold mb-2">Current Document</h4>
      {document ? (
        <div className="py-2">
          <Link 
            to={`/documents/${document.id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {getDocumentName(document)}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 rounded text-xs ${getRiskLevel(document).color}`}>
              {getRiskLevel(document).level}
            </span>
            {document.analysis?.overall_risk_score && (
              <span className="text-xs text-gray-500">
                Score: {document.analysis.overall_risk_score}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No document available</div>
      )}
    </div>
  );
};

export default RecentDocuments;