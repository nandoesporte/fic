export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      data_backups: {
        Row: {
          created_at: string | null
          created_by: string | null
          data: Json
          description: string | null
          filename: string
          id: string
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data: Json
          description?: string | null
          filename: string
          id?: string
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data?: Json
          description?: string | null
          filename?: string
          id?: string
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      dimension_performance: {
        Row: {
          created_at: string | null
          date: string
          dimension: string
          id: string
          score: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          dimension: string
          id?: string
          score: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          dimension?: string
          id?: string
          score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dimension_performance_dimension_fkey"
            columns: ["dimension"]
            isOneToOne: false
            referencedRelation: "fic_dimensions"
            referencedColumns: ["identifier"]
          },
        ]
      }
      dimension_votes: {
        Row: {
          created_at: string | null
          dimension: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          dimension: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          dimension?: string
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dimension_votes_dimension_fkey"
            columns: ["dimension"]
            isOneToOne: false
            referencedRelation: "fic_dimensions"
            referencedColumns: ["identifier"]
          },
          {
            foreignKeyName: "dimension_votes_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "registered_voters"
            referencedColumns: ["email"]
          },
        ]
      }
      fic_daily_metrics: {
        Row: {
          average_index: number
          created_at: string | null
          date: string
          id: string
          updated_at: string | null
        }
        Insert: {
          average_index: number
          created_at?: string | null
          date?: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          average_index?: number
          created_at?: string | null
          date?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fic_dimensions: {
        Row: {
          background_color: string | null
          created_at: string | null
          id: string
          identifier: string
          label: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          label: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fic_questionnaires: {
        Row: {
          challenges: string | null
          challenges_statuses: string[] | null
          created_at: string | null
          dimension: string
          group: string | null
          group_code: string | null
          group_name: string | null
          id: string
          opportunities: string | null
          opportunities_statuses: string[] | null
          satisfaction: number | null
          status: Database["public"]["Enums"]["questionnaire_status"] | null
          strengths: string | null
          strengths_statuses: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          challenges?: string | null
          challenges_statuses?: string[] | null
          created_at?: string | null
          dimension: string
          group?: string | null
          group_code?: string | null
          group_name?: string | null
          id?: string
          opportunities?: string | null
          opportunities_statuses?: string[] | null
          satisfaction?: number | null
          status?: Database["public"]["Enums"]["questionnaire_status"] | null
          strengths?: string | null
          strengths_statuses?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          challenges?: string | null
          challenges_statuses?: string[] | null
          created_at?: string | null
          dimension?: string
          group?: string | null
          group_code?: string | null
          group_name?: string | null
          id?: string
          opportunities?: string | null
          opportunities_statuses?: string[] | null
          satisfaction?: number | null
          status?: Database["public"]["Enums"]["questionnaire_status"] | null
          strengths?: string | null
          strengths_statuses?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fic_questionnaires_dimension_fkey"
            columns: ["dimension"]
            isOneToOne: false
            referencedRelation: "fic_dimensions"
            referencedColumns: ["identifier"]
          },
        ]
      }
      fic_reports: {
        Row: {
          created_at: string | null
          description: string | null
          dimension: string | null
          end_date: string
          id: string
          metrics: Json
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dimension?: string | null
          end_date: string
          id?: string
          metrics: Json
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dimension?: string | null
          end_date?: string
          id?: string
          metrics?: Json
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fic_reports_dimension_fkey"
            columns: ["dimension"]
            isOneToOne: false
            referencedRelation: "fic_dimensions"
            referencedColumns: ["identifier"]
          },
        ]
      }
      profiles: {
        Row: {
          cocamarengagement: string | null
          cocamarmembers: string | null
          cocamarname: string | null
          company_description: string | null
          company_logo: string | null
          company_name: string | null
          created_at: string | null
          email: string
          frisiaengagement: string | null
          frisiamembers: string | null
          frisianame: string | null
          id: string
          sicoobengagement: string | null
          sicoobmembers: string | null
          sicoobname: string | null
          updated_at: string | null
          welcome_description: string | null
          welcome_message: string | null
        }
        Insert: {
          cocamarengagement?: string | null
          cocamarmembers?: string | null
          cocamarname?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          frisiaengagement?: string | null
          frisiamembers?: string | null
          frisianame?: string | null
          id: string
          sicoobengagement?: string | null
          sicoobmembers?: string | null
          sicoobname?: string | null
          updated_at?: string | null
          welcome_description?: string | null
          welcome_message?: string | null
        }
        Update: {
          cocamarengagement?: string | null
          cocamarmembers?: string | null
          cocamarname?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          frisiaengagement?: string | null
          frisiamembers?: string | null
          frisianame?: string | null
          id?: string
          sicoobengagement?: string | null
          sicoobmembers?: string | null
          sicoobname?: string | null
          updated_at?: string | null
          welcome_description?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      questionnaire_votes: {
        Row: {
          created_at: string | null
          email: string
          id: string
          option_number: number
          option_type: string
          questionnaire_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          option_number: number
          option_type: string
          questionnaire_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          option_number?: number
          option_type?: string
          questionnaire_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_votes_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "registered_voters"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "questionnaire_votes_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "fic_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      registered_voters: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vote_tracking: {
        Row: {
          created_at: string | null
          email: string
          id: string
          questionnaire_id: string
          section_type: string
          updated_at: string | null
          vote_count: number
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          questionnaire_id: string
          section_type: string
          updated_at?: string | null
          vote_count?: number
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          questionnaire_id?: string
          section_type?: string
          updated_at?: string | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "vote_tracking_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "registered_voters"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "vote_tracking_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "fic_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          email: string
          id: string
          option_number: number
          option_type: Database["public"]["Enums"]["vote_type"]
          questionnaire_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          option_number: number
          option_type: Database["public"]["Enums"]["vote_type"]
          questionnaire_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          option_number?: number
          option_type?: Database["public"]["Enums"]["vote_type"]
          questionnaire_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "registered_voters"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "votes_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "fic_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vote_analytics: {
        Row: {
          created_at: string | null
          dimension: string | null
          option_number: number | null
          option_text: string | null
          option_type: Database["public"]["Enums"]["vote_type"] | null
          questionnaire_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fic_questionnaires_dimension_fkey"
            columns: ["dimension"]
            isOneToOne: false
            referencedRelation: "fic_dimensions"
            referencedColumns: ["identifier"]
          },
          {
            foreignKeyName: "votes_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "fic_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      clean_questionnaire_votes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      safe_delete_dimension: {
        Args: {
          dimension_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      option_status: "pending" | "active"
      questionnaire_status: "pending" | "active" | "completed"
      vote_type: "strengths" | "challenges" | "opportunities"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
