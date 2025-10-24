export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      kernels: {
        Row: {
          id: string
          title: string
          description: string
          author_id: string
          parent_id: string | null
          tags: string[]
          license: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          author_id: string
          parent_id?: string | null
          tags?: string[]
          license?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          author_id?: string
          parent_id?: string | null
          tags?: string[]
          license?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Kernel = Database['public']['Tables']['kernels']['Row']
export type KernelInsert = Database['public']['Tables']['kernels']['Insert']
export type KernelUpdate = Database['public']['Tables']['kernels']['Update']

// Extended types with relations
export type KernelWithAuthor = Kernel & {
  author: Profile
}

export type KernelWithRelations = Kernel & {
  author: Profile
  parent?: Kernel | null
  children?: Kernel[]
  fork_count?: number
}
