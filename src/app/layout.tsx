import type { ReactNode } from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = { 
  title: "CORA CRM", 
  description: "Corporate relationship operations platform"
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className="min-h-full flex flex-col">{children}</body></html>
}
