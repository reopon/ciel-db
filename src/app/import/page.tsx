'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ImportPage() {
  const [rawText, setRawText] = useState('')
  const [message, setMessage] = useState('')
  const [unmatched, setUnmatched] = useState<string[]>([])

  const handleImport = async () => {
    setMessage('登録中...')
    setUnmatched([])

    const lines = rawText.split('\n').map((line) => line.trim()).filter(Boolean)

    let dateLine = lines.find((line) => /^\d{4}\.\d{1,2}\.\d{1,2}/.test(line))
    let eventName = lines[lines.indexOf(dateLine!) + 1] || '無題イベント'
    let locationLine = lines.find((line) => line.startsWith('@'))
    let setlistIndex = lines.findIndex((line) => line.startsWith('#'))

    const date = dateLine
      ? new Date(dateLine.replace(/[^\d.]/g, '').replace(/\./g, '-'))
      : undefined
    const location = locationLine?.replace(/^@ ?/, '').trim() || '場所不明'
    const setlistLines = lines
      .slice(setlistIndex + 1)
      .map((line) => line.replace(/^\d+\.?\s*/, '').trim())
      .filter((line) => line.length > 0)

    if (!date) {
      setMessage('日付の解析に失敗しました')
      return
    }

    const isoDate = date.toISOString().split('T')[0]

    // イベントを登録
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert([{ event_name: eventName, location, date: isoDate }])
      .select()
      .single()

    if (eventError || !eventData) {
      console.error(eventError)
      setMessage('イベント登録に失敗しました')
      return
    }

    const eventId = eventData.id

    // 曲照合
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('id, title')
      .in('title', setlistLines)

    if (songsError) {
      console.error(songsError)
      setMessage('曲情報の取得に失敗しました')
      return
    }

    const unmatchedTitles: string[] = []

    const inserts = setlistLines.map((title, index) => {
      const song = songs.find((s) => s.title === title)
      if (!song) unmatchedTitles.push(title)
      return song
        ? {
            event_id: eventId,
            song_id: song.id,
            order: index + 1,
          }
        : null
    }).filter(Boolean)

    if (inserts.length > 0) {
      const { error: setlistError } = await supabase
        .from('setlists')
        .insert(inserts)

      if (setlistError) {
        console.error(setlistError)
        setMessage('セットリストの登録に失敗しました（イベントは登録済）')
        return
      }
    }

    setUnmatched(unmatchedTitles)

    if (unmatchedTitles.length > 0) {
      setMessage('登録完了（一部の曲は登録できませんでした）')
    } else {
      setMessage('登録完了しました！🎉')
    }

    setRawText('')
  }

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow space-y-6">
      <h1 className="text-2xl font-bold">#しえるセットリスト</h1>
      
      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        className="w-full p-4 border rounded h-64 font-mono"
        placeholder={`2025.6.8(日)\nHYPE IDOL！× AGE FES!\n@ 品川グランドホール\n\n#しえるセットリスト\nYakusoku\nWe Can\n僕らの未来へ\n閃光Believer`}
      />

      <button
        onClick={handleImport}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        登録する
      </button>

      {message && <p className="text-green-700 whitespace-pre-wrap">{message}</p>}

      {unmatched.length > 0 && (
        <div className="mt-4 text-red-600">
          <p className="font-semibold">以下の曲は songs テーブルに見つかりませんでした：</p>
          <ul className="list-disc list-inside">
            {unmatched.map((title, i) => (
              <li key={i}>{title}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
