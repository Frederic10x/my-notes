export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          created_at: string;
          updated_at: string;
          is_voice_note: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          created_at?: string;
          updated_at?: string;
          is_voice_note?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
          is_voice_note?: boolean;
        };
      };
    };
  };
}
