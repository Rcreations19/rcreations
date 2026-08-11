import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-cyan-accent shadow-[0_10px_30px_rgba(10,14,39,0.2)] hover:shadow-[0_10px_30px_rgba(42,171,176,0.3)] hover:-translate-y-1 transition-all",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "bg-white/50 backdrop-blur-sm border-2 border-primary/10 text-primary hover:bg-white hover:border-primary/20 transition-all shadow-sm",
        secondary:
          "bg-[#f0f4f8] text-primary hover:bg-[#f0f4f8]/80",
        ghost: "hover:bg-primary/5 hover:text-primary",
        link: "text-cyan-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
