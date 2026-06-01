import { supabase } from './src/config/supabase';
import { getStudentLessonProgress } from './src/services/lesson.service';

async function testGetLesson() {
    try {
        console.log("Testing getStudentLessonProgress...");
        
        const result = await getStudentLessonProgress(18, 1);
        console.log("Progress:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testGetLesson();
