import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Priority variants
        "priority-high": "border-transparent bg-priority-high text-priority-high-foreground",
        "priority-medium": "border-transparent bg-priority-medium text-priority-medium-foreground",
        "priority-low": "border-transparent bg-priority-low text-priority-low-foreground",
        // Status variants
        "status-pending": "border-transparent bg-status-pending/20 text-status-pending border-status-pending/30",
        "status-progress": "border-transparent bg-status-progress/20 text-status-progress border-status-progress/30",
        "status-resolved": "border-transparent bg-status-resolved/20 text-status-resolved border-status-resolved/30",
        // Sentiment variants
        "sentiment-positive": "border-transparent bg-sentiment-positive/20 text-sentiment-positive border-sentiment-positive/30",
        "sentiment-neutral": "border-transparent bg-sentiment-neutral/20 text-sentiment-neutral border-sentiment-neutral/30",
        "sentiment-negative": "border-transparent bg-sentiment-negative/20 text-sentiment-negative border-sentiment-negative/30",
        "sentiment-highly-negative": "border-transparent bg-sentiment-highly-negative/20 text-sentiment-highly-negative border-sentiment-highly-negative/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
