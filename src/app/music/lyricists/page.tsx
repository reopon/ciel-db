'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Song } from '@/lib/types'
import { SongDetailDialog } from '@/components/SongDetailDialog'

interface LyricistGroup {
  lyricist: string;
  songs: Song[];
}

export default function LyricistsPage() {
  const [lyricistGroups, setLyricistGroups] = useState<LyricistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSongsByLyricist = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('lyricist', { ascending: true })
        .order('release_date', { ascending: true });

      if (error) {
        console.error('Error fetching songs:', error);
        setLoading(false);
        return;
      }

      // 作詞家別にグループ化  
      const grouped = groupSongsByLyricist(data || []);
      setLyricistGroups(grouped);
      setLoading(false);
    };

    fetchSongsByLyricist();
  }, []);

  const groupSongsByLyricist = (songs: Song[]): LyricistGroup[] => {
    const groups = new Map<string, Song[]>();

    songs.forEach(song => {
      const lyricist = song.lyricist || '作詞者不明';
      if (!groups.has(lyricist)) {
        groups.set(lyricist, []);
      }
      groups.get(lyricist)!.push(song);
    });

    return Array.from(groups.entries()).map(([lyricist, songs]) => ({
      lyricist,
      songs
    }));
  };

  const handleClick = (song: Song) => {
    setSelectedSong(song);
    setOpen(true);
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
      <h1 className="text-2xl font-bold mb-6">作詞家別楽曲一覧</h1>

      <div className="space-y-6">
        {lyricistGroups.map((group) => (
          <Card key={group.lyricist}>
            <CardHeader>
              <CardTitle className="text-lg">
                {group.lyricist} ({group.songs.length}曲)
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
                      作曲: {song.composer || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SongDetailDialog 
        song={selectedSong}
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSelectedSong(null);
          }
        }}
      />

    </div>
  );
}
