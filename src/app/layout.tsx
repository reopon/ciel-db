'use client'

import { Geist, Geist_Mono } from "next/font/google";
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import "./globals.css";
import { ChevronDownIcon } from 'lucide-react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [musicMenuOpen, setMusicMenuOpen] = useState(false);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false)
    setMusicMenuOpen(false)
    setCalendarMenuOpen(false)
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold hover:text-blue-500">Gran☆Ciel Setlists</Link>

              {/* デスクトップメニュー */}
              <div className="hidden md:flex space-x-4">
                {/* カレンダー関連のサブメニュー */}
                <div className="relative group">
                  <button className="hover:text-blue-600 flex items-center">
                    カレンダー
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-64 overflow-y-auto">
                    <Link href="/?year=2025&month=1" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>2025年1月</Link>
                    <Link href="/?year=2025&month=2" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>2月</Link>
                    <Link href="/?year=2025&month=3" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>3月</Link>
                    <Link href="/?year=2025&month=4" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>4月</Link>
                    <Link href="/?year=2025&month=5" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>5月</Link>
                    <Link href="/?year=2025&month=6" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>6月</Link>
                    <Link href="/?year=2025&month=7" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>7月</Link>
                    <Link href="/?year=2025&month=8" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>8月</Link>
                    <Link href="/?year=2025&month=9" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>9月</Link>
                    <Link href="/?year=2025&month=10" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>10月</Link>
                    <Link href="/?year=2025&month=11" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>11月</Link>
                    <Link href="/?year=2025&month=12" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>12月</Link>
                  </div>
                </div>

                {/* 楽曲関連のサブメニュー */}
                <div className="relative group">
                  <button className="hover:text-blue-600 flex items-center">
                    楽曲
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/music" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>楽曲一覧</Link>
                    <Link href="/music/lyricists" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>作詞家別</Link>
                    <Link href="/music/composers" className="block px-4 py-2 hover:bg-gray-100" onClick={closeMenu}>作曲家別</Link>
                  </div>
                </div>

                {/* About */}
                <Link href="/about" className="hover:text-blue-600" onClick={closeMenu}>about</Link>
              </div>

              {/* ハンバーガーボタン */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* モバイルメニュー */}
            {isMenuOpen && (

              <div className="md:hidden">
                <div className="space-y-2">
                  {/* カレンダー関連のアコーディオン */}
                  <div>
                    <button
                      onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                    >
                      <span>カレンダー</span>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${calendarMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {calendarMenuOpen && (
                      <div className="ml-4 space-y-1 max-h-48 overflow-y-auto">
                        <Link href="/?year=2025&month=1" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>2025年1月</Link>
                        <Link href="/?year=2025&month=2" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>2月</Link>
                        <Link href="/?year=2025&month=3" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>3月</Link>
                        <Link href="/?year=2025&month=4" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>4月</Link>
                        <Link href="/?year=2025&month=5" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>5月</Link>
                        <Link href="/?year=2025&month=6" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>6月</Link>
                        <Link href="/?year=2025&month=7" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>7月</Link>
                        <Link href="/?year=2025&month=8" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>8月</Link>
                        <Link href="/?year=2025&month=9" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>9月</Link>
                        <Link href="/?year=2025&month=10" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>10月</Link>
                        <Link href="/?year=2025&month=11" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>11月</Link>
                        <Link href="/?year=2025&month=12" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>12月</Link>
                      </div>
                    )}
                  </div>

                  {/* 楽曲関連のアコーディオン */}
                  <div>
                    <button
                      onClick={() => setMusicMenuOpen(!musicMenuOpen)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                    >
                      <span>楽曲</span>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${musicMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {musicMenuOpen && (
                      <div className="ml-4 space-y-1">
                        <Link href="/music" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>楽曲一覧</Link>
                        <Link href="/music/lyricists" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>作詞家別</Link>
                        <Link href="/music/composers" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>作曲家別</Link>
                      </div>
                    )}
                  </div>

                  {/* About */}
                  <div>
                    <Link href="/about" className="block p-2 hover:bg-gray-100 rounded" onClick={closeMenu}>about</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
