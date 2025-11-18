import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "twinline-flex twitems-center twrounded-md twborder twpx-2.5 twpy-0.5 twtext-xs twfont-semibold twtransition-colors focus:twoutline-none focus:twring-2 focus:twring-ring focus:twring-offset-2",
  {
    variants: {
      variant: {
        default:
          "twborder-transparent twbg-primary twtext-primary-foreground twshadow hover:twbg-primary/80",
        secondary:
          "twborder-transparent twbg-secondary twtext-secondary-foreground hover:twbg-secondary/80",
        destructive:
          "twborder-transparent twbg-destructive twtext-destructive-foreground twshadow hover:twbg-destructive/80",
        outline: "twtext-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
