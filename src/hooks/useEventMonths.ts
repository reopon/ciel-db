'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface EventMonth {
  year: number
  month: number
  label: string
  url: string
}

export function useEventMonths() {
  const [eventMonths, setEventMonths] = useState<EventMonth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEventMonths()
  }, [])

  const fetchEventMonths = async () => {
    try {
      setLoading(true)
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('date')
        .order('date', { ascending: false })

      if (eventsError) {
        console.error(eventsError)
        setError('月別データの取得に失敗しました')
        return
      }

      if (!eventsData) {
        setEventMonths([])
        return
      }

      const uniqueMonths = new Set<string>()
      const months: EventMonth[] = []

      eventsData.forEach(event => {
        const date = new Date(event.date)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const monthKey = `${year}-${month}`

        if (!uniqueMonths.has(monthKey)) {
          uniqueMonths.add(monthKey)
          months.push({
            year,
            month,
            label: `${year}年${month.toString().padStart(2, '0')}月`,
            url: `/?year=${year}&month=${month}`
          })
        }
      })

      months.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

      setEventMonths(months)
    } catch (err) {
      console.error(err)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return { eventMonths, loading, error }
}
