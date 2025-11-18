"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DarkModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="relative w-9 h-9 border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
      >
        {((theme === "dark") || (theme === "system" && resolvedTheme === "dark")) ? (
          <Moon className="h-[1.2rem] w-[1.2rem] transition-all dark:text-yellow-400" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] transition-all text-black" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
      align="end"
      className="bg-zinc-900 border-none shadow-lg text-white"
      >
      <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
        Light
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
        System
      </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
