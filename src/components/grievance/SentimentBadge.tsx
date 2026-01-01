import { Badge } from "@/components/ui/badge";
import { type SentimentType } from "@/types/grievance";
import { Frown, Meh, Smile, AlertOctagon } from "lucide-react";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  showIcon?: boolean;
}

const sentimentConfig: Record<SentimentType, { 
  label: string; 
  variant: "sentiment-positive" | "sentiment-neutral" | "sentiment-negative" | "sentiment-highly-negative";
  icon: typeof Frown;
}> = {
  positive: { 
    label: "Positive", 
    variant: "sentiment-positive",
    icon: Smile
  },
  neutral: { 
    label: "Neutral", 
    variant: "sentiment-neutral",
    icon: Meh
  },
  negative: { 
    label: "Negative", 
    variant: "sentiment-negative",
    icon: Frown
  },
  highly_negative: { 
    label: "Highly Negative", 
    variant: "sentiment-highly-negative",
    icon: AlertOctagon
  },
};

export function SentimentBadge({ sentiment, showIcon = true }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
