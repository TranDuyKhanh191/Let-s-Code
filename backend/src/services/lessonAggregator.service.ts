import { supabase } from "../config/supabase";

type MediaMap = Record<string | number, any[]>;

/**
 * helper: lấy content_media cho content_type và list content_id
 */
const fetchContentMedia = async (contentType: string, ids: number[]) => {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase
    .from("content_media")
    .select("id, media_id, content_id, purpose, sort_order, media(*)")
    .eq("content_type", contentType)
    .in("content_id", ids)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const getFullLesson = async (lessonId: number) => {
  // 1) lesson meta
  const { data: lesson, error: lErr } = await supabase
    .from("lessons")
    .select("id, course_id, title, subtitle, slug, overview, status, sort_order, created_at, updated_at")
    .eq("id", lessonId)
    .maybeSingle();

  if (lErr) throw new Error(lErr.message);
  if (!lesson) return null;

  // parallel fetch basic parts
  const [
    objectivesRes,
    modelsRes,
    preparationRes,
    buildsRes,
    contentsRes,
    challengesRes,
    quizzesRes,
    attachmentsRes
  ] = await Promise.all([
    supabase.from("lesson_objectives").select("*").eq("lesson_id", lessonId).maybeSingle(),
    supabase.from("lesson_models").select("id, lesson_id, title, description, sort_order").eq("lesson_id", lessonId).order("sort_order", { ascending: true }),
    supabase.from("lesson_preparation").select("*").eq("lesson_id", lessonId).maybeSingle(),
    supabase.from("lesson_builds").select("id, lesson_id, build_type, sort_order").eq("lesson_id", lessonId).order("sort_order", { ascending: true }),
    supabase.from("lesson_contents").select("id, lesson_id, title, subtitle, description, usage_text, example_text, sort_order").eq("lesson_id", lessonId).order("sort_order", { ascending: true }),
    supabase.from("lesson_challenges").select("id, lesson_id, title, subtitle, description, instructions, sort_order").eq("lesson_id", lessonId).order("sort_order", { ascending: true }),
    supabase.from("lesson_quizzes").select("id, lesson_id, question_text, quiz_type, sort_order").eq("lesson_id", lessonId).order("sort_order", { ascending: true }),
    supabase.from("content_media").select("id, media_id, content_id, purpose, sort_order, media(*)").eq("content_type", "lesson_attachment").eq("content_id", lessonId).order("sort_order", { ascending: true })
  ]);

  if (objectivesRes.error) throw new Error(objectivesRes.error.message);
  if (modelsRes.error) throw new Error(modelsRes.error.message);
  if (preparationRes.error) throw new Error(preparationRes.error.message);
  if (buildsRes.error) throw new Error(buildsRes.error.message);
  if (contentsRes.error) throw new Error(contentsRes.error.message);
  if (challengesRes.error) throw new Error(challengesRes.error.message);
  if (quizzesRes.error) throw new Error(quizzesRes.error.message);
  if (attachmentsRes.error) throw new Error(attachmentsRes.error.message);

  const objectives = objectivesRes.data ?? null;
  const models = modelsRes.data ?? [];
  const preparation = preparationRes.data ?? null;
  const builds = buildsRes.data ?? [];
  const contents = contentsRes.data ?? [];
  const challenges = challengesRes.data ?? [];
  const quizzes = quizzesRes.data ?? [];
  const attachments = attachmentsRes.data ?? [];

  // 2) fetch media mappings for each content type in parallel
  const modelIds = models.map((m: any) => m.id);
  const buildIds = builds.map((b: any) => b.id);
  const contentIds = contents.map((c: any) => c.id);
  const challengeIds = challenges.map((ch: any) => ch.id);
  const quizIds = quizzes.map((q: any) => q.id);

  const [
    modelMedia,
    buildMedia,
    contentMedia,
    challengeMedia,
    quizMedia
  ] = await Promise.all([
    fetchContentMedia("lesson_model", modelIds),
    fetchContentMedia("lesson_build", buildIds),
    fetchContentMedia("lesson_content", contentIds),
    fetchContentMedia("lesson_challenge", challengeIds),
    supabase.from("quiz_answers").select("id, quiz_id, answer_text, is_correct, explanation").in("quiz_id", quizIds).order("id", { ascending: true })
  ]);

  // map media arrays to content id
  const mapByContent = (arr: any[]) => {
    const m: MediaMap = {};
    arr.forEach((x) => {
      const key = x.content_id;
      if (!m[key]) m[key] = [];
      m[key].push(x);
    });
    return m;
  };

  const modelsMediaMap = mapByContent(modelMedia as any[]);
  const buildsMediaMap = mapByContent(buildMedia as any[]);
  const contentsMediaMap = mapByContent(contentMedia as any[]);
  const challengesMediaMap = mapByContent(challengeMedia as any[]);

  // quiz answers map
  const answersData = (quizMedia as any).data ?? (quizMedia as any);
  const quizAnswersMap: Record<number, any[]> = {};
  if (Array.isArray(answersData)) {
    answersData.forEach((a: any) => {
      if (!quizAnswersMap[a.quiz_id]) quizAnswersMap[a.quiz_id] = [];
      quizAnswersMap[a.quiz_id].push(a);
    });
  }

  // attach media to each block
  const modelsWithMedia = models.map((m: any) => ({ ...m, media: modelsMediaMap[m.id] ?? [] }));
  const buildsWithMedia = builds.map((b: any) => ({ ...b, media: buildsMediaMap[b.id] ?? [] }));
  const contentsWithMedia = contents.map((c: any) => ({ ...c, media: contentsMediaMap[c.id] ?? [] }));
  const challengesWithMedia = challenges.map((ch: any) => ({ ...ch, media: challengesMediaMap[ch.id] ?? [] }));
  const quizzesWithAnswers = quizzes.map((q: any) => ({ ...q, answers: quizAnswersMap[q.id] ?? [] }));

  // attachments already fetched (attachment mappings with media)
  const attachmentsList = attachments;

  // final aggregator shape
  const full = {
    lesson,
    objectives,
    preparation,
    models: modelsWithMedia,
    builds: buildsWithMedia,
    contents: contentsWithMedia,
    challenges: challengesWithMedia,
    quizzes: quizzesWithAnswers,
    attachments: attachmentsList
  };

  return full;
};
