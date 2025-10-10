import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const RecentDocuments = ({ documents = [] }) => {
  const getRiskBadge = (risk) => {
    const variants = {
      low: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      high: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    
    return variants[risk] || variants.medium;
  };

  return (
    <Card className="p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Recent Documents</h3>
      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No documents yet. Upload your first document to get started.
          </p>
        ) : (
          documents.map((doc) => (
            <Link
              key={doc.id}
              to={`/documents/${doc.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {doc.uploadedAt}
                  </p>
                </div>
              </div>
              <Badge className={cn("border", getRiskBadge(doc.risk))}>
                {doc.risk} risk
              </Badge>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentDocuments;