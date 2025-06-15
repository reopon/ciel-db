'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarIcon, MapPinIcon } from 'lucide-react'

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

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: Event[] }>({})

  useEffect(() => {
    fetchEvents()
  }, [])

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

  const handleEventClick = (event: Event) => {
    if (event.setlists.length > 0) {
      setSelectedEvent(event)
      setShowEventModal(true)
    }
  }

  const CustomDayButton = ({ day, modifiers, ...props }: any) => {
    const dateKey = day.date.toISOString().split('T')[0]
    const dayEvents = eventsByDate[dateKey] || []
    
    const handleDayClick = (e: React.MouseEvent) => {
      e.preventDefault()
      if (dayEvents.length === 1) {
        const event = dayEvents[0]
        const hasSetlist = event.setlists.length > 0
        const isPast = new Date(event.date) < new Date()
        if (hasSetlist && isPast) {
          setSelectedEvent(event)
          setShowEventModal(true)
        }
      } else if (dayEvents.length > 1) {
        const clickableEvent = dayEvents.find(event => {
          const hasSetlist = event.setlists.length > 0
          const isPast = new Date(event.date) < new Date()
          return hasSetlist && isPast
        })
        if (clickableEvent) {
          setSelectedEvent(clickableEvent)
          setShowEventModal(true)
        }
      }
    }

    return (
      <div
        className={`
          flex flex-col items-center justify-start h-auto min-h-[80px] p-2 text-xs leading-tight border-0 bg-transparent
          ${modifiers.selected ? 'bg-primary text-primary-foreground' : ''}
          ${modifiers.today ? 'bg-accent text-accent-foreground font-bold' : ''}
          ${modifiers.outside ? 'text-muted-foreground opacity-50' : ''}
          ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}
        `}
        onClick={dayEvents.length > 0 ? handleDayClick : undefined}
        {...props}
      >
        <div className="font-medium text-sm mb-1">{day.date.getDate()}</div>
        <div className="flex flex-col gap-1 w-full">
          {dayEvents.slice(0, 2).map((event, index) => {
            const hasSetlist = event.setlists.length > 0
            const isPast = new Date(event.date) < new Date()
            const isClickable = hasSetlist && isPast
            
            return (
              <div
                key={event.id}
                className={`
                  text-[9px] truncate w-full px-1 py-0.5 rounded text-center leading-tight
                  ${isClickable ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-600 bg-gray-100'}
                `}
                title={event.event_name}
              >
                {event.event_name.length > 15 ? event.event_name.substring(0, 15) + '...' : event.event_name}
              </div>
            )
          })}
          {dayEvents.length > 2 && (
            <div className="text-[8px] text-gray-500 text-center">+{dayEvents.length - 2} more</div>
          )}
        </div>
      </div>
    )
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
    <main className="max-w-4xl mx-auto mt-10 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gran☆Ciel Calendar</h1>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          showOutsideDays={true}
          components={{
            DayButton: CustomDayButton
          }}
          className="rounded-md border shadow"
        />
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
                            {setlist.item_type === 'mc' ? '' : `${songNumber++}.`}
                          </span>
                          <span className="ml-2">
                            {setlist.item_type === 'mc' ? (
                              <span className="text-gray-500 italic">MC</span>
                            ) : (
                              <span>{setlist.song?.title}</span>
                            )}
                            {setlist.notes && (
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

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setShowEventModal(false)}
              >
                閉じる
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
