import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  photon_id?: string;
  wallet_address?: string;
  email?: string;
  name?: string;
  created_at: string;
  updated_at?: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  json_definition: any;
  is_active: boolean;
  created_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: "pending" | "running" | "completed" | "failed";
  logs?: string;
  trigger_type?: string;
  executed_at: string;
}

