import { supabase } from './src/config/supabase';

async function test() {
  const { data } = await supabase.from('lesson_progress').select('*');
  console.log("lesson_progress:", data);

  const { data: enrollments } = await supabase.from('enrollments').select('*');
  console.log("enrollments:", enrollments);
}

test();
