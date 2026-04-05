import { Link } from "react-router-dom"
import ThemeSwitcher from "@/components/theme-switcher/theme-switcher"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-6">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
          Components
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  )
}
