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
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_attendance: {
        Row: {
          class_id: string
          class_name: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          class_name: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          class_name?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          created_at: string | null
          day_number: number
          description: string
          exercise_coins: number
          health_coins: number
          id: string
          image_url: string | null
          month: number
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          day_number: number
          description: string
          exercise_coins: number
          health_coins: number
          id?: string
          image_url?: string | null
          month: number
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          day_number?: number
          description?: string
          exercise_coins?: number
          health_coins?: number
          id?: string
          image_url?: string | null
          month?: number
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      data_backups: {
        Row: {
          created_at: string | null
          created_by: string | null
          data: Json
          description: string | null
          filename: string
          id: string
          size_bytes: number | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data: Json
          description?: string | null
          filename: string
          id: string
          size_bytes?: number | null
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
          size_bytes?: number | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      dimension_performance: {
        Row: {
          id: string
          dimension: string
          score: number
          date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          dimension: string
          score: number
          date?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          dimension?: string
          score?: number
          date?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dimension_votes: {
        Row: {
          created_at: string
          dimension: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          dimension: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          dimension?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      exercise_library: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: number | null
          id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      fic_daily_metrics: {
        Row: {
          id: string
          date: string
          average_index: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date?: string
          average_index: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          average_index?: number
          created_at?: string | null
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
          challenges: string
          challenges_statuses: string | null
          created_at: string | null
          dimension: string
          group: string | null
          group_name: string | null
          id: string
          opportunities: string
          opportunities_statuses: string | null
          satisfaction: number | null
          status: string | null
          strengths: string
          strengths_statuses: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenges: string
          challenges_statuses?: string | null
          created_at?: string | null
          dimension: string
          group?: string | null
          group_name?: string | null
          id?: string
          opportunities: string
          opportunities_statuses?: string | null
          satisfaction?: number | null
          status?: string | null
          strengths: string
          strengths_statuses?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenges?: string
          challenges_statuses?: string | null
          created_at?: string | null
          dimension?: string
          group?: string | null
          group_name?: string | null
          id?: string
          opportunities?: string
          opportunities_statuses?: string | null
          satisfaction?: number | null
          status?: string | null
          strengths?: string
          strengths_statuses?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fic_questionnaires_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          metrics?: Json
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
        Relationships: []
      }
      profile_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          end_date: string
          id: string
          start_date: string
          status: string | null
          target_value: number
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          end_date: string
          id: string
          start_date: string
          status?: string | null
          target_value: number
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          target_value?: number
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          coins: number | null
          cpf: string
          created_at: string | null
          email: string
          fitness_level: string | null
          gender: string | null
          height: number | null
          id: string
          name: string | null
          steps: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          coins?: number | null
          cpf?: string
          created_at?: string | null
          email: string
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          id: string
          name?: string | null
          steps?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          coins?: number | null
          cpf?: string
          created_at?: string | null
          email?: string
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          id: string
          name?: string | null
          steps?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      questionnaire_votes: {
        Row: {
          created_at: string | null
          id: string
          option_number: number
          option_type: string
          questionnaire_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_number: number
          option_type: string
          questionnaire_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_number?: number
          option_type?: string
          questionnaire_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_votes_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "active_questionnaire_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_votes_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "fic_questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registered_voters: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_exxe: number
          price_money: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          name: string
          price_exxe: number
          price_money: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_exxe?: number
          price_money?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          receiver_id: string | null
          sender_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id: string
          receiver_id?: string | null
          sender_id?: string | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id: string
          receiver_id?: string | null
          sender_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          created_at: string | null
          current: number | null
          end_date: string
          id: string
          start_date: string
          status: string | null
          target: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current?: number | null
          end_date: string
          id: string
          start_date: string
          status?: string | null
          target: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current?: number | null
          end_date?: string
          id: string
          start_date?: string
          status?: string | null
          target?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_consumption: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          date: string
          id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_consumption_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_questionnaire_responses: {
        Row: {
          challenge: string | null
          challenge_status: string | null
          challenges: string | null
          challenges_statuses: string | null
          created_at: string | null
          dimension: string | null
          group: string | null
          group_name: string | null
          id: string | null
          opportunities: string | null
          opportunities_statuses: string | null
          opportunity: string | null
          opportunity_status: string | null
          satisfaction: number | null
          status: string | null
          strength: string | null
          strength_status: string | null
          strengths: string | null
          strengths_statuses: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fic_questionnaires_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fic_questionnaire_analytics: {
        Row: {
          avg_satisfaction: number | null
          dimension: string | null
          first_response: string | null
          last_response: string | null
          total_responses: number | null
        }
        Relationships: []
      }
      questionnaire_vote_counts: {
        Row: {
          downvotes: number | null
          option_number: number | null
          option_type: string | null
          questionnaire_id: string | null
          upvotes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_votes_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "active_questionnaire_responses"
            referencedColumns: ["id"]
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
      questionnaire_voting_report: {
        Row: {
          challenges: string | null
          dimension: string | null
          group: string | null
          opportunities: string | null
          option_number: number | null
          option_type: string | null
          strengths: string | null
          total_votes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      clean_questionnaire_votes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_fic_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    : never,
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
