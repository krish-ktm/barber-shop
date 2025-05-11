"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, DollarSign, FileText, Menu, MessageSquare, Settings, User, X } from "lucide-react"

export function StaffSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/staff" && pathname === "/staff") {
      return true
    }
    return pathname !== "/staff" && pathname?.startsWith(`${path}`)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/staff",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "My Schedule",
      href: "/staff/schedule",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Earnings",
      href: "/staff/earnings",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: "Customers",
      href: "/staff/customers",
      icon: <User className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/staff/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/staff/reports",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/staff/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Staff Portal</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-md transition-colors
                  ${
                    isActive(item.href)
                      ? "bg-gray-100 text-black font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }
                `}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div>
                <div className="font-medium">John Smith</div>
                <div className="text-sm text-gray-500">Senior Barber</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
