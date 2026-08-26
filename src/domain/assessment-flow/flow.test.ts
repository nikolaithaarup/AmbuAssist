import {
  answerAssessmentStep,
  createAssessmentFlowState,
  getAssessmentProgress,
  goBackInAssessment,
  restartAssessment,
  type AssessmentDefinition,
} from "./flow";

type StepId = "first" | "branch" | "extra" | "last";
type Answer = "yes" | "no";

const definition: AssessmentDefinition<StepId, Answer> = {
  startStepId: "first",
  steps: [
    { id: "first", next: () => "branch" },
    { id: "branch", next: (answer) => (answer === "yes" ? "extra" : "last") },
    { id: "extra", next: () => "last" },
    { id: "last", next: () => null },
  ],
  totalSteps: (answers) => (answers.branch === "no" ? 3 : 4),
};

describe("assessment flow", () => {
  test("starts on the first question and advances once", () => {
    const initial = createAssessmentFlowState(definition);
    expect(initial.path).toEqual(["first"]);
    const next = answerAssessmentStep(definition, initial, "first", "yes");
    expect(next.path).toEqual(["first", "branch"]);
    expect(next.position).toBe(1);
  });

  test("ignores stale rapid taps instead of skipping a step", () => {
    const initial = createAssessmentFlowState(definition);
    const next = answerAssessmentStep(definition, initial, "first", "yes");
    expect(answerAssessmentStep(definition, next, "first", "yes")).toBe(next);
  });

  test("back restores the previous question and its answer", () => {
    let state = createAssessmentFlowState(definition);
    state = answerAssessmentStep(definition, state, "first", "yes");
    state = answerAssessmentStep(definition, state, "branch", "yes");
    state = goBackInAssessment(state);
    expect(state.path[state.position]).toBe("branch");
    expect(state.answers.branch).toBe("yes");
  });

  test("changing an earlier branch removes stale unreachable answers", () => {
    let state = createAssessmentFlowState(definition);
    state = answerAssessmentStep(definition, state, "first", "yes");
    state = answerAssessmentStep(definition, state, "branch", "yes");
    state = answerAssessmentStep(definition, state, "extra", "yes");
    state = goBackInAssessment(goBackInAssessment(state));
    state = answerAssessmentStep(definition, state, "branch", "no");
    expect(state.path).toEqual(["first", "branch", "last"]);
    expect(state.answers.extra).toBeUndefined();
    expect(getAssessmentProgress(definition, state)).toEqual({ current: 3, total: 3 });
  });

  test("preserves a multi-level branch when reviewing the same answers", () => {
    let state = createAssessmentFlowState(definition);
    state = answerAssessmentStep(definition, state, "first", "yes");
    state = answerAssessmentStep(definition, state, "branch", "yes");
    state = answerAssessmentStep(definition, state, "extra", "yes");
    state = answerAssessmentStep(definition, state, "last", "yes");

    state = goBackInAssessment(goBackInAssessment(goBackInAssessment(state)));
    expect(state.path[state.position]).toBe("branch");
    state = answerAssessmentStep(definition, state, "branch", "yes");
    expect(state.path[state.position]).toBe("extra");
    expect(state.answers).toMatchObject({ branch: "yes", extra: "yes", last: "yes" });
    state = answerAssessmentStep(definition, state, "extra", "yes");
    expect(state.path[state.position]).toBe("last");
  });

  test("can shorten and then extend a reviewed branch without reviving stale answers", () => {
    let state = createAssessmentFlowState(definition);
    state = answerAssessmentStep(definition, state, "first", "yes");
    state = answerAssessmentStep(definition, state, "branch", "yes");
    state = answerAssessmentStep(definition, state, "extra", "yes");
    state = answerAssessmentStep(definition, state, "last", "yes");
    state = goBackInAssessment(goBackInAssessment(goBackInAssessment(state)));
    state = answerAssessmentStep(definition, state, "branch", "no");
    expect(state.path).toEqual(["first", "branch", "last"]);
    expect(state.answers.extra).toBeUndefined();
    state = goBackInAssessment(state);
    state = answerAssessmentStep(definition, state, "branch", "yes");
    expect(state.path).toEqual(["first", "branch", "extra"]);
    expect(state.answers.extra).toBeUndefined();
    expect(state.answers.last).toBeUndefined();
  });

  test("completion, result review, and restart are deterministic", () => {
    let state = createAssessmentFlowState(definition);
    state = answerAssessmentStep(definition, state, "first", "yes");
    state = answerAssessmentStep(definition, state, "branch", "no");
    state = answerAssessmentStep(definition, state, "last", "yes");
    expect(state.completed).toBe(true);
    expect(getAssessmentProgress(definition, state)).toEqual({ current: 3, total: 3 });
    expect(goBackInAssessment(state)).toMatchObject({ completed: false, position: 2 });
    expect(restartAssessment(definition)).toEqual(createAssessmentFlowState(definition));
  });
});
