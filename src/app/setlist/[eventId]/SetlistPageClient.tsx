'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CalendarIcon, MapPinIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

interface SetlistPageClientProps {
  eventId: string
}

export default function SetlistPageClient({ eventId }: SetlistPageClientProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: eventData, error: eventError } = await supabase
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
        .eq('id', eventId)
        .single()

      if (eventError) {
        console.error(eventError)
        if (eventError.code === 'PGRST116') {
          notFound()
        }
        setError('イベント情報の取得に失敗しました')
        return
      }

      if (!eventData) {
        notFound()
        return
      }

      const transformedEvent: Event = {
        id: eventData.id,
        event_name: eventData.event_name,
        location: eventData.location,
        date: eventData.date,
        notes: eventData.notes,
        setlists: (eventData.setlists || [])
          .map((setlist: {
            order: number
            item_type: string
            notes?: string
            songs?: Song[]
          }) => ({
            order: setlist.order,
            item_type: setlist.item_type,
            notes: setlist.notes,
            song: setlist.songs && setlist.songs.length > 0 ? setlist.songs[0] : null
          }))
          .sort((a, b) => a.order - b.order)
      }

      setEvent(transformedEvent)
    } catch (err) {
      console.error(err)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto mt-10 p-6">
        <div className="text-center">
          <p className="text-lg">セットリストを読み込み中...</p>
        </div>
      </main>
    )
  }

  if (error || !event) {
    return (
      <main className="max-w-2xl mx-auto mt-10 p-6">
        <div className="text-center text-red-600">
          <p className="text-lg">{error || 'セットリストが見つかりません'}</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
            カレンダーに戻る
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 space-y-6">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          ← カレンダーに戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
        <h1 className="text-2xl font-bold border-b pb-2">
          {event.event_name}
        </h1>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>

        {event.setlists.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="font-semibold mb-3">セットリスト</h2>
            <ol className="space-y-2">
              {(() => {
                let songNumber = 1;
                return event.setlists.map((setlist, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-gray-500 font-mono text-sm w-8">
                      {setlist.item_type === 'other' ? '' : `${songNumber++}.`}
                    </span>
                    <span className="ml-2">
                      {setlist.item_type === 'song' && setlist.song && (
                        <span>{setlist.song.title}</span>
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

        {event.setlists.length === 0 && (
          <div className="border-t pt-4 text-center text-gray-500">
            <p>セットリスト情報がありません</p>
          </div>
        )}
      </div>
    </main>
  )
}
