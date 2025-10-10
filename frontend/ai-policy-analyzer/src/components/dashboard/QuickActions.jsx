import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, AlertTriangle, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Upload Document',
      description: 'Add new documents for analysis',
      icon: Upload,
      action: () => navigate('/documents'),
      variant: 'default',
    },
    {
      title: 'Review High Risk',
      description: 'Check documents with high risk scores',
      icon: AlertTriangle,
      action: () => navigate('/documents?filter=high-risk'),
      variant: 'destructive',
    },
    {
      title: 'Search Documents',
      description: 'Find specific clauses or terms',
      icon: FileSearch,
      action: () => navigate('/search'),
      variant: 'secondary',
    },
  ];

  return (
    <Card className="p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant}
              className="w-full justify-start h-auto py-4"
              onClick={action.action}
            >
              <Icon className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-semibold">{action.title}</p>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;