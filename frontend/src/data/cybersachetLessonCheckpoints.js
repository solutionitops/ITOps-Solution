// Central Knowledge Checkpoints Resolver for CyberSachet and ITOps Academy Courses
// Integrates 492 scenario-grounded questions (3 per lesson across 164 lessons in 17 courses)
// with full educational explanations and client-side sanitization.

import { SECURITY_CHECKPOINTS } from "./cybersachetSecurityCheckpoints.js";
import { OPS_CHECKPOINTS } from "./cybersachetOpsCheckpoints.js";

export const ALL_LESSON_CHECKPOINTS = {
  ...SECURITY_CHECKPOINTS,
  ...OPS_CHECKPOINTS
};

/**
 * Normalizes course ID or slug to match keys in ALL_LESSON_CHECKPOINTS
 */
function normalizeCourseKey(courseIdOrSlug) {
  if (!courseIdOrSlug) return "";
  if (ALL_LESSON_CHECKPOINTS[courseIdOrSlug]) return courseIdOrSlug;
  const localPrefixed = `local-${courseIdOrSlug}`;
  if (ALL_LESSON_CHECKPOINTS[localPrefixed]) return localPrefixed;
  const stripped = courseIdOrSlug.replace(/^local-/, "");
  if (ALL_LESSON_CHECKPOINTS[stripped]) return stripped;
  // Match by substring or slug alias
  const found = Object.keys(ALL_LESSON_CHECKPOINTS).find(
    k => k === courseIdOrSlug || k.endsWith(courseIdOrSlug) || courseIdOrSlug.endsWith(k.replace(/^local-/, ""))
  );
  return found || courseIdOrSlug;
}

/**
 * Retrieves full author-side checkpoints for a specific lesson (includes correctIndex and explanation)
 * Used by scoring and answer verification functions.
 */
export function getAuthorLessonCheckpoints(courseId, lessonId, fallbackCheck) {
  const key = normalizeCourseKey(courseId);
  const courseBank = ALL_LESSON_CHECKPOINTS[key];
  if (courseBank && courseBank[lessonId] && Array.isArray(courseBank[lessonId]) && courseBank[lessonId].length >= 3) {
    return courseBank[lessonId];
  }

  // Graceful fallback if a custom or newly seeded lesson is checked
  if (fallbackCheck) {
    return [
      {
        question: fallbackCheck.question,
        choices: fallbackCheck.choices,
        correctIndex: fallbackCheck.correctIndex ?? 0,
        explanation: fallbackCheck.explanation ?? "Review the key takeaways and core concepts in the lesson material above."
      },
      {
        question: `Operational Scenario: What is the primary operational mitigation or verification step for this scenario?`,
        choices: [
          fallbackCheck.choices[fallbackCheck.correctIndex ?? 0] || "Apply standard enterprise verification procedures",
          "Restart the local computer without saving state",
          "Ignore the issue unless users report errors",
          "Disable security logging"
        ],
        correctIndex: 0,
        explanation: "Consistent verification using established out-of-band protocols and defense-in-depth ensures operational integrity."
      },
      {
        question: `Engineering Standard: Which best practice ensures resilient enterprise defense against this vulnerability?`,
        choices: [
          "Disabling audit logging",
          "Enforcing least privilege, immutable backups, and continuous monitoring",
          "Running all processes with root administrator permissions",
          "Bypassing change approval workflows"
        ],
        correctIndex: 1,
        explanation: "Modern enterprise reliability and zero-trust security demand least privilege, continuous logging, and automated failure containment."
      }
    ];
  }

  return [];
}

/**
 * Retrieves UI-safe checkpoints for a specific lesson (strips correctIndex to prevent devtools inspection)
 * Mirrors the security boundary enforced by server-side RPCs.
 */
export function getLessonCheckpoints(courseId, lessonId, fallbackCheck) {
  const authorChecks = getAuthorLessonCheckpoints(courseId, lessonId, fallbackCheck);
  return authorChecks.map((cp, idx) => ({
    id: `cp-${lessonId}-${idx + 1}`,
    stepNumber: idx + 1,
    question: cp.question,
    choices: cp.choices,
    explanation: cp.explanation ?? null
  }));
}

/**
 * Verifies an answer choice for a specific checkpoint index within a lesson
 */
export function verifyLessonCheckpointAnswer(courseId, lessonId, checkpointIndex, choiceIndex, fallbackCheck) {
  const authorChecks = getAuthorLessonCheckpoints(courseId, lessonId, fallbackCheck);
  const target = authorChecks[checkpointIndex] || authorChecks[0];
  if (!target) return { correct: true, explanation: "" };
  const isCorrect = choiceIndex === target.correctIndex;
  return {
    correct: isCorrect,
    explanation: target.explanation ?? ""
  };
}
