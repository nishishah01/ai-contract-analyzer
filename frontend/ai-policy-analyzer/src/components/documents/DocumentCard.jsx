import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DocumentCard = ({ document }) => {
  const getRiskColor = (risk) => {
    const colors = {
      low: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      high: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[risk] || colors.medium;
  };

  return (
    <Card className="p-5 hover:shadow-elegant transition-all group animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-primary rounded-lg shadow-sm">
          <FileText className="w-6 h-6 text-primary-foreground" />
        </div>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      <Link to={`/documents/${document.id}`}>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {document.name}
        </h3>
      </Link>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Calendar className="w-4 h-4" />
        <span>{document.uploadedAt}</span>
      </div>

      <div className="flex items-center justify-between">
        <Badge 
          variant={document.status === 'analyzed' ? 'default' : 'secondary'}
          className={document.status === 'analyzed' ? '' : 'bg-muted'}
        >
          {document.status}
        </Badge>
        {document.risk && (
          <Badge className={cn("border", getRiskColor(document.risk))}>
            {document.risk} risk
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default DocumentCard;