import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import SetlistPageClient from './SetlistPageClient'

export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }): Promise<Metadata> {
  try {
    const { eventId } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: eventData, error } = await supabase
      .from('events')
      .select(`
        id,
        event_name,
        location,
        date,
        setlists (
          order,
          item_type,
          notes,
          songs (
            title
          )
        )
      `)
      .eq('id', eventId)
      .single()

    if (error || !eventData) {
      return {
        title: 'セットリストが見つかりません - Gran☆Ciel Setlists',
        description: 'お探しのセットリストは見つかりませんでした。'
      }
    }

    const date = new Date(eventData.date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const setlistPreview = eventData.setlists
      ?.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      ?.slice(0, 5)
      ?.map((setlist: { item_type: string; songs?: { title: string } | null; notes?: string }) => 
        setlist.item_type === 'song' ? setlist.songs?.title : setlist.notes
      )
      ?.filter(Boolean)
      ?.join(', ') || ''

    const title = `${eventData.event_name} - Gran☆Ciel Setlists`
    const description = `${date} @ ${eventData.location}のセットリスト${setlistPreview ? `: ${setlistPreview}${eventData.setlists?.length > 5 ? '...' : ''}` : ''}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'Gran☆Ciel Setlists',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Gran☆Ciel Setlists',
      description: 'Gran☆Cielのセットリスト情報'
    }
  }
}

export default async function SetlistPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  return <SetlistPageClient eventId={eventId} />
}
