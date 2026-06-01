import { supabase } from './src/config/supabase';
import { getSubmissionsForLesson } from './src/services/lesson.service';

async function test() {
    try {
        console.log("Testing enrollments for lesson...");
        
        // Find a lesson id
        const { data: lessons } = await supabase.from('lessons').select('*').limit(1);
        if (!lessons || lessons.length === 0) {
            console.log("No lessons found.");
            return;
        }
        
        const lessonId = lessons[0].id;
        console.log("Found lesson:", lessonId);
        
        const submissions = await getSubmissionsForLesson(lessonId);
        console.log("Submissions:", JSON.stringify(submissions, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
