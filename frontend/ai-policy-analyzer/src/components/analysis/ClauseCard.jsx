import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RiskBadge from './RiskBadge';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ClauseCard = ({ clause, onAccept, onReject, showActions = true }) => {
  return (
    <Card className="p-6 space-y-4 hover:shadow-card transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <RiskBadge risk={clause.risk} />
            {clause.category && (
              <Badge variant="outline">{clause.category}</Badge>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Original Clause:
          </p>
          <p className="text-sm text-foreground mb-4 bg-muted/50 p-3 rounded-lg">
            {clause.text}
          </p>
        </div>
      </div>

      {clause.explanation && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-warning mb-1">Issue Identified:</p>
              <p className="text-sm text-foreground">{clause.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {clause.rewrite && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <p className="font-medium text-sm text-success mb-2">Suggested Rewrite:</p>
          <p className="text-sm text-foreground">{clause.rewrite}</p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onAccept(clause.id)}
            className="flex-1 bg-success hover:bg-success/90"
          >
            <Check className="w-4 h-4 mr-2" />
            Accept Rewrite
          </Button>
          <Button
            onClick={() => onReject(clause.id)}
            variant="outline"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Keep Original
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ClauseCard;