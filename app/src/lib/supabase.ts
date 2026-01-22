import { createClient } from '@supabase/supabase-js';

// Deze waardes komen uit je Supabase project settings
// Maak een .env bestand aan met deze variabelen
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types voor Supabase
export interface Database {
  public: {
    Tables: {
      nodes: {
        Row: {
          id: string;
          data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          data: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          data?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      edges: {
        Row: {
          id: string;
          van: string;
          naar: string;
          label: string | null;
          type: string;
          created_at: string;
        };
        Insert: {
          id: string;
          van: string;
          naar: string;
          label?: string | null;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          van?: string;
          naar?: string;
          label?: string | null;
          type?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          naam: string;
          beschrijving: string;
          actief: boolean;
          versie: string;
          afhankelijkheden: string[] | null;
        };
        Insert: {
          id: string;
          naam: string;
          beschrijving: string;
          actief?: boolean;
          versie: string;
          afhankelijkheden?: string[] | null;
        };
        Update: {
          id?: string;
          naam?: string;
          beschrijving?: string;
          actief?: boolean;
          versie?: string;
          afhankelijkheden?: string[] | null;
        };
      };
    };
  };
}
