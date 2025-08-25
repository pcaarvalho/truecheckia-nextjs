'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Menu, 
  X,
  ArrowRight
} from "lucide-react"
// import { cn } from "@/lib/utils"

const MarketingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { 
      name: "Features", 
      action: () => scrollToSection('features'),
      type: "scroll" as const
    },
    { 
      name: "Pricing", 
      action: () => scrollToSection('pricing'),
      type: "scroll" as const
    },
    { 
      name: "Docs", 
      href: "/docs",
      type: "link" as const
    },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Shield className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <div className="absolute inset-0 w-8 h-8 text-blue-600 animate-pulse-glow opacity-30" />
          </div>
          <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            TrueCheck-AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            item.type === "scroll" ? (
              <button
                key={item.name}
                onClick={item.action}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.href!}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="ghost" 
            asChild 
            className="hover:bg-blue-50 transition-colors"
          >
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button 
            asChild 
            className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Link href="/register?plan=PRO">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navigationItems.map((item) => (
              item.type === "scroll" ? (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href!}
                  className="block text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild className="w-full group">
                <Link href="/register?plan=PRO" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default MarketingHeader