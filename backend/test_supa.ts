import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJ...";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses!enrollments_course_id_fkey (
        *,
        lessons(id)
      )
    `)
    .limit(1);

  console.log(JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

test();
