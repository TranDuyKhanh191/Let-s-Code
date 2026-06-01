import { submitLessonProgress } from './src/services/lesson.service';

async function testSubmit() {
    try {
        console.log("Testing submitLessonProgress...");
        const result = await submitLessonProgress(18, 1, "https://example.com/test.pdf");
        console.log("Submit result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testSubmit();
