import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "twflex twmin-h-[60px] tww-full twrounded-md twborder twborder-input twbg-transparent twpx-3 twpy-2 twtext-base twshadow-sm placeholder:twtext-muted-foreground focus-visible:twoutline-none focus-visible:twring-1 focus-visible:twring-ring disabled:twcursor-not-allowed disabled:twopacity-50 md:twtext-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
