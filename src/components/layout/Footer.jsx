'use client'

import * as React from 'react'
import appConfig from '@/config/app-config'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white relative z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div>
            <p>
              {/* © {new Date().getFullYear()} {appConfig.footerAppName} */}
            </p>
          </div>
          <div>
            <p>
              Developed by{' '}
              <a
                href={appConfig.footerDevelopedByLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {appConfig.footerAppName}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
