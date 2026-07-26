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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliations: {
        Row: {
          created_at: string
          id: string
          name: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bounties: {
        Row: {
          amount: number | null
          character_id: string | null
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          amount?: number | null
          character_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          amount?: number | null
          character_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bounties_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_affiliations: {
        Row: {
          affiliation_id: string | null
          character_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          affiliation_id?: string | null
          character_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          affiliation_id?: string | null
          character_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "character_affiliations_affiliation_id_fkey"
            columns: ["affiliation_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_affiliations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_devil_fruits: {
        Row: {
          character_id: string | null
          created_at: string
          devil_fruit_id: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          devil_fruit_id?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          character_id?: string | null
          created_at?: string
          devil_fruit_id?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "character_devil_fruits_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_devil_fruits_devil_fruit_id_fkey"
            columns: ["devil_fruit_id"]
            isOneToOne: false
            referencedRelation: "devil_fruits"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          age: number | null
          birthday: Json | null
          blood_type: string
          created_at: string
          extra_data: Json | null
          height: number | null
          id: string
          image_url: string | null
          name: Json | null
          status: string
        }
        Insert: {
          age?: number | null
          birthday?: Json | null
          blood_type?: string
          created_at?: string
          extra_data?: Json | null
          height?: number | null
          id?: string
          image_url?: string | null
          name?: Json | null
          status?: string
        }
        Update: {
          age?: number | null
          birthday?: Json | null
          blood_type?: string
          created_at?: string
          extra_data?: Json | null
          height?: number | null
          id?: string
          image_url?: string | null
          name?: Json | null
          status?: string
        }
        Relationships: []
      }
      devil_fruits: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          model: Json | null
          name: Json | null
          sub_type: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          model?: Json | null
          name?: Json | null
          sub_type?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          model?: Json | null
          name?: Json | null
          sub_type?: string | null
          type?: string | null
        }
        Relationships: []
      }
      islands: {
        Row: {
          created_at: string
          extra_data: Json | null
          id: string
          image_url: string | null
          name: Json | null
          sea: string | null
        }
        Insert: {
          created_at?: string
          extra_data?: Json | null
          id?: string
          image_url?: string | null
          name?: Json | null
          sea?: string | null
        }
        Update: {
          created_at?: string
          extra_data?: Json | null
          id?: string
          image_url?: string | null
          name?: Json | null
          sea?: string | null
        }
        Relationships: []
      }
      ships: {
        Row: {
          created_at: string
          extra_data: Json | null
          id: string
          image_url: string | null
          name: Json | null
          status: string
          type: string | null
        }
        Insert: {
          created_at?: string
          extra_data?: Json | null
          id?: string
          image_url?: string | null
          name?: Json | null
          status?: string
          type?: string | null
        }
        Update: {
          created_at?: string
          extra_data?: Json | null
          id?: string
          image_url?: string | null
          name?: Json | null
          status?: string
          type?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
