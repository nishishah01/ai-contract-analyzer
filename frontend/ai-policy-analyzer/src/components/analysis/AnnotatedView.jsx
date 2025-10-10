import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AnnotatedView = ({ content, annotations = [] }) => {
  const renderAnnotatedText = () => {
    if (!content) return null;

    let lastIndex = 0;
    const segments = [];

    annotations.forEach((annotation, i) => {
      // Add text before annotation
      if (annotation.start > lastIndex) {
        segments.push(
          <span key={`text-${i}`}>
            {content.substring(lastIndex, annotation.start)}
          </span>
        );
      }

      // Add annotated text
      const riskColors = {
        low: 'bg-success/20 border-l-2 border-success',
        medium: 'bg-warning/20 border-l-2 border-warning',
        high: 'bg-destructive/20 border-l-2 border-destructive',
      };

      segments.push(
        <span
          key={`annotation-${i}`}
          className={cn(
            "px-1 rounded transition-all cursor-pointer hover:bg-opacity-30",
            riskColors[annotation.risk] || riskColors.medium
          )}
          title={annotation.explanation}
        >
          {content.substring(annotation.start, annotation.end)}
        </span>
      );

      lastIndex = annotation.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      segments.push(
        <span key="text-end">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return segments;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Document Content</h3>
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {renderAnnotatedText()}
        </div>
      </div>
      {annotations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Hover over highlighted text to see risk details. Click to view full analysis.
          </p>
        </div>
      )}
    </Card>
  );
};

export default AnnotatedView;