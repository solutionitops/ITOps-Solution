import { describe, expect, it } from "vitest";
import { gradeAnswer } from "./cybersachetCourses";

// Quiz grading is the one piece of client-side logic that directly decides
// whether a learner passes a course and earns a certificate in local-preview
// mode — mirrors the real submit_quiz() RPC's semantics exactly, so these
// tests guard against exactly the kind of bug that would let someone pass
// (or unfairly fail) a course.
describe("gradeAnswer", () => {
  describe("single-choice questions", () => {
    const q = { questionType: "single", correctIndex: 2 };
    it("is correct only when the given index matches exactly", () => {
      expect(gradeAnswer(q, 2)).toBe(true);
      expect(gradeAnswer(q, 0)).toBe(false);
      expect(gradeAnswer(q, undefined)).toBe(false);
    });
  });

  describe("multiple-choice questions", () => {
    const q = { questionType: "multiple", correctIndexes: [0, 2, 3] };
    it("is correct when the same set is chosen, regardless of order", () => {
      expect(gradeAnswer(q, [0, 2, 3])).toBe(true);
      expect(gradeAnswer(q, [3, 0, 2])).toBe(true);
    });
    it("is wrong for a partial or extra selection", () => {
      expect(gradeAnswer(q, [0, 2])).toBe(false);
      expect(gradeAnswer(q, [0, 1, 2, 3])).toBe(false);
    });
    it("is wrong for an empty or missing answer", () => {
      expect(gradeAnswer(q, [])).toBe(false);
      expect(gradeAnswer(q, undefined)).toBe(false);
    });
  });

  describe("ordering questions", () => {
    const q = { questionType: "ordering", correctOrder: [2, 0, 1, 3] };
    it("is correct only when the exact sequence matches", () => {
      expect(gradeAnswer(q, [2, 0, 1, 3])).toBe(true);
    });
    it("is wrong when the same items are in a different order", () => {
      expect(gradeAnswer(q, [0, 2, 1, 3])).toBe(false);
    });
    it("is wrong for a missing answer", () => {
      expect(gradeAnswer(q, undefined)).toBe(false);
    });
  });
});

import { COURSES, getLocalQuiz } from "./cybersachetCourses";

describe("CyberSachet 15-Question Final Assessment Integrity", () => {
  it("ensures all 17 courses exist and each has exactly 15 final assessment questions", () => {
    expect(COURSES.length).toBe(17);
    COURSES.forEach(course => {
      expect(course.quiz, `Course ${course.slug} must have a quiz`).toBeDefined();
      expect(course.quiz.length, `Course ${course.slug} must have exactly 15 quiz questions`).toBe(15);
      expect(course.quizQuestionCount, `Course ${course.slug} quizQuestionCount must be 15`).toBe(15);
      course.quiz.forEach((q, idx) => {
        expect(q.id, `Q${idx+1} in ${course.slug} must have an ID`).toBeTruthy();
        expect(q.question, `Q${idx+1} in ${course.slug} must have a question string`).toBeTruthy();
        expect(q.explanation, `Q${idx+1} in ${course.slug} must have a non-empty explanation`).toBeTruthy();
      });
    });
  });

  it("ensures getLocalQuiz returns all 15 questions with educational explanations", () => {
    const course = COURSES[0];
    const quiz = getLocalQuiz(course.id);
    expect(quiz.length).toBe(15);
    quiz.forEach(q => {
      expect(q.explanation).toBeTruthy();
    });
  });
});

import { getLocalLessons, localCheckLessonAnswer, localGetLessonProgress } from "./cybersachetCourses";
import { getAuthorLessonCheckpoints } from "./cybersachetLessonCheckpoints";

describe("CyberSachet Multi-Checkpoint Integrity", () => {
  it("ensures all lessons in all 17 courses have at least 3 scenario-based knowledge checkpoints with explanations", () => {
    let totalLessonsCount = 0;
    let totalCheckpointsCount = 0;

    COURSES.forEach(course => {
      const lessons = getLocalLessons(course.id);
      expect(lessons.length, `Course ${course.slug} should have lessons`).toBeGreaterThan(0);
      totalLessonsCount += lessons.length;

      lessons.forEach((lesson, lIdx) => {
        expect(lesson.checks, `Lesson "${lesson.title}" (${lesson.id}) in ${course.slug} must have checks array`).toBeDefined();
        expect(lesson.checks.length, `Lesson "${lesson.title}" in ${course.slug} must have at least 3 checkpoints`).toBeGreaterThanOrEqual(3);

        // Backward compatibility
        expect(lesson.check, `Lesson "${lesson.title}" must maintain check fallback`).toBeDefined();
        expect(lesson.check.question).toBe(lesson.checks[0].question);

        lesson.checks.forEach((cp, cpIdx) => {
          totalCheckpointsCount++;
          expect(cp.question, `CP${cpIdx+1} in lesson "${lesson.title}" must have question text`).toBeTruthy();
          expect(Array.isArray(cp.choices), `CP${cpIdx+1} in lesson "${lesson.title}" must have choices array`).toBe(true);
          expect(cp.choices.length, `CP${cpIdx+1} in lesson "${lesson.title}" must have at least 2 choices`).toBeGreaterThanOrEqual(2);
          expect(cp.explanation, `CP${cpIdx+1} in lesson "${lesson.title}" must have technical explanation`).toBeTruthy();
          // Security: client checks should not expose correctIndex
          expect(cp.correctIndex, `CP${cpIdx+1} in lesson "${lesson.title}" should not leak correctIndex in client checks`).toBeUndefined();
        });
      });
    });

    expect(totalLessonsCount).toBe(164);
    expect(totalCheckpointsCount).toBe(492);
  });

  it("accurately verifies answers and awards completion across checkpoint indices", async () => {
    const course = COURSES[0];
    const lessons = getLocalLessons(course.id);
    const firstLesson = lessons[0];
    const authorChecks = getAuthorLessonCheckpoints(course.id, firstLesson.id);

    expect(authorChecks.length).toBeGreaterThanOrEqual(3);
    const correct0 = authorChecks[0].correctIndex;
    const wrong0 = (correct0 + 1) % authorChecks[0].choices.length;

    // Check wrong answer
    const wrongResult = await localCheckLessonAnswer(course.id, firstLesson.id, wrong0, "test-user-1", 0, false);
    expect(wrongResult).toBe(false);

    // Check correct answer for step 0 (should not mark lesson complete yet)
    const correctResult0 = await localCheckLessonAnswer(course.id, firstLesson.id, correct0, "test-user-1", 0, false);
    expect(correctResult0).toBe(true);
    let progressSet = await localGetLessonProgress(course.id, "test-user-1");
    expect(progressSet.has(firstLesson.id)).toBe(false);

    // Check intermediate steps if any
    for (let i = 1; i < authorChecks.length - 1; i++) {
      const cIndex = authorChecks[i].correctIndex;
      const res = await localCheckLessonAnswer(course.id, firstLesson.id, cIndex, "test-user-1", i, false);
      expect(res).toBe(true);
      progressSet = await localGetLessonProgress(course.id, "test-user-1");
      expect(progressSet.has(firstLesson.id)).toBe(false);
    }

    // Check correct answer for final step with allPassed = true
    const correctLast = authorChecks[authorChecks.length - 1].correctIndex;
    const finalResult = await localCheckLessonAnswer(course.id, firstLesson.id, correctLast, "test-user-1", authorChecks.length - 1, true);
    expect(finalResult).toBe(true);

    // Now lesson should be marked complete and present in progressSet
    progressSet = await localGetLessonProgress(course.id, "test-user-1");
    expect(progressSet.has(firstLesson.id)).toBe(true);
  });

  it("guarantees a balanced and randomized distribution of correct answers across options A, B, C, and D", () => {
    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let totalQuestions = 0;

    COURSES.forEach(course => {
      const lessons = getLocalLessons(course.id);
      lessons.forEach(lesson => {
        const authorChecks = getAuthorLessonCheckpoints(course.id, lesson.id);
        authorChecks.forEach(cp => {
          totalQuestions++;
          expect(cp.correctIndex).toBeGreaterThanOrEqual(0);
          expect(cp.correctIndex).toBeLessThanOrEqual(3);
          distribution[cp.correctIndex]++;
        });

        // Ensure in any lesson, the 3 checkpoints are not all the same option
        if (authorChecks.length >= 3) {
          const distinctOptions = new Set(authorChecks.map(cp => cp.correctIndex));
          expect(distinctOptions.size, `Lesson "${lesson.title}" should have varied checkpoint answer options`).toBeGreaterThan(1);
        }
      });
    });

    expect(totalQuestions).toBe(492);
    // Every option (0=A, 1=B, 2=C, 3=D) represents ~25% of total questions
    for (let opt = 0; opt <= 3; opt++) {
      expect(distribution[opt]).toBeGreaterThanOrEqual(100);
      expect(distribution[opt]).toBeLessThanOrEqual(140);
    }
    // Specifically verify Option B is not dominating
    expect(distribution[1] / totalQuestions).toBeCloseTo(0.25, 1);
  });
});

describe("CyberSachet Unique Lesson Video Integrity", () => {
  it("ensures each lesson across all 17 courses has a distinct, topic-specific educational video", () => {
    let totalLessonsCount = 0;

    COURSES.forEach(course => {
      const lessons = getLocalLessons(course.id);
      totalLessonsCount += lessons.length;

      // Ensure every lesson has a video object with videoId and title
      lessons.forEach(lesson => {
        expect(lesson.video, `Lesson "${lesson.title}" (${lesson.id}) in ${course.slug} must have a video`).toBeDefined();
        expect(lesson.video.videoId, `Lesson "${lesson.title}" must have videoId`).toBeTruthy();
        expect(lesson.video.title, `Lesson "${lesson.title}" must have video title`).toBeTruthy();
        expect(lesson.videoId).toBe(lesson.video.videoId);
      });

      // Ensure lessons within each course do NOT all share the exact same video chapter
      const lessonVideoKeys = new Set(lessons.map(l => `${l.video.videoId}:${l.video.start || 0}`));
      expect(lessonVideoKeys.size, `Course ${course.slug} should have distinct video chapter/lectures across its lessons`).toBe(lessons.length);
    });

    expect(totalLessonsCount).toBe(164);
  });
});

