'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Song, Event } from '@/lib/types'

interface SongDetailDialogProps {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SongDetailDialog({ song, open, onOpenChange }: SongDetailDialogProps) {
  const [events, setEvents] = useState<Event[]>([]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setEvents([]);
    }
  };

  const fetchEvents = async (songId: number) => {
    const { data, error } = await supabase
      .from('setlists')
      .select('event_id(id, event_name, date, location)')
      .eq('song_id', songId);

    if (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flattened = data.map((row: any) => row.event_id).filter(Boolean);
      flattened.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(flattened);
    }
  };

  useEffect(() => {
    if (open && song) {
      fetchEvents(song.id);
    }
  }, [open, song]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-sm:w-96 max-sm:max-w-96">
        <DialogHeader>
          <DialogTitle>{song?.title}</DialogTitle>
        </DialogHeader>
        {song && (
          <div className="text-sm space-y-2">
            <p><span className="font-medium">発売日:</span> {format(new Date(song.release_date), 'yyyy年M月d日')}</p>
            {song.notes && <p><span className="font-medium">備考:</span> {song.notes}</p>}
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
  );
}
