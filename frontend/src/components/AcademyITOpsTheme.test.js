import { describe, expect, it } from "vitest";
import {
  ITOPS_PROJECTS,
  ITOPS_LABS,
  ITOPS_INCIDENTS,
  SKILL_MATRIX_DEFINITIONS,
  CERTIFICATION_PATHS,
  TOOL_DECISION_CHALLENGES,
  getITOpsStoredState,
  saveITOpsStoredState,
  localCompleteITOpsLab
} from "../data/itopsAcademyCourses";

describe("ITOPS Academy Data & Simulation Engine", () => {
  it("defines valid flagship projects with architecture and components", () => {
    expect(ITOPS_PROJECTS.moonsav).toBeDefined();
    expect(ITOPS_PROJECTS.moonsav.architecture.length).toBeGreaterThanOrEqual(4);
    expect(ITOPS_PROJECTS.daig_distributed).toBeDefined();
    expect(ITOPS_PROJECTS.daig_distributed.architecture.length).toBeGreaterThanOrEqual(4);
  });

  it("contains structured practical labs with required properties", () => {
    expect(ITOPS_LABS.length).toBeGreaterThanOrEqual(5);
    ITOPS_LABS.forEach((lab) => {
      expect(lab.id).toBeTruthy();
      expect(lab.title).toBeTruthy();
      expect(lab.track).toBeTruthy();
      expect(lab.difficulty).toBeTruthy();
      expect(lab.objective).toBeTruthy();
      expect(lab.skills.length).toBeGreaterThan(0);
      expect(lab.tools.length).toBeGreaterThan(0);
    });
  });

  it("contains production chaos incidents with triage hints and symptoms", () => {
    expect(ITOPS_INCIDENTS.length).toBeGreaterThan(0);
    ITOPS_INCIDENTS.forEach((inc) => {
      expect(inc.id).toBeTruthy();
      expect(inc.title).toBeTruthy();
      expect(inc.severity).toBeTruthy();
      expect(inc.symptoms).toBeTruthy();
      expect(inc.hints.length).toBeGreaterThan(0);
    });
  });

  it("defines skill matrix with multi-level evidence checklists", () => {
    expect(SKILL_MATRIX_DEFINITIONS.length).toBeGreaterThanOrEqual(5);
    SKILL_MATRIX_DEFINITIONS.forEach((skill) => {
      expect(skill.id).toBeTruthy();
      expect(skill.name).toBeTruthy();
      expect(skill.category).toBeTruthy();
      expect(skill.evidenceChecklists).toBeDefined();
    });
  });

  it("defines industry certifications with minimum lab and score requirements", () => {
    expect(CERTIFICATION_PATHS.length).toBeGreaterThanOrEqual(4);
    CERTIFICATION_PATHS.forEach((cert) => {
      expect(cert.id).toBeTruthy();
      expect(cert.code).toBeTruthy();
      expect(cert.requiredLabsCount).toBeGreaterThan(0);
      expect(cert.minScore).toBeGreaterThanOrEqual(75);
    });
  });

  it("defines problem-driven tool decision challenges with rationales", () => {
    expect(TOOL_DECISION_CHALLENGES.length).toBeGreaterThan(0);
    TOOL_DECISION_CHALLENGES.forEach((c) => {
      expect(c.scenario).toBeTruthy();
      expect(c.options.length).toBeGreaterThanOrEqual(2);
      expect(c.options.some((o) => o.correct)).toBe(true);
    });
  });

  it("properly calculates completion and updates stored state without data corruption", () => {
    const initialState = getITOpsStoredState();
    expect(initialState.xp).toBeGreaterThanOrEqual(0);
    const updated = localCompleteITOpsLab("lab-fnd-001", "Verified via grep /proc/cpuinfo");
    expect(updated.completedLabIds).toContain("lab-fnd-001");
    expect(updated.xp).toBeGreaterThanOrEqual(initialState.xp);
  });
});

import {
  TRACK_FINAL_ASSESSMENTS,
  LAB_KNOWLEDGE_CHECKPOINTS,
  getTrackAssessment,
  submitTrackAssessment
} from "../data/itopsAcademyCourses";

describe("ITOps Academy 15-Question Track Exams & Lab Checkpoints", () => {
  it("ensures all 6 core tracks have exactly 15 final examination questions with explanations", () => {
    const tracks = ["foundation", "devops", "devsecops", "kubernetes", "sre", "incidents"];
    tracks.forEach(track => {
      const exam = getTrackAssessment(track);
      expect(exam, `Track ${track} must have an assessment`).toBeDefined();
      expect(exam.length, `Track ${track} must have exactly 15 questions`).toBe(15);
      exam.forEach((q, idx) => {
        expect(q.id, `Q${idx+1} in ${track} exam must have an ID`).toBeTruthy();
        expect(q.question, `Q${idx+1} in ${track} exam must have a question string`).toBeTruthy();
        expect(q.choices.length, `Q${idx+1} in ${track} exam must have choices`).toBeGreaterThanOrEqual(2);
        expect(q.explanation, `Q${idx+1} in ${track} exam must have an explanation`).toBeTruthy();
      });
    });
  });

  it("ensures flagship practical labs have 3 knowledge checkpoints with explanations", () => {
    const labIds = Object.keys(LAB_KNOWLEDGE_CHECKPOINTS);
    expect(labIds.length).toBeGreaterThanOrEqual(6);
    labIds.forEach(labId => {
      const checkpoints = LAB_KNOWLEDGE_CHECKPOINTS[labId];
      expect(checkpoints.length, `Lab ${labId} must have 3 checkpoints`).toBe(3);
      checkpoints.forEach(cp => {
        expect(cp.question).toBeTruthy();
        expect((cp.choices || cp.options).length).toBeGreaterThanOrEqual(3);
        expect(cp.correctIndex).toBeDefined();
        expect(cp.explanation).toBeTruthy();
      });
    });
  });

  it("grades track assessments accurately, requires >=80% to pass, and awards credential", () => {
    const exam = getTrackAssessment("foundation");
    const perfectAnswers = {};
    exam.forEach(q => {
      if (q.questionType === "single") perfectAnswers[q.id] = q.correctIndex;
      else if (q.questionType === "multiple") perfectAnswers[q.id] = q.correctIndexes;
      else if (q.questionType === "ordering") perfectAnswers[q.id] = q.correctOrder;
    });
    const res = submitTrackAssessment("foundation", perfectAnswers);
    expect(res.scorePct).toBe(100);
    expect(res.passed).toBe(true);
    expect(res.correctCount).toBe(15);
  });
});
