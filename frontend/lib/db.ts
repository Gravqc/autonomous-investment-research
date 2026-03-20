import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  throw new Error('Missing Supabase environment variables');
}

export { supabase };

export type Database = {
  public: {
    Tables: {
      portfolios: {
        Row: {
          id: number;
          name: string;
          strategy_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          strategy_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          strategy_name?: string | null;
          created_at?: string;
        };
      };
      trades: {
        Row: {
          id: number;
          portfolio_id: number;
          symbol: string;
          side: string;
          quantity: number;
          price: number;
          total_value: number;
          executed_at: string;
          decision_id: number | null;
        };
        Insert: {
          portfolio_id: number;
          symbol: string;
          side: string;
          quantity: number;
          price: number;
          total_value: number;
          executed_at?: string;
          decision_id?: number | null;
        };
        Update: {
          id?: number;
          portfolio_id?: number;
          symbol?: string;
          side?: string;
          quantity?: number;
          price?: number;
          total_value?: number;
          executed_at?: string;
          decision_id?: number | null;
        };
      };
      decisions: {
        Row: {
          id: number;
          portfolio_id: number;
          action_summary: string;
          confidence: number;
          reasoning: string;
          raw_llm_output: string;
          model_used: string;
          created_at: string;
        };
        Insert: {
          portfolio_id: number;
          action_summary: string;
          confidence: number;
          reasoning: string;
          raw_llm_output: string;
          model_used: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          portfolio_id?: number;
          action_summary?: string;
          confidence?: number;
          reasoning?: string;
          raw_llm_output?: string;
          model_used?: string;
          created_at?: string;
        };
      };
      portfolio_snapshots: {
        Row: {
          id: number;
          portfolio_id: number;
          cash_balance: number;
          equity_value: number;
          total_value: number;
          created_at: string;
        };
        Insert: {
          portfolio_id: number;
          cash_balance: number;
          equity_value: number;
          total_value: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          portfolio_id?: number;
          cash_balance?: number;
          equity_value?: number;
          total_value?: number;
          created_at?: string;
        };
      };
      position_snapshots: {
        Row: {
          id: number;
          snapshot_id: number;
          symbol: string;
          quantity: number;
          avg_price: number;
        };
        Insert: {
          snapshot_id: number;
          symbol: string;
          quantity: number;
          avg_price: number;
        };
        Update: {
          id?: number;
          snapshot_id?: number;
          symbol?: string;
          quantity?: number;
          avg_price?: number;
        };
      };
    };
  };
};
