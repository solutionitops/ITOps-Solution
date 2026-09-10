// Unified Aggregator for all 17 CyberSachet Course Final Quizzes (15 questions each)
import { SECURITY_COURSE_QUIZZES } from "./cybersachetSecurityQuizzes.js";
import { OPS_COURSE_QUIZZES } from "./cybersachetOpsQuizzes.js";

export const COURSE_QUIZZES = {
  ...SECURITY_COURSE_QUIZZES,
  ...OPS_COURSE_QUIZZES
};

export default COURSE_QUIZZES;
