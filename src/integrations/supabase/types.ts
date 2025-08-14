export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          voter_id: string | null
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
          voter_id?: string | null
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
          voter_id?: string | null
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
            foreignKeyName: "fk_voter"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "registered_voters"
            referencedColumns: ["id"]
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
          coop_image_1: string | null
          coop_image_2: string | null
          coop_image_3: string | null
          coop_image_4: string | null
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
          coop_image_1?: string | null
          coop_image_2?: string | null
          coop_image_3?: string | null
          coop_image_4?: string | null
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
          coop_image_1?: string | null
          coop_image_2?: string | null
          coop_image_3?: string | null
          coop_image_4?: string | null
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
        Args: { dimension_id: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      option_status: ["pending", "active"],
      questionnaire_status: ["pending", "active", "completed"],
      vote_type: ["strengths", "challenges", "opportunities"],
    },
  },
} as const
