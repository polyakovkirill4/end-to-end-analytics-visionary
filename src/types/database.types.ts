export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          domain: string | null
          api_key: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          domain?: string | null
          api_key?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          domain?: string | null
          api_key?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          project_id: string
          client_id: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          referrer: string | null
          landing_page: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          client_id: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          referrer?: string | null
          landing_page?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          client_id?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          referrer?: string | null
          landing_page?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      pageviews: {
        Row: {
          id: string
          session_id: string
          page_url: string
          time_spent_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          page_url: string
          time_spent_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          page_url?: string
          time_spent_seconds?: number | null
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          project_id: string
          session_id: string | null
          client_id: string | null
          crm_lead_id: string | null
          status: string
          revenue: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_id?: string | null
          client_id?: string | null
          crm_lead_id?: string | null
          status?: string
          revenue?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_id?: string | null
          client_id?: string | null
          crm_lead_id?: string | null
          status?: string
          revenue?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      ad_costs: {
        Row: {
          id: string
          project_id: string
          date: string
          utm_source: string
          utm_medium: string | null
          utm_campaign: string | null
          cost: number
          impressions: number | null
          clicks: number | null
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          date: string
          utm_source: string
          utm_medium?: string | null
          utm_campaign?: string | null
          cost?: number
          impressions?: number | null
          clicks?: number | null
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          date?: string
          utm_source?: string
          utm_medium?: string | null
          utm_campaign?: string | null
          cost?: number
          impressions?: number | null
          clicks?: number | null
          currency?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
