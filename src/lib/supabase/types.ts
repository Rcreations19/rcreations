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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          id: string
          model_name: string
          record_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          id?: string
          model_name: string
          record_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          id?: string
          model_name?: string
          record_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_customers: {
        Row: {
          billing_address: string
          business_name: string
          contact_person: string
          created_at: string
          discount_tier: string
          email: string
          gstin: string | null
          id: string
          notes: string | null
          phone: string
          profile_id: string
          shipping_address: string | null
          status: string
          updated_at: string
        }
        Insert: {
          billing_address: string
          business_name: string
          contact_person: string
          created_at?: string
          discount_tier?: string
          email: string
          gstin?: string | null
          id?: string
          notes?: string | null
          phone: string
          profile_id: string
          shipping_address?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          billing_address?: string
          business_name?: string
          contact_person?: string
          created_at?: string
          discount_tier?: string
          email?: string
          gstin?: string | null
          id?: string
          notes?: string | null
          phone?: string
          profile_id?: string
          shipping_address?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string
          content: string
          cover_image_url: string | null
          is_published: boolean
          author: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary: string
          content: string
          cover_image_url?: string | null
          is_published?: boolean
          author: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string
          content?: string
          cover_image_url?: string | null
          is_published?: boolean
          author?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          default_address: string | null
          default_city: string | null
          default_pincode: string | null
          default_state: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_address?: string | null
          default_city?: string | null
          default_pincode?: string | null
          default_state?: string | null
          email: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_address?: string | null
          default_city?: string | null
          default_pincode?: string | null
          default_state?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      frame_options: {
        Row: {
          category: string
          color_hex: string
          color_name: string
          created_at: string
          description: string
          durability: string
          id: string
          is_active: boolean
          material: string
          name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category: string
          color_hex?: string
          color_name?: string
          created_at?: string
          description?: string
          durability?: string
          id?: string
          is_active?: boolean
          material: string
          name: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          category?: string
          color_hex?: string
          color_name?: string
          created_at?: string
          description?: string
          durability?: string
          id?: string
          is_active?: boolean
          material?: string
          name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          custom_config: Json | null
          details: string | null
          id: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
          title: string
        }
        Insert: {
          created_at?: string
          custom_config?: Json | null
          details?: string | null
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          quantity?: number
          title: string
        }
        Update: {
          created_at?: string
          custom_config?: Json | null
          details?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          customer_name: string
          email: string | null
          gstin: string | null
          id: string
          is_guest: boolean
          notes: string | null
          order_number: string
          phone: string
          pincode: string | null
          shipping_cost: number
          shipping_method: string
          state: string
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_guest?: boolean
          notes?: string | null
          order_number: string
          phone: string
          pincode?: string | null
          shipping_cost?: number
          shipping_method?: string
          state?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_guest?: boolean
          notes?: string | null
          order_number?: string
          phone?: string
          pincode?: string | null
          shipping_cost?: number
          shipping_method?: string
          state?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string
          dimensions: string
          gallery_images: string[]
          id: string
          image_url: string
          is_active: boolean
          is_bestseller: boolean
          is_wholesale_featured: boolean
          lead_time: string
          material: string
          moq: number
          price: number
          rating: number
          review_count: number
          search_vector: string | null
          slug: string
          specifications: Json
          subtitle: string
          title: string
          updated_at: string
          wholesale_price: number
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string
          dimensions?: string
          gallery_images?: string[]
          id?: string
          image_url: string
          is_active?: boolean
          is_bestseller?: boolean
          is_wholesale_featured?: boolean
          lead_time?: string
          material?: string
          moq?: number
          price: number
          rating?: number
          review_count?: number
          search_vector?: unknown
          slug: string
          specifications?: Json
          subtitle?: string
          title: string
          updated_at?: string
          wholesale_price?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          dimensions?: string
          gallery_images?: string[]
          id?: string
          image_url?: string
          is_active?: boolean
          is_bestseller?: boolean
          is_wholesale_featured?: boolean
          lead_time?: string
          material?: string
          moq?: number
          price?: number
          rating?: number
          review_count?: number
          search_vector?: unknown
          slug?: string
          specifications?: Json
          subtitle?: string
          title?: string
          updated_at?: string
          wholesale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author: string
          business_name: string
          comment: string
          created_at: string
          date: string
          id: string
          is_published: boolean
          location: string
          order_type: string
          product_id: string | null
          rating: number
          updated_at: string
        }
        Insert: {
          author: string
          business_name?: string
          comment: string
          created_at?: string
          date?: string
          id?: string
          is_published?: boolean
          location?: string
          order_type?: string
          product_id?: string | null
          rating: number
          updated_at?: string
        }
        Update: {
          author?: string
          business_name?: string
          comment?: string
          created_at?: string
          date?: string
          id?: string
          is_published?: boolean
          location?: string
          order_type?: string
          product_id?: string | null
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
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

export type GlassType = 'clear-glass' | 'anti-glare-acrylic' | 'led-backlit-panel' | 'museum-glass';
export type MountBoard = 'none' | 'single' | 'double' | 'weighted' | 'float';

export interface CustomFrameConfig {
  materialId: string;
  widthCm: number;
  heightCm: number;
  glassType: GlassType;
  mountBoard: MountBoard;
  customEngravingText?: string;
  quantity: number;
  thicknessInches?: number;
  uploadedPhotoUrl?: string;
  uploadId?: string;
}

export interface CartItem {
  id: string;
  type: 'preset' | 'custom' | 'catalog';
  title: string;
  subtitle?: string;
  price: number;
  wholesale_price?: number;
  quantity: number;
  image?: string;
  customConfig?: CustomFrameConfig;
  details?: string;
  moq?: number;
}
