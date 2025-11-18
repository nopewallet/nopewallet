"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "twfixed twtop-0 twz-[100] twflex twmax-h-screen tww-full twflex-col-reverse twp-4 sm:twbottom-0 sm:twright-0 sm:twtop-auto sm:twflex-col md:twmax-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "twgroup twpointer-events-auto twrelative twflex tww-full twitems-center twjustify-between twspace-x-2 twoverflow-hidden twrounded-md twborder twp-4 twpr-6 twshadow-lg twtransition-all data-[swipe=cancel]:twtranslate-x-0 data-[swipe=end]:twtranslate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:twtranslate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:twtransition-none data-[state=open]:twanimate-in data-[state=closed]:twanimate-out data-[swipe=end]:twanimate-out data-[state=closed]:twfade-out-80 data-[state=closed]:twslide-out-to-right-full data-[state=open]:twslide-in-from-top-full data-[state=open]:sm:twslide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "twborder twbg-background twtext-foreground",
        destructive:
          "twdestructive twgroup twborder-destructive twbg-destructive twtext-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "twinline-flex twh-8 twshrink-0 twitems-center twjustify-center twrounded-md twborder twbg-transparent twpx-3 twtext-sm twfont-medium twtransition-colors hover:twbg-secondary focus:twoutline-none focus:twring-1 focus:twring-ring disabled:twpointer-events-none disabled:twopacity-50 group-[.destructive]:twborder-muted/40 group-[.destructive]:hover:twborder-destructive/30 group-[.destructive]:hover:twbg-destructive group-[.destructive]:hover:twtext-destructive-foreground group-[.destructive]:focus:twring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "twabsolute twright-1 twtop-1 twrounded-md twp-1 twtext-foreground/50 twopacity-0 twtransition-opacity hover:twtext-foreground focus:twopacity-100 focus:twoutline-none focus:twring-1 group-hover:twopacity-100 group-[.destructive]:twtext-red-300 group-[.destructive]:hover:twtext-red-50 group-[.destructive]:focus:twring-red-400 group-[.destructive]:focus:twring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="twh-4 tww-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("twtext-sm twfont-semibold [&+div]:twtext-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("twtext-sm twopacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
