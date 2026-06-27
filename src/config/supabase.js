import dotenv from 'dotenv';
import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    }
  }
);  