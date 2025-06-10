'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DatePicker } from '@/components/ui/date-picker'

export default function Home() {
  const [eventName, setEventName] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState<Date | undefined>()
  const [notes, setNotes] = useState('')
  const [setlistText, setSetlistText] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('登録中...')

    const isoDate = date?.toISOString().split('T')[0] // yyyy-mm-dd 形式

    // 1. イベントを登録
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert([{ event_name: eventName, location, date: isoDate, notes }])
      .select()
      .single()

    if (eventError || !eventData) {
      console.error(eventError)
      setMessage('イベント登録に失敗しました')
      return
    }

    const eventId = eventData.id

    // 2. セットリスト行を分割
    const lines = setlistText
      .split('\n')
      .map((line) => line.replace(/^\d+\.?\s*/, '').trim())
      .filter((line) => line.length > 0)

    if (lines.length === 0) {
      setMessage('イベント登録のみ完了しました（セットリストなし）')
      resetForm()
      return
    }

    // 3. 曲名から songs テーブルを検索
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('id, title')
      .in('title', lines)

    if (songsError) {
      console.error(songsError)
      setMessage('曲情報の取得に失敗しました')
      return
    }

    // 4. 該当曲がある行だけ setlists に登録
    const songMap = new Map(songs.map(song => [song.title, song]))
    
    const inserts = lines.map((title, index) => {
      if (title.toUpperCase() === 'MC') {
        return {
          event_id: eventId,
          song_id: null,
          item_type: 'mc',
          order: index + 1,
        }
      }
      
      const matched = songMap.get(title)
      return matched
        ? {
            event_id: eventId,
            song_id: matched.id,
            item_type: 'song',
            order: index + 1,
          }
        : null
    }).filter(Boolean)

    if (inserts.length > 0) {
      const { error: setlistsError } = await supabase
        .from('setlists')
        .insert(inserts)

      if (setlistsError) {
        console.error(setlistsError)
        setMessage('セットリストの登録に失敗しました（イベントは登録済）')
        return
      }

      setMessage('イベント＋セットリストの登録に成功しました！🎉')
    } else {
      setMessage('イベント登録成功！ただしセットリストに一致する曲が見つかりませんでした')
    }

    resetForm()
  }

  const resetForm = () => {
    setEventName('')
    setLocation('')
    setDate(undefined)
    setNotes('')
    setSetlistText('')
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 border rounded shadow space-y-6">
      <h1 className="text-2xl font-bold">Gran☆Ciel ライブ登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">イベント名</label>
          <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block font-semibold">会場</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block font-semibold">日付</label>
          <DatePicker date={date} setDate={setDate} />
        </div>
        <div>
          <label className="block font-semibold">備考</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded" rows={2} />
        </div>
        <div>
          <label className="block font-semibold">セットリスト（1行に1曲）</label>
          <textarea value={setlistText} onChange={(e) => setSetlistText(e.target.value)} className="w-full p-2 border rounded" rows={5} placeholder={`例：\n1. Answer\n2. True Love`} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          登録
        </button>
      </form>
      {message && <p className="text-sm text-green-700">{message}</p>}
    </main>
  )
}
