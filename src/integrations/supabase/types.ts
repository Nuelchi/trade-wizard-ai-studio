export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_strategies: {
        Row: {
          analytics: Json | null
          code: Json | null
          copies: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          likes: number | null
          price: number | null
          publish_version: number | null
          remixes: number | null
          strategy_id: string | null
          summary: Json | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analytics?: Json | null
          code?: Json | null
          copies?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          likes?: number | null
          price?: number | null
          publish_version?: number | null
          remixes?: number | null
          strategy_id?: string | null
          summary?: Json | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analytics?: Json | null
          code?: Json | null
          copies?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          likes?: number | null
          price?: number | null
          publish_version?: number | null
          remixes?: number | null
          strategy_id?: string | null
          summary?: Json | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_strategies_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          analytics: Json | null
          chat_history: Json | null
          code: Json | null
          copies: number | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          likes: number | null
          price: number | null
          remixes: number | null
          summary: Json | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analytics?: Json | null
          chat_history?: Json | null
          code?: Json | null
          copies?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes?: number | null
          price?: number | null
          remixes?: number | null
          summary?: Json | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analytics?: Json | null
          chat_history?: Json | null
          code?: Json | null
          copies?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes?: number | null
          price?: number | null
          remixes?: number | null
          summary?: Json | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      strategy_likes: {
        Row: {
          created_at: string
          id: string
          strategy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          strategy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          strategy_id?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          user_id: string;
          tier: string | null;
          status: string | null;
          provider: string | null;
          polar_subscription_id: string | null;
          polar_customer_id: string | null;
          polar_checkout_id: string | null;
          polar_product_id: string | null;
          polar_price_id: string | null;
          amount: number | null;
          billing_period: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
          start_date: string | null;
          end_date: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          tier?: string | null;
          status?: string | null;
          provider?: string | null;
          polar_subscription_id?: string | null;
          polar_customer_id?: string | null;
          polar_checkout_id?: string | null;
          polar_product_id?: string | null;
          polar_price_id?: string | null;
          amount?: number | null;
          billing_period?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          start_date?: string | null;
          end_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          tier?: string | null;
          status?: string | null;
          provider?: string | null;
          polar_subscription_id?: string | null;
          polar_customer_id?: string | null;
          polar_checkout_id?: string | null;
          polar_product_id?: string | null;
          polar_price_id?: string | null;
          amount?: number | null;
          billing_period?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          start_date?: string | null;
          end_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_strategy_like_count: {
        Args: { strategy_uuid: string }
        Returns: number
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
