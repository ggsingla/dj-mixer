import Link from "next/link";
import { ThemeToggle } from "./ui/theme-toggle";

export function Header() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            DJ Mixer
          </Link>
          <div className="flex items-center gap-6">
            {/* <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm hover:text-primary transition-colors">
                About
              </Link>
            </nav> */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
} 