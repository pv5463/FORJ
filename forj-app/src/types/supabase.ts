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
      profiles: {
        Row: {
          id: string
          role: "candidate" | "employer" | "mentor" | "admin"
          full_name: string
          headline: string | null
          bio: string | null
          location: string | null
          avatar_url: string | null
          preferred_language: "en" | "hi"
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: "candidate" | "employer" | "mentor" | "admin"
          full_name: string
          headline?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          preferred_language?: "en" | "hi"
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: "candidate" | "employer" | "mentor" | "admin"
          full_name?: string
          headline?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          preferred_language?: "en" | "hi"
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          owner_id: string
          name: string
          type: "startup" | "company" | "incubator" | "institution"
          website: string | null
          description: string | null
          logo_url: string | null
          verification_status: "unverified" | "pending" | "verified" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          type: "startup" | "company" | "incubator" | "institution"
          website?: string | null
          description?: string | null
          logo_url?: string | null
          verification_status?: "unverified" | "pending" | "verified" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          type?: "startup" | "company" | "incubator" | "institution"
          website?: string | null
          description?: string | null
          logo_url?: string | null
          verification_status?: "unverified" | "pending" | "verified" | "rejected"
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          organization_id: string
          profile_id: string
          member_role: "owner" | "recruiter" | "reviewer"
          created_at: string
        }
        Insert: {
          organization_id: string
          profile_id: string
          member_role?: "owner" | "recruiter" | "reviewer"
          created_at?: string
        }
        Update: {
          organization_id?: string
          profile_id?: string
          member_role?: "owner" | "recruiter" | "reviewer"
          created_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          is_verified?: boolean
          created_at?: string
        }
      }
      profile_skills: {
        Row: {
          profile_id: string
          skill_id: string
          level: number
          source: "self" | "assessed" | "verified"
          created_at: string
        }
        Insert: {
          profile_id: string
          skill_id: string
          level: number
          source?: "self" | "assessed" | "verified"
          created_at?: string
        }
        Update: {
          profile_id?: string
          skill_id?: string
          level?: number
          source?: "self" | "assessed" | "verified"
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_org_member: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "candidate" | "employer" | "mentor" | "admin"
      preferred_language: "en" | "hi"
      org_type: "startup" | "company" | "incubator" | "institution"
      org_verification_status: "unverified" | "pending" | "verified" | "rejected"
      org_member_role: "owner" | "recruiter" | "reviewer"
      skill_source: "self" | "assessed" | "verified"
    }
    CompositeTypes: {}
  }
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Organization = Database["public"]["Tables"]["organizations"]["Row"]
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"]
export type Skill = Database["public"]["Tables"]["skills"]["Row"]
export type ProfileSkill = Database["public"]["Tables"]["profile_skills"]["Row"]

export type UserRole = Database["public"]["Enums"]["user_role"]
export type OrgType = Database["public"]["Enums"]["org_type"]
export type OrgVerificationStatus = Database["public"]["Enums"]["org_verification_status"]
export type OrgMemberRole = Database["public"]["Enums"]["org_member_role"]
export type SkillSource = Database["public"]["Enums"]["skill_source"]
export type PreferredLanguage = Database["public"]["Enums"]["preferred_language"]
