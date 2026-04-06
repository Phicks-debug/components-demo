import ThemeSwitcher from "@/components/theme-switcher/theme-switcher"
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-6">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
          Phicks's Component Collection
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://phickstran.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </a>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
