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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_access: {
        Row: {
          reason: string | null
          suspended: boolean
          user_id: string
        }
        Insert: {
          reason?: string | null
          suspended?: boolean
          user_id: string
        }
        Update: {
          reason?: string | null
          suspended?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      mt5_setup_requests: {
        Row: {
          account_number: string
          account_password: string | null
          broker: string
          created_at: string
          id: string
          server: string
          user_id: string
        }
        Insert: {
          account_number: string
          account_password?: string | null
          broker: string
          created_at?: string
          id?: string
          server: string
          user_id: string
        }
        Update: {
          account_number?: string
          account_password?: string | null
          broker?: string
          created_at?: string
          id?: string
          server?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mt5_setup_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          address: string | null
          asset: string
          enabled: boolean
          id: string
          instructions: string | null
          name: string
          network: string | null
          network_warning: string | null
          qr_image_url: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          asset: string
          enabled?: boolean
          id?: string
          instructions?: string | null
          name: string
          network?: string | null
          network_warning?: string | null
          qr_image_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          asset?: string
          enabled?: boolean
          id?: string
          instructions?: string | null
          name?: string
          network?: string | null
          network_warning?: string | null
          qr_image_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          duration_days: number
          id: string
          method_id: string | null
          method_name: string | null
          notes: string | null
          paid_at: string | null
          plan_id: string
          plan_name: string
          reference: string
          rejection_reason: string | null
          reviewed_at: string | null
          screenshot_path: string
          sender: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tx_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          duration_days: number
          id?: string
          method_id?: string | null
          method_name?: string | null
          notes?: string | null
          paid_at?: string | null
          plan_id: string
          plan_name: string
          reference?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          screenshot_path: string
          sender?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tx_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          duration_days?: number
          id?: string
          method_id?: string | null
          method_name?: string | null
          notes?: string | null
          paid_at?: string | null
          plan_id?: string
          plan_name?: string
          reference?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          screenshot_path?: string
          sender?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tx_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          custom_quote: boolean
          description: string | null
          duration_days: number | null
          featured: boolean
          features: string[]
          id: string
          mt5_limit: number
          name: string
          price: number | null
          sort_order: number
          support_level: string | null
          visible: boolean
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          custom_quote?: boolean
          description?: string | null
          duration_days?: number | null
          featured?: boolean
          features?: string[]
          id?: string
          mt5_limit?: number
          name: string
          price?: number | null
          sort_order?: number
          support_level?: string | null
          visible?: boolean
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          custom_quote?: boolean
          description?: string | null
          duration_days?: number | null
          featured?: boolean
          features?: string[]
          id?: string
          mt5_limit?: number
          name?: string
          price?: number | null
          sort_order?: number
          support_level?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          enabled: boolean
          message: string | null
          path: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          message?: string | null
          path: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          message?: string | null
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          entitled_features: string[]
          expires_at: string
          id: string
          mt5_limit: number
          payment_id: string | null
          plan_id: string | null
          plan_name: string
          price: number | null
          revoke_reason: string | null
          revoked: boolean
          starts_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitled_features?: string[]
          expires_at: string
          id?: string
          mt5_limit?: number
          payment_id?: string | null
          plan_id?: string | null
          plan_name: string
          price?: number | null
          revoke_reason?: string | null
          revoked?: boolean
          starts_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entitled_features?: string[]
          expires_at?: string
          id?: string
          mt5_limit?: number
          payment_id?: string | null
          plan_id?: string | null
          plan_name?: string
          price?: number | null
          revoke_reason?: string | null
          revoked?: boolean
          starts_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_members: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_admin_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      manage_account_access: {
        Args: { _reason: string; _suspended: boolean; _user_id: string }
        Returns: undefined
      }
      registered_user_total: { Args: never; Returns: number }
      reject_stale_payments: { Args: never; Returns: number }
      review_payment: {
        Args: { _approve: boolean; _payment_id: string; _reason?: string }
        Returns: undefined
      }
      subscription_entitlement: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "customer"
      payment_status:
        | "draft"
        | "pending_review"
        | "under_verification"
        | "approved"
        | "rejected"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "customer"],
      payment_status: [
        "draft",
        "pending_review",
        "under_verification",
        "approved",
        "rejected",
        "cancelled",
      ],
    },
  },
} as const
