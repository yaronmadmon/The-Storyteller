export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          description: string;
          mode: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          description: string;
          mode: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["books"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          username: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      chapters: {
        Row: {
          id: string;
          book_id: string;
          number: number;
          title: string;
          instructions: string;
          checklist: Json;
          transcription: string | null;
          polished: string | null;
          style: string;
          word_count: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          number: number;
          title: string;
          instructions: string;
          checklist: Json;
          transcription?: string | null;
          polished?: string | null;
          style?: string;
          word_count?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapters"]["Insert"]>;
      };
      introductions: {
        Row: {
          id: string;
          book_id: string;
          answers: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          answers: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["introductions"]["Insert"]>;
      };
    };
  };
}
