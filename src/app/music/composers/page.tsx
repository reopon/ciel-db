'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Song } from '@/lib/types'
import { SongDetailDialog } from '@/components/SongDetailDialog'

interface ComposerGroup {
  composer: string;
  songs: Song[];
}

export default function ComposersPage() {
  const [composerGroups, setComposerGroups] = useState<ComposerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
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
