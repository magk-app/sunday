import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common database operations
export const db = {
  // Email operations
  emails: {
    async getByUserId(userId: string, limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    },

    async create(email: Omit<Database['public']['Tables']['emails']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('emails')
        .insert(email)
        .select()
        .single();
      
      return { data, error };
    },

    async update(id: string, updates: Partial<Database['public']['Tables']['emails']['Update']>) {
      const { data, error } = await supabase
        .from('emails')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', id);
      
      return { error };
    },
  },

  // Thread operations
  threads: {
    async getByUserId(userId: string, limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false })
        .range(offset, offset + limit - 1);
      
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    },

    async create(thread: Omit<Database['public']['Tables']['threads']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('threads')
        .insert(thread)
        .select()
        .single();
      
      return { data, error };
    },

    async update(id: string, updates: Partial<Database['public']['Tables']['threads']['Update']>) {
      const { data, error } = await supabase
        .from('threads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    },
  },

  // Task operations
  tasks: {
    async getByUserId(userId: string, status?: string, limit = 50, offset = 0) {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    },

    async create(task: Omit<Database['public']['Tables']['tasks']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      return { data, error };
    },

    async update(id: string, updates: Partial<Database['public']['Tables']['tasks']['Update']>) {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      return { error };
    },
  },

  // User preferences operations
  userPreferences: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return { data, error };
    },

    async create(preferences: Omit<Database['public']['Tables']['user_preferences']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert(preferences)
        .select()
        .single();
      
      return { data, error };
    },

    async update(userId: string, updates: Partial<Database['public']['Tables']['user_preferences']['Update']>) {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      
      return { data, error };
    },
  },
};

// Real-time subscriptions
export const subscribeToChanges = (table: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};

// Utility functions
export const getSupabaseClient = () => supabase;

export default supabase; 