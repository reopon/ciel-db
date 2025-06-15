'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
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

  useEffect(() => {
    fetchEvents()
  }, [])

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

  const groupEventsByMonth = (events: Event[]) => {
    const grouped: { [key: string]: Event[] } = {}
    events.forEach(event => {
      const date = new Date(event.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(event)
    })
    return grouped
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

  const groupedEvents = groupEventsByMonth(events)

  return (
    <main className="max-w-4xl mx-auto mt-10 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gran☆Ciel カレンダー</h1>

      {events.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="text-lg">まだイベントが登録されていません</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, monthEvents]) => {
              const [year, month] = monthKey.split('-')
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long'
              })

              return (
                <div key={monthKey} className="space-y-4">
                  <h2 className="text-2xl font-semibold border-b pb-2">{monthName}</h2>
                  <div className="space-y-3">
                    {monthEvents
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((event) => {
                        const hasSetlist = event.setlists.length > 0
                        const isPast = new Date(event.date) < new Date()
                        const isClickable = hasSetlist && isPast

                        return (
                          <div
                            key={event.id}
                            className={`border rounded-lg p-4 bg-white shadow-sm ${
                              isClickable ? 'cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all' : ''
                            }`}
                            onClick={() => isClickable && handleEventClick(event)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm text-gray-600">{formatDate(event.date)}</span>
                                </div>
                                <h3 className={`text-lg font-semibold mb-1 ${isClickable ? 'text-blue-600' : ''}`}>
                                  {event.event_name}
                                </h3>
                                <div className="flex items-center text-gray-600">
                                  <MapPinIcon className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{event.location}</span>
                                </div>
                                {event.notes && (
                                  <p className="text-sm text-gray-500 mt-2">{event.notes}</p>
                                )}
                              </div>
                              {isClickable && (
                                <div className="text-xs text-blue-600 font-medium">
                                  セットリストを見る
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

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
