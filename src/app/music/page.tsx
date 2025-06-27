'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Song } from '@/lib/types'
import { SongDetailDialog } from '@/components/SongDetailDialog'

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
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

  const handleClick = (song: Song) => {
    setSelectedSong(song);
    setOpen(true);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Gran☆Ciel 楽曲一覧</h1>
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
