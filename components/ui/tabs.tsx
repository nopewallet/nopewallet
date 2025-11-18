"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "twinline-flex twh-9 twitems-center twjustify-center twrounded-lg twbg-muted twp-1 twtext-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "twinline-flex twitems-center twjustify-center twwhitespace-nowrap twrounded-md twpx-3 twpy-1 twtext-sm twfont-medium twring-offset-background twtransition-all focus-visible:twoutline-none focus-visible:twring-2 focus-visible:twring-ring focus-visible:twring-offset-2 disabled:twpointer-events-none disabled:twopacity-50 data-[state=active]:twbg-background data-[state=active]:twtext-foreground data-[state=active]:twshadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "twmt-2 twring-offset-background focus-visible:twoutline-none focus-visible:twring-2 focus-visible:twring-ring focus-visible:twring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
