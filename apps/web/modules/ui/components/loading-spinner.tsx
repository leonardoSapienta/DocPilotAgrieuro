import { cn } from "../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-current border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof spinnerVariants> { }

export function LoadingSpinner({
  className,
  size,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size }), className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 