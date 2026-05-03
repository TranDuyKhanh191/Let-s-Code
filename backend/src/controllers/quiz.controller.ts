import { Request, Response } from "express";
import * as QuizService from "../services/quiz.service";
import { QuizCreateSchema, QuizPatchSchema } from "../validators/quiz.validator";

// ======================= CREATE =======================
export const create = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const payload = QuizCreateSchema.parse(req.body);

    const quiz = await QuizService.createQuizWithAnswers(lessonId, payload);

    res.json({ success: true, quiz });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// ======================= GET BY LESSON =======================
export const getByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const quizzes = await QuizService.getQuizzesByLesson(lessonId);

    res.json({ success: true, quizzes });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ======================= GET ONE QUIZ =======================
export const getOne = async (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.id);
    const quiz = await QuizService.getQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    res.json({ success: true, quiz });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ======================= UPDATE QUIZ =======================
export const update = async (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.id);
    const payload = QuizPatchSchema.parse(req.body);

    const quiz = await QuizService.updateQuiz(quizId, payload);

    res.json({ success: true, quiz });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ======================= DELETE QUIZ =======================
export const remove = async (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.id);

    await QuizService.deleteQuiz(quizId);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ======================= ADD ANSWER =======================
export const addAnswer = async (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.id);
    const { answer_text, is_correct, explanation } = req.body;

    const answer = await QuizService.addAnswer(quizId, {
      answer_text,
      is_correct,
      explanation,
    });

    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ======================= UPDATE ANSWER =======================
export const updateAnswer = async (req: Request, res: Response) => {
  try {
    const answerId = Number(req.params.id);
    const { answer_text, is_correct, explanation } = req.body;

    const answer = await QuizService.updateAnswer(answerId, {
      answer_text,
      is_correct,
      explanation,
    });

    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ======================= DELETE ANSWER =======================
export const removeAnswer = async (req: Request, res: Response) => {
  try {
    const answerId = Number(req.params.id);

    await QuizService.deleteAnswer(answerId);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
