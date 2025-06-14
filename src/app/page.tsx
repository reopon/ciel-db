'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarIcon, MapPinIcon, StickyNoteIcon } from 'lucide-react'

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

export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set())
  const [songDetails, setSongDetails] = useState<{
    song: Song
    performanceCount: number
  } | null>(null)
  const [showSongModal, setShowSongModal] = useState(false)

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
      const allEventIds = new Set(transformedEvents.map(event => event.id))  
      setExpandedEvents(allEventIds)
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

  const fetchSongDetails = async (song: Song) => {
    try {
      const { data: performanceData, error: performanceError } = await supabase
        .from('setlists')
        .select('id')
        .eq('song_id', song.id)

      if (performanceError) {
        console.error(performanceError)
        return
      }

      const performanceCount = performanceData?.length || 0

      setSongDetails({
        song,
        performanceCount
      })
      setShowSongModal(true)
    } catch (err) {
      console.error('Failed to fetch song details:', err)
    }
  }

  const handleSongClick = (song: Song) => {
    if (song) {
      fetchSongDetails(song)
    }
  }

  const handleSongLongPress = (song: Song) => {
    if (song) {
      fetchSongDetails(song)
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto mt-10 p-6">
        <div className="text-center">
          <p className="text-lg">イベント情報を読み込み中...</p>
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
    <main className="max-w-4xl mx-auto mt-10 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Gran☆Ciel</h1>

      {events.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="text-lg">まだイベントが登録されていません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg shadow-sm bg-white">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <h2 className="text-xl font-semibold mb-2">{event.event_name}</h2>
                    <div className="text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span className="ml-2">{formatDate(event.date)}</span>
                      </p>
                      <p className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span className="ml-2">{event.location}</span>
                      </p>
                      {event.notes && (
                        <p className="flex items-start">
                          <StickyNoteIcon className="h-4 w-4 mr-2" />
                          <span className="ml-2">{event.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {event.setlists.length > 0 && expandedEvents.has(event.id) && (
                  <div className="border-t pt-4">
                    <ol className="space-y-2">
                      {(() => {
                        let songNumber = 1;
                        return event.setlists.map((setlist, index) => (
                          <li key={index} className="flex items-center">
                            <span className="text-gray-500 font-mono text-sm w-8">
                              {setlist.item_type === 'mc' ? '' : `${songNumber++}.`}
                            </span>
                            <span className="ml-2">
                              {setlist.item_type === 'mc' ? '' : (
                                <span
                                  className="cursor-pointer hover:text-blue-600 hover:underline"
                                  onClick={() => setlist.song && handleSongClick(setlist.song)}
                                  onTouchStart={(e) => {
                                    if (setlist.song) {
                                      const touchTimer = setTimeout(() => {
                                        handleSongLongPress(setlist.song!)
                                      }, 500)
                                      e.currentTarget.dataset.touchTimer = touchTimer.toString()
                                    }
                                  }}
                                  onTouchEnd={(e) => {
                                    const touchTimer = e.currentTarget.dataset.touchTimer
                                    if (touchTimer) {
                                      clearTimeout(parseInt(touchTimer))
                                      delete e.currentTarget.dataset.touchTimer
                                    }
                                  }}
                                  onTouchCancel={(e) => {
                                    const touchTimer = e.currentTarget.dataset.touchTimer
                                    if (touchTimer) {
                                      clearTimeout(parseInt(touchTimer))
                                      delete e.currentTarget.dataset.touchTimer
                                    }
                                  }}
                                  onContextMenu={(e) => {
                                    e.preventDefault()
                                    if (setlist.song) {
                                      handleSongLongPress(setlist.song)
                                    }
                                  }}
                                >
                                  {setlist.song?.title}
                                </span>
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

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Song Details Modal */}
      <Dialog open={showSongModal} onOpenChange={setShowSongModal}>
        <DialogContent className="w-80">
          {songDetails && (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle className="border-b pb-2">
                  {songDetails.song.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">作詞:</span>
                  <span>{songDetails.song.lyricist || ''}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">作曲:</span>
                  <span>{songDetails.song.composer || ''}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">編曲:</span>
                  <span>{songDetails.song.arranger || ''}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => setShowSongModal(false)}
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
