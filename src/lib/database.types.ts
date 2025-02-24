Need to install the following packages:
supabase@2.12.1

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
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          delivery_type: 'pickup' | 'delivery'
          delivery_address?: string
          items: Json[]
          total_amount: number
          status: 'pending' | 'accepted' | 'preparing' | 'delivering' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          delivery_type: 'pickup' | 'delivery'
          delivery_address?: string
          items: Json[]
          total_amount: number
          status?: 'pending' | 'accepted' | 'preparing' | 'delivering' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          delivery_type?: 'pickup' | 'delivery'
          delivery_address?: string
          items?: Json[]
          total_amount?: number
          status?: 'pending' | 'accepted' | 'preparing' | 'delivering' | 'completed'
          created_at?: string
        }
      }
      sales_reports: {
        Row: {
          id: string
          month: string
          year: number
          total_sales: number
          total_orders: number
          report_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          month: string
          year: number
          total_sales: number
          total_orders: number
          report_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          month?: string
          year?: number
          total_sales?: number
          total_orders?: number
          report_data?: Json
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
