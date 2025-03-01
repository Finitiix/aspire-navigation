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
          achievement_type: string
          awards_recognitions: string | null
          book_chapters: string | null
          book_details: string | null
          book_drive_link: string | null
          consultancy_services: string | null
          created_at: string | null
          date_achieved: string
          funded_projects: string | null
          general_remarks: string | null
          google_scholar_link: string | null
          id: string
          patent_link: string | null
          patents_count: string | null
          patents_remarks: string | null
          q_papers: string | null
          research_area: string | null
          research_collaboration: string | null
          research_remarks: string | null
          sci_papers: string | null
          scopus_id_link: string | null
          scopus_papers: string | null
          startup_details: string | null
          status: string
          teacher_department: string
          teacher_designation: string
          teacher_eid: string
          teacher_id: string
          teacher_mobile: string
          teacher_name: string
          title: string
          ugc_papers: string | null
        }
        Insert: {
          achievement_type: string
          awards_recognitions?: string | null
          book_chapters?: string | null
          book_details?: string | null
          book_drive_link?: string | null
          consultancy_services?: string | null
          created_at?: string | null
          date_achieved: string
          funded_projects?: string | null
          general_remarks?: string | null
          google_scholar_link?: string | null
          id?: string
          patent_link?: string | null
          patents_count?: string | null
          patents_remarks?: string | null
          q_papers?: string | null
          research_area?: string | null
          research_collaboration?: string | null
          research_remarks?: string | null
          sci_papers?: string | null
          scopus_id_link?: string | null
          scopus_papers?: string | null
          startup_details?: string | null
          status?: string
          teacher_department: string
          teacher_designation: string
          teacher_eid: string
          teacher_id: string
          teacher_mobile: string
          teacher_name: string
          title: string
          ugc_papers?: string | null
        }
        Update: {
          achievement_type?: string
          awards_recognitions?: string | null
          book_chapters?: string | null
          book_details?: string | null
          book_drive_link?: string | null
          consultancy_services?: string | null
          created_at?: string | null
          date_achieved?: string
          funded_projects?: string | null
          general_remarks?: string | null
          google_scholar_link?: string | null
          id?: string
          patent_link?: string | null
          patents_count?: string | null
          patents_remarks?: string | null
          q_papers?: string | null
          research_area?: string | null
          research_collaboration?: string | null
          research_remarks?: string | null
          sci_papers?: string | null
          scopus_id_link?: string | null
          scopus_papers?: string | null
          startup_details?: string | null
          status?: string
          teacher_department?: string
          teacher_designation?: string
          teacher_eid?: string
          teacher_id?: string
          teacher_mobile?: string
          teacher_name?: string
          title?: string
          ugc_papers?: string | null
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
