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
      achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          collaboration: string | null
          created_at: string | null
          date_achieved: string
          id: string
          issuing_organization: string
          link_url: string | null
          quantity: number | null
          related_field: string | null
          remarks: string | null
          status: Database["public"]["Enums"]["achievement_status"] | null
          submitted_at: string | null
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          collaboration?: string | null
          created_at?: string | null
          date_achieved: string
          id?: string
          issuing_organization: string
          link_url?: string | null
          quantity?: number | null
          related_field?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["achievement_status"] | null
          submitted_at?: string | null
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          collaboration?: string | null
          created_at?: string | null
          date_achieved?: string
          id?: string
          issuing_organization?: string
          link_url?: string | null
          quantity?: number | null
          related_field?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["achievement_status"] | null
          submitted_at?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_details"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_messages: {
        Row: {
          created_at: string | null
          id: string
          important_details: string | null
          important_message: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          important_details?: string | null
          important_message?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          important_details?: string | null
          important_message?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          id: string
          identifier: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          identifier: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          id?: string
          identifier?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      important_details: {
        Row: {
          created_at: string | null
          detail: string
          id: string
        }
        Insert: {
          created_at?: string | null
          detail: string
          id?: string
        }
        Update: {
          created_at?: string | null
          detail?: string
          id?: string
        }
        Relationships: []
      }
      important_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_details: {
        Row: {
          address: string | null
          block: string | null
          cabin_no: string | null
          created_at: string | null
          date_of_joining: string
          department: string
          designation: string
          eid: string
          email_id: string
          full_name: string
          gender: string
          highest_qualification: string
          id: string
          mobile_number: string
          profile_pic_url: string | null
          skills: string[] | null
          timetable_url: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          block?: string | null
          cabin_no?: string | null
          created_at?: string | null
          date_of_joining: string
          department: string
          designation: string
          eid: string
          email_id: string
          full_name: string
          gender: string
          highest_qualification: string
          id: string
          mobile_number: string
          profile_pic_url?: string | null
          skills?: string[] | null
          timetable_url?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          block?: string | null
          cabin_no?: string | null
          created_at?: string | null
          date_of_joining?: string
          department?: string
          designation?: string
          eid?: string
          email_id?: string
          full_name?: string
          gender?: string
          highest_qualification?: string
          id?: string
          mobile_number?: string
          profile_pic_url?: string | null
          skills?: string[] | null
          timetable_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      achievement_status: "Pending Approval" | "Approved" | "Rejected"
      achievement_type:
        | "Research & Publications"
        | "Book Published"
        | "Patents & Grants"
        | "Certifications & Courses"
        | "Awards & Recognitions"
        | "Projects & Workshops"
        | "Others"
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
