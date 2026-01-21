'use client'

import * as React from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import appConfig from '@/config/app-config'

export default function Header() {

  return (
    <header className="sticky top-0 z-[999] w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <MapPin className="h-5 w-5 text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {appConfig.appName}
            </h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/about">
            <Button variant="ghost" size="sm" className="text-sm">
              About
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
