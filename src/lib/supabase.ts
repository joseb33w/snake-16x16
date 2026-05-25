import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const tablePrefix = import.meta.env.VITE_SUPABASE_TABLE_PREFIX

if (!supabaseUrl || !supabaseAnonKey || !tablePrefix) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const snakeRunsTable = `${tablePrefix}_snake_runs`

export type SnakeRun = {
  id: string
  user_id: string
  score: number
  length: number
  played_at: string
}
