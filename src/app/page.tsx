'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface Song {
  id: number
  title: string
  lyricist?: string
  composer?: string
  arranger?: string
}

interface Event {
  id: number
  event_name: string
  location: string
  date: string
  notes?: string
  setlists: Array<{
    order: number
    item_type: string
    notes?: string
    song: Song | null
  }>
}

function CalendarPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  
  const getInitialMonth = () => {
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')
    
    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10)
      const month = parseInt(monthParam, 10) - 1
      
      if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
        return new Date(year, month, 1)
      }
    }
    
    return new Date()
  }
  
  const [currentMonth, setCurrentMonth] = useState<Date>(getInitialMonth())
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: Event[] }>({})

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')
    
    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10)
      const month = parseInt(monthParam, 10) - 1
      
      if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
        const newMonth = new Date(year, month, 1)
        if (newMonth.getTime() !== currentMonth.getTime()) {
          setCurrentMonth(newMonth)
        }
      }
    }
  }, [searchParams, currentMonth])

  useEffect(() => {
    const dateMap: { [key: string]: Event[] } = {}
    events.forEach(event => {
      const dateKey = event.date
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = []
      }
      dateMap[dateKey].push(event)
    })
    setEventsByDate(dateMap)
  }, [events])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          event_name,
          location,
          date,
          notes,
          setlists (
            order,
            item_type,
            notes,
            songs (
              id,
              title,
              lyricist,
              composer,
              arranger
            )
          )
        `)
        .order('date', { ascending: false })

      if (eventsError) {
        console.error(eventsError)
        setError('イベント情報の取得に失敗しました')
        return
      }

      if (!eventsData) {
        setEvents([])
        return
      }

      interface EventData {
        id: number
        event_name: string
        location: string
        date: string
        notes?: string
        setlists: Array<{
          order: number
          item_type: string
          notes?: string
          songs: Song | null
        }>
      }

      const transformedEvents: Event[] = (eventsData as unknown as EventData[]).map((event) => ({
        id: event.id,
        event_name: event.event_name,
        location: event.location,
        date: event.date,
        notes: event.notes,
        setlists: (event.setlists || [])
          .map((setlist) => ({
            order: setlist.order,
            item_type: setlist.item_type,
            notes: setlist.notes,
            song: setlist.songs
          }))
          .sort((a, b) => a.order - b.order)
      }))

      setEvents(transformedEvents)
    } catch (err) {
      console.error(err)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      days.push(dayDate)
    }
    
    return days
  }

  const updateURL = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', year.toString())
    params.set('month', month.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(newMonth)
    updateURL(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(newMonth)
    updateURL(newMonth)
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto mt-10 p-6">
        <div className="text-center">
          <p className="text-lg">カレンダーを読み込み中...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto mt-10 p-6">
        <div className="text-center text-red-600">
          <p className="text-lg">{error}</p>
          <Button onClick={fetchEvents} className="mt-4">
            再試行
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">Gran☆Ciel Setlists</h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white rounded-lg border shadow-sm p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {formatMonthYear(currentMonth)}
          </h2>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {getDaysInMonth(currentMonth).map((dayDate) => {
            const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`
            const dayEvents = eventsByDate[dateKey] || []
            const isToday = dayDate.toDateString() === new Date().toDateString()
            
            return (
              <div
                key={dateKey}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  isToday ? 'bg-accent border-accent-foreground/20' : 'bg-white'
                }`}
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <div className={`text-2xl font-bold ${isToday ? 'text-accent-foreground' : 'text-gray-900'}`}>
                    {dayDate.getDate()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {dayDate.toLocaleDateString('ja-JP', { weekday: 'short' })}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  {dayEvents.length > 0 ? (
                    <div className="space-y-2">
                      {dayEvents.map((event) => {
                        const hasSetlist = event.setlists.length > 0
                        const isPast = new Date(event.date) < new Date()
                        const isClickable = hasSetlist && isPast
                        
                        return (
                          <div
                            key={event.id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              isClickable 
                                ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
                                : 'text-gray-700 bg-gray-50'
                            }`}
                            onClick={() => {
                              if (isClickable) {
                                setSelectedEvent(event)
                                setShowEventModal(true)
                              }
                            }}
                          >
                            <div className="font-medium">{event.event_name}</div>
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {event.location}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">-</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-md">
          {selectedEvent && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="border-b pb-2">
                  {selectedEvent.event_name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              {selectedEvent.setlists.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">セットリスト</h4>
                  <ol className="space-y-2">
                    {(() => {
                      let songNumber = 1;
                      return selectedEvent.setlists.map((setlist, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-gray-500 font-mono text-sm w-8">
                            {setlist.item_type === 'other' ? '' : `${songNumber++}.`}
                          </span>
                          <span className="ml-2">
                            {setlist.item_type === 'song' && (
                              <span>{setlist.song?.title}</span>
                            )}
                            {setlist.item_type === 'other' && setlist.notes && (
                              <span className="text-gray-600 italic">{setlist.notes}</span>
                            )}
                            {setlist.notes && setlist.item_type === 'song' && (
                              <span className="ml-2 text-gray-500 text-sm">
                                {setlist.notes}
                              </span>
                            )}
                          </span>
                        </li>
                      ));
                    })()}
                  </ol>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const url = `${window.location.origin}/setlist/${selectedEvent.id}`
                    navigator.clipboard.writeText(url).then(() => {
                      console.log('リンクをコピーしました')
                    }).catch(() => {
                      console.log('リンクのコピーに失敗しました')
                    })
                  }}
                >
                  リンクをコピー
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowEventModal(false)}
                >
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">カレンダーを読み込み中...</div>}>
      <CalendarPageContent />
    </Suspense>
  )
}
