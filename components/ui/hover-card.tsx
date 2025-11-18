"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "twz-50 tww-64 twrounded-md twborder twbg-popover twp-4 twtext-popover-foreground twshadow-md twoutline-none data-[state=open]:twanimate-in data-[state=closed]:twanimate-out data-[state=closed]:twfade-out-0 data-[state=open]:twfade-in-0 data-[state=closed]:twzoom-out-95 data-[state=open]:twzoom-in-95 data-[side=bottom]:twslide-in-from-top-2 data-[side=left]:twslide-in-from-right-2 data-[side=right]:twslide-in-from-left-2 data-[side=top]:twslide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
