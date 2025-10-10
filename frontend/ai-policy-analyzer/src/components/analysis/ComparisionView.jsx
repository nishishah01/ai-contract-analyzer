import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ComparisonView = ({ original, rewritten }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Original</h3>
          <Badge variant="outline">Current Version</Badge>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {original}
          </p>
        </div>
      </Card>

      <Card className="p-6 border-success/50 bg-success/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Suggested Rewrite</h3>
          <Badge className="bg-success/10 text-success border-success/20">
            Improved
          </Badge>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {rewritten}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonView;