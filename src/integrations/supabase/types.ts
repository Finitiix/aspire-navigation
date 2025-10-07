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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_departments: {
        Row: {
          admin_id: string
          created_at: string
          department_id: string
          id: string
          is_super_admin: boolean
        }
        Insert: {
          admin_id: string
          created_at?: string
          department_id: string
          id?: string
          is_super_admin?: boolean
        }
        Update: {
          admin_id?: string
          created_at?: string
          department_id?: string
          id?: string
          is_super_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "admin_departments_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      department_targets: {
        Row: {
          benefits: string[] | null
          created_at: string
          department_id: string
          id: string
          target_date: string
          target_points: number
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string
          department_id: string
          id?: string
          target_date: string
          target_points: number
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          created_at?: string
          department_id?: string
          id?: string
          target_date?: string
          target_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      detailed_achievements: {
        Row: {
          award_name: string | null
          award_type: string | null
          awarding_body: string | null
          book_drive_link: string | null
          book_title: string | null
          category: Database["public"]["Enums"]["achievement_category"]
          certificate_link: string | null
          chapter_title: string | null
          client_organization: string | null
          collaboration_details: string | null
          conference_date: string | null
          conference_name: string | null
          created_at: string | null
          date_achieved: string
          description: string | null
          document_url: string | null
          doi: string | null
          domain: string | null
          filing_date: string | null
          funding_agency: string | null
          funding_amount: number | null
          funding_details: string | null
          grant_date: string | null
          id: string
          indexed_in: string[] | null
          isbn: string | null
          issn: string | null
          journal_link: string | null
          journal_name: string | null
          organization: string | null
          paper_link: string | null
          partner_institutions: string | null
          patent_link: string | null
          patent_number: string | null
          patent_office: string | null
          patent_status: string | null
          proceedings_publisher: string | null
          project_details_link: string | null
          project_duration_end: string | null
          project_duration_start: string | null
          project_status: string | null
          project_title: string | null
          proof_link: string | null
          publisher: string | null
          q_ranking: string | null
          rejection_reason: string | null
          remarks: string | null
          research_area: string | null
          startup_center_name: string | null
          status: string | null
          teacher_department: string
          teacher_designation: string
          teacher_eid: string
          teacher_id: string
          teacher_mobile: string
          teacher_name: string
          title: string
          website_link: string | null
          year_of_publication: string | null
        }
        Insert: {
          award_name?: string | null
          award_type?: string | null
          awarding_body?: string | null
          book_drive_link?: string | null
          book_title?: string | null
          category: Database["public"]["Enums"]["achievement_category"]
          certificate_link?: string | null
          chapter_title?: string | null
          client_organization?: string | null
          collaboration_details?: string | null
          conference_date?: string | null
          conference_name?: string | null
          created_at?: string | null
          date_achieved: string
          description?: string | null
          document_url?: string | null
          doi?: string | null
          domain?: string | null
          filing_date?: string | null
          funding_agency?: string | null
          funding_amount?: number | null
          funding_details?: string | null
          grant_date?: string | null
          id?: string
          indexed_in?: string[] | null
          isbn?: string | null
          issn?: string | null
          journal_link?: string | null
          journal_name?: string | null
          organization?: string | null
          paper_link?: string | null
          partner_institutions?: string | null
          patent_link?: string | null
          patent_number?: string | null
          patent_office?: string | null
          patent_status?: string | null
          proceedings_publisher?: string | null
          project_details_link?: string | null
          project_duration_end?: string | null
          project_duration_start?: string | null
          project_status?: string | null
          project_title?: string | null
          proof_link?: string | null
          publisher?: string | null
          q_ranking?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          research_area?: string | null
          startup_center_name?: string | null
          status?: string | null
          teacher_department: string
          teacher_designation: string
          teacher_eid: string
          teacher_id: string
          teacher_mobile: string
          teacher_name: string
          title: string
          website_link?: string | null
          year_of_publication?: string | null
        }
        Update: {
          award_name?: string | null
          award_type?: string | null
          awarding_body?: string | null
          book_drive_link?: string | null
          book_title?: string | null
          category?: Database["public"]["Enums"]["achievement_category"]
          certificate_link?: string | null
          chapter_title?: string | null
          client_organization?: string | null
          collaboration_details?: string | null
          conference_date?: string | null
          conference_name?: string | null
          created_at?: string | null
          date_achieved?: string
          description?: string | null
          document_url?: string | null
          doi?: string | null
          domain?: string | null
          filing_date?: string | null
          funding_agency?: string | null
          funding_amount?: number | null
          funding_details?: string | null
          grant_date?: string | null
          id?: string
          indexed_in?: string[] | null
          isbn?: string | null
          issn?: string | null
          journal_link?: string | null
          journal_name?: string | null
          organization?: string | null
          paper_link?: string | null
          partner_institutions?: string | null
          patent_link?: string | null
          patent_number?: string | null
          patent_office?: string | null
          patent_status?: string | null
          proceedings_publisher?: string | null
          project_details_link?: string | null
          project_duration_end?: string | null
          project_duration_start?: string | null
          project_status?: string | null
          project_title?: string | null
          proof_link?: string | null
          publisher?: string | null
          q_ranking?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          research_area?: string | null
          startup_center_name?: string | null
          status?: string | null
          teacher_department?: string
          teacher_designation?: string
          teacher_eid?: string
          teacher_id?: string
          teacher_mobile?: string
          teacher_name?: string
          title?: string
          website_link?: string | null
          year_of_publication?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_achievements_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detailed_achievements_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_details_by_admin"
            referencedColumns: ["id"]
          },
        ]
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
          department: string | null
          detail: string
          id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          detail: string
          id?: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          detail?: string
          id?: string
        }
        Relationships: []
      }
      important_messages: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          message?: string
        }
        Relationships: []
      }
      points_history: {
        Row: {
          achievement_id: string | null
          awarded_by: string
          created_at: string
          id: string
          points_awarded: number
          reason: string | null
          teacher_id: string
        }
        Insert: {
          achievement_id?: string | null
          awarded_by: string
          created_at?: string
          id?: string
          points_awarded: number
          reason?: string | null
          teacher_id: string
        }
        Update: {
          achievement_id?: string | null
          awarded_by?: string
          created_at?: string
          id?: string
          points_awarded?: number
          reason?: string | null
          teacher_id?: string
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      researcher_ids: {
        Row: {
          arxiv_id: string | null
          created_at: string | null
          crossref_id: string | null
          doi: string | null
          google_scholar_id: string | null
          id: string
          microsoft_academic_id: string | null
          no_arxiv_id: boolean | null
          no_crossref_id: boolean | null
          no_doi: boolean | null
          no_google_scholar_id: boolean | null
          no_microsoft_academic_id: boolean | null
          no_orcid: boolean | null
          no_pubmed_author_id: boolean | null
          no_pubmed_id: boolean | null
          no_scopus_author_id: boolean | null
          no_scopus_eid: boolean | null
          no_semantic_scholar_id: boolean | null
          no_ssrn_id: boolean | null
          no_web_of_science_id: boolean | null
          orcid: string | null
          pubmed_author_id: string | null
          pubmed_id: string | null
          scopus_author_id: string | null
          scopus_eid: string | null
          semantic_scholar_id: string | null
          ssrn_id: string | null
          teacher_id: string
          updated_at: string | null
          web_of_science_id: string | null
        }
        Insert: {
          arxiv_id?: string | null
          created_at?: string | null
          crossref_id?: string | null
          doi?: string | null
          google_scholar_id?: string | null
          id?: string
          microsoft_academic_id?: string | null
          no_arxiv_id?: boolean | null
          no_crossref_id?: boolean | null
          no_doi?: boolean | null
          no_google_scholar_id?: boolean | null
          no_microsoft_academic_id?: boolean | null
          no_orcid?: boolean | null
          no_pubmed_author_id?: boolean | null
          no_pubmed_id?: boolean | null
          no_scopus_author_id?: boolean | null
          no_scopus_eid?: boolean | null
          no_semantic_scholar_id?: boolean | null
          no_ssrn_id?: boolean | null
          no_web_of_science_id?: boolean | null
          orcid?: string | null
          pubmed_author_id?: string | null
          pubmed_id?: string | null
          scopus_author_id?: string | null
          scopus_eid?: string | null
          semantic_scholar_id?: string | null
          ssrn_id?: string | null
          teacher_id: string
          updated_at?: string | null
          web_of_science_id?: string | null
        }
        Update: {
          arxiv_id?: string | null
          created_at?: string | null
          crossref_id?: string | null
          doi?: string | null
          google_scholar_id?: string | null
          id?: string
          microsoft_academic_id?: string | null
          no_arxiv_id?: boolean | null
          no_crossref_id?: boolean | null
          no_doi?: boolean | null
          no_google_scholar_id?: boolean | null
          no_microsoft_academic_id?: boolean | null
          no_orcid?: boolean | null
          no_pubmed_author_id?: boolean | null
          no_pubmed_id?: boolean | null
          no_scopus_author_id?: boolean | null
          no_scopus_eid?: boolean | null
          no_semantic_scholar_id?: boolean | null
          no_ssrn_id?: boolean | null
          no_web_of_science_id?: boolean | null
          orcid?: string | null
          pubmed_author_id?: string | null
          pubmed_id?: string | null
          scopus_author_id?: string | null
          scopus_eid?: string | null
          semantic_scholar_id?: string | null
          ssrn_id?: string | null
          teacher_id?: string
          updated_at?: string | null
          web_of_science_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "researcher_ids_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "researcher_ids_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_details_by_admin"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_details: {
        Row: {
          address: string | null
          bio: string | null
          block: string | null
          cabin_no: string | null
          created_at: string | null
          date_of_joining: string
          department: string
          designation: string
          eid: string
          email_id: string
          experience: Json | null
          full_name: string
          gender: string
          github_url: string | null
          highest_qualification: string
          id: string
          linkedin_url: string | null
          mobile_number: string
          personal_website: string | null
          profile_pic_url: string | null
          skills: string[] | null
          tagline: string | null
          timetable_url: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          block?: string | null
          cabin_no?: string | null
          created_at?: string | null
          date_of_joining: string
          department: string
          designation: string
          eid: string
          email_id: string
          experience?: Json | null
          full_name: string
          gender: string
          github_url?: string | null
          highest_qualification: string
          id: string
          linkedin_url?: string | null
          mobile_number: string
          personal_website?: string | null
          profile_pic_url?: string | null
          skills?: string[] | null
          tagline?: string | null
          timetable_url?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          block?: string | null
          cabin_no?: string | null
          created_at?: string | null
          date_of_joining?: string
          department?: string
          designation?: string
          eid?: string
          email_id?: string
          experience?: Json | null
          full_name?: string
          gender?: string
          github_url?: string | null
          highest_qualification?: string
          id?: string
          linkedin_url?: string | null
          mobile_number?: string
          personal_website?: string | null
          profile_pic_url?: string | null
          skills?: string[] | null
          tagline?: string | null
          timetable_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_points: {
        Row: {
          created_at: string
          current_points: number
          id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_points?: number
          id?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_points?: number
          id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      auth_users_view: {
        Row: {
          email: string | null
          id: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
        }
        Update: {
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
      teacher_details_by_admin: {
        Row: {
          address: string | null
          admin_id: string | null
          block: string | null
          cabin_no: string | null
          created_at: string | null
          date_of_joining: string | null
          department: string | null
          designation: string | null
          eid: string | null
          email_id: string | null
          full_name: string | null
          gender: string | null
          highest_qualification: string | null
          id: string | null
          mobile_number: string | null
          profile_pic_url: string | null
          skills: string[] | null
          timetable_url: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_departments_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      achievement_category:
        | "Journal Articles"
        | "Conference Papers"
        | "Books & Book Chapters"
        | "Patents"
        | "Research Collaborations"
        | "Awards & Recognitions"
        | "Consultancy & Funded Projects"
        | "Startups & Centers of Excellence"
        | "Others"
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
      achievement_category: [
        "Journal Articles",
        "Conference Papers",
        "Books & Book Chapters",
        "Patents",
        "Research Collaborations",
        "Awards & Recognitions",
        "Consultancy & Funded Projects",
        "Startups & Centers of Excellence",
        "Others",
      ],
      achievement_status: ["Pending Approval", "Approved", "Rejected"],
      achievement_type: [
        "Research & Publications",
        "Book Published",
        "Patents & Grants",
        "Certifications & Courses",
        "Awards & Recognitions",
        "Projects & Workshops",
        "Others",
      ],
    },
  },
} as const
