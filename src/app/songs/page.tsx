'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Song {
  id: number;
  title: string;
  release_date: string;
  lyricist: string | null;
  composer: string | null;
  arranger: string | null;
  choreographer: string | null;
  notes: string | null;
}

interface Event {
  id: number;
  event_name: string;
  date: string;
  location?: string;
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from('songs').select('*').order('release_date', { ascending: true }).order('id', { ascending: true });
      if (error) {
        console.error('Error fetching songs:', error);
      } else {
        setSongs(data || []);
      }
    };
    fetchSongs();
  }, []);

  const handleClick = async (song: Song) => {
    setSelectedSong(song);
    setOpen(true);

    const { data, error } = await supabase
      .from('setlists')
      .select('event_id(id, event_name, date, location)')
      .eq('song_id', song.id);

    if (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flattened = data.map((row: any) => row.event_id).filter(Boolean);
      flattened.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(flattened);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gran☆Ciel 曲一覧</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300 min-w-[400px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border sticky left-0 bg-gray-100 z-10 min-w-[80px]">曲名</th>
              <th className="p-2 border min-w-[80px]">作詞</th>
              <th className="p-2 border min-w-[80px]">作曲</th>
              <th className="p-2 border min-w-[80px]">編曲</th>
              <th className="p-2 border min-w-[80px]">振付</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id} className="hover:bg-gray-50">
                <td className="p-2 border font-medium text-blue-500 sticky left-0 bg-white z-10 cursor-pointer"
                  onClick={() => handleClick(song)}>{song.title}</td>
                <td className="p-2 border">{song.lyricist || '-'}</td>
                <td className="p-2 border">{song.composer || '-'}</td>
                <td className="p-2 border">{song.arranger || '-'}</td>
                <td className="p-2 border">{song.choreographer || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSelectedSong(null);
          setEvents([]);
        }
      }}>
        <DialogContent className="max-sm:w-96 max-sm:max-w-96">
          <DialogHeader>
            <DialogTitle>{selectedSong?.title}</DialogTitle>
          </DialogHeader>
          {selectedSong && (
            <div className="text-sm space-y-2">
              <p><span className="font-medium">発売日:</span> {format(new Date(selectedSong.release_date), 'yyyy年M月d日')}</p>
              {selectedSong.notes && <p><span className="font-medium">備考:</span> {selectedSong.notes}</p>}
              <div>
                {events.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-gray-100">
                      <thead>
                        <tr className="bg-gray-25">
                          <th className="text-left py-1 px-2 border-b border-gray-100 font-normal text-gray-600">日付</th>
                          <th className="text-left py-1 px-2 border-b border-gray-100 font-normal text-gray-600">イベント</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-25">
                            <td className="py-1 px-2 border-b border-gray-50 whitespace-nowrap">
                              {format(new Date(event.date), 'yyyy年M月d日')}
                            </td>
                            <td className="py-1 px-2 border-b border-gray-50">
                              {event.event_name}<br /><span className="text-gray-500">@{event.location || '-'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
