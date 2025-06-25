'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

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

interface ComposerGroup {
  composer: string;
  songs: Song[];
}

export default function ComposersPage() {
  const [composerGroups, setComposerGroups] = useState<ComposerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSongsByComposer = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('composer', { ascending: true })
        .order('release_date', { ascending: true });

      if (error) {
        console.error('Error fetching songs:', error);
        setLoading(false);
        return;
      }

      // 作詞家別にグループ化  
      const grouped = groupSongsByComposer(data || []);
      setComposerGroups(grouped);
      setLoading(false);
    };

    fetchSongsByComposer();
  }, []);

  const groupSongsByComposer = (songs: Song[]): ComposerGroup[] => {
    const groups = new Map<string, Song[]>();

    songs.forEach(song => {
      const composer = song.composer || '作曲者不明';
      if (!groups.has(composer)) {
        groups.set(composer, []);
      }
      groups.get(composer)!.push(song);
    });

    return Array.from(groups.entries()).map(([composer, songs]) => ({
      composer,
      songs
    }));
  };

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

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <p className="text-center">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">作曲家別楽曲一覧</h1>

      <div className="space-y-6">
        {composerGroups.map((group) => (
          <Card key={group.composer}>
            <CardHeader>
              <CardTitle className="text-lg">
                {group.composer} ({group.songs.length}曲)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.songs.map((song) => (
                  <div
                    key={song.id}
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium text-blue-500"
                      onClick={() => handleClick(song)}
                    >
                      {song.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      作詞: {song.lyricist || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
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