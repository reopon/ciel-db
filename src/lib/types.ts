export interface Song {
  id: number;
  title: string;
  release_date: string;
  lyricist: string | null;
  composer: string | null;
  arranger: string | null;
  choreographer: string | null;
  notes: string | null;
}

export interface Event {
  id: number;
  event_name: string;
  date: string;
  location?: string;
}
