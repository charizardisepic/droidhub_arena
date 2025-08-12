import React from "react"
import { checkArenaEnvironment } from "@/lib/arenaConfig"
import { ArenaNavbar } from "./ArenaNavbar"
import { StandardNavbar } from "./StandardNavbar"

export const Navbar = () => {
  const isArenaEnvironment = checkArenaEnvironment()
  
  if (isArenaEnvironment) {
    return <ArenaNavbar />
  }
  
  return <StandardNavbar />
}
