import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "desperate";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border bg-background pl-3 pr-[44px] py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Default border
          variant === "default" && "border-input",
          // Desperate variant: Electric Lime or Red border
          variant === "desperate" && "border-[#CFFF04] border-2 focus-visible:border-[#CFFF04] focus-visible:ring-[#CFFF04]/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

export { Select };
