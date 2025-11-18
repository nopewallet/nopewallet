"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "twz-50 tww-72 twrounded-md twborder twbg-popover twp-4 twtext-popover-foreground twshadow-md twoutline-none data-[state=open]:twanimate-in data-[state=closed]:twanimate-out data-[state=closed]:twfade-out-0 data-[state=open]:twfade-in-0 data-[state=closed]:twzoom-out-95 data-[state=open]:twzoom-in-95 data-[side=bottom]:twslide-in-from-top-2 data-[side=left]:twslide-in-from-right-2 data-[side=right]:twslide-in-from-left-2 data-[side=top]:twslide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
