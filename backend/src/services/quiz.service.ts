import { supabase } from "../config/supabase";
import { QuizCreateInput, QuizAnswerInput } from "../validators/quiz.validator";

// ======================================================
// Helper: format quiz + answers
// ======================================================
const attachAnswers = (quiz: any, answers: any[]) => ({
  ...quiz,
  answers: answers || []
});

// ======================================================
// CREATE quiz + optional answers
// ======================================================
export const createQuizWithAnswers = async (lessonId: number, payload: QuizCreateInput) => {
  const insertQuiz = {
    lesson_id: lessonId,
    question_text: payload.question_text,
    quiz_type: payload.quiz_type,
    sort_order: payload.sort_order ?? 0
  };

  // Insert quiz
  const { data: quiz, error: qErr } = await supabase
    .from("lesson_quizzes")
    .insert([insertQuiz])
    .select()
    .single();

  if (qErr) throw new Error(qErr.message);

  // Insert answers if any
  if (payload.answers?.length) {
    const answersPayload = payload.answers.map(a => ({
      quiz_id: quiz.id,
      answer_text: a.answer_text,
      is_correct: !!a.is_correct,
      explanation: a.explanation ?? null
    }));

    const { error: aErr } = await supabase.from("quiz_answers").insert(answersPayload);
    if (aErr) {
      // rollback
      await supabase.from("lesson_quizzes").delete().eq("id", quiz.id);
      throw new Error(aErr.message);
    }
  }

  return getQuizById(quiz.id);
};

// ======================================================
// GET ONE QUIZ (with answers)
// ======================================================
export const getQuizById = async (id: number) => {
  const { data: quiz, error: qErr } = await supabase
    .from("lesson_quizzes")
    .select("id, lesson_id, question_text, quiz_type, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (qErr) throw new Error(qErr.message);
  if (!quiz) return null;

  const { data: answers, error: aErr } = await supabase
    .from("quiz_answers")
    .select("id, quiz_id, answer_text, is_correct, explanation")
    .eq("quiz_id", id)
    .order("id", { ascending: true });

  if (aErr) throw new Error(aErr.message);

  return attachAnswers(quiz, answers || []);
};

// ======================================================
// GET QUIZZES BY LESSON (with answers)
// ======================================================
export const getQuizzesByLesson = async (lessonId: number) => {
  const { data: quizzes, error: qErr } = await supabase
    .from("lesson_quizzes")
    .select("id, lesson_id, question_text, quiz_type, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (qErr) throw new Error(qErr.message);
  if (!quizzes?.length) return [];

  const quizIds = quizzes.map(q => q.id);

  // Load all answers
  const { data: answers, error: aErr } = await supabase
    .from("quiz_answers")
    .select("id, quiz_id, answer_text, is_correct, explanation")
    .in("quiz_id", quizIds);

  if (aErr) throw new Error(aErr.message);

  // Group by quiz_id
  const map: Record<number, any[]> = {};
  answers?.forEach(a => {
    if (!map[a.quiz_id]) map[a.quiz_id] = [];
    map[a.quiz_id].push(a);
  });

  return quizzes.map(q => ({
    ...q,
    answers: map[q.id] || []
  }));
};

// ======================================================
// UPDATE QUIZ (fields + optional answers)
// ======================================================
export const updateQuiz = async (id: number, payload: Partial<QuizCreateInput>) => {
  // Clean update body (avoid overwriting with undefined)
  const updateBody: any = {};
  if (payload.question_text !== undefined) updateBody.question_text = payload.question_text;
  if (payload.quiz_type !== undefined) updateBody.quiz_type = payload.quiz_type;
  if (payload.sort_order !== undefined) updateBody.sort_order = payload.sort_order;

  const { error: qErr } = await supabase
    .from("lesson_quizzes")
    .update(updateBody)
    .eq("id", id);

  if (qErr) throw new Error(qErr.message);

  // Handle answers update
  if (payload.answers) {
    const { error: delErr } = await supabase.from("quiz_answers").delete().eq("quiz_id", id);
    if (delErr) throw new Error(delErr.message);

    const insertList = payload.answers.map(a => ({
      quiz_id: id,
      answer_text: a.answer_text,
      is_correct: !!a.is_correct,
      explanation: a.explanation ?? null
    }));

    const { error: insErr } = await supabase.from("quiz_answers").insert(insertList);
    if (insErr) throw new Error(insErr.message);
  }

  return getQuizById(id);
};

// ======================================================
// DELETE QUIZ
// ======================================================
export const deleteQuiz = async (id: number) => {
  await supabase.from("quiz_answers").delete().eq("quiz_id", id);
  const { error } = await supabase.from("lesson_quizzes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
};

// ======================================================
// ANSWERS CRUD
// ======================================================
export const addAnswer = async (quizId: number, payload: QuizAnswerInput) => {
  const insertData = {
    quiz_id: quizId,
    answer_text: payload.answer_text,
    is_correct: !!payload.is_correct,
    explanation: payload.explanation ?? null
  };

  const { data, error } = await supabase
    .from("quiz_answers")
    .insert([insertData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateAnswer = async (id: number, payload: Partial<QuizAnswerInput>) => {
  const { data, error } = await supabase
    .from("quiz_answers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteAnswer = async (id: number) => {
  const { error } = await supabase.from("quiz_answers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
};
