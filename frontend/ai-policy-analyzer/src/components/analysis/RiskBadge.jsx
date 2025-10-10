import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const RiskBadge = ({ risk, score, size = 'default' }) => {
  const getRiskConfig = (riskLevel) => {
    const configs = {
      low: {
        icon: CheckCircle,
        className: 'bg-success/10 text-success border-success/20',
        label: 'Low Risk',
      },
      medium: {
        icon: AlertCircle,
        className: 'bg-warning/10 text-warning border-warning/20',
        label: 'Medium Risk',
      },
      high: {
        icon: AlertTriangle,
        className: 'bg-destructive/10 text-destructive border-destructive/20',
        label: 'High Risk',
      },
    };
    return configs[riskLevel] || configs.medium;
  };

  const config = getRiskConfig(risk);
  const Icon = config.icon;
  const isLarge = size === 'large';

  return (
    <Badge 
      className={cn(
        "border font-semibold gap-1.5",
        config.className,
        isLarge && "text-base px-4 py-2"
      )}
    >
      <Icon className={cn("w-4 h-4", isLarge && "w-5 h-5")} />
      {config.label}
      {score !== undefined && ` (${score}%)`}
    </Badge>
  );
};

export default RiskBadge;