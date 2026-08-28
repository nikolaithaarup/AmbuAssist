import {
  answerAssessmentStep,
  createAssessmentFlowState,
  goBackInAssessment,
  type AssessmentDefinition,
} from "../assessment-flow/flow";
import {
  getSpinalTraumaTransition,
  isSpinalTraumaStep,
  type SpinalTraumaAnswer,
  type SpinalTraumaStepId,
} from "./spinalTrauma";

const flowDefinition: AssessmentDefinition<SpinalTraumaStepId, SpinalTraumaAnswer> = {
  startStepId: "penetrating",
  steps: (["penetrating", "critical", "tenderOrNeuro"] as const).map((id) => ({
    id,
    next: (answer) => {
      const next = getSpinalTraumaTransition(id, answer);
      return isSpinalTraumaStep(next) ? next : null;
    },
  })),
};

describe("spinal trauma decision regression", () => {
  test("penetrating trauma retains immediate none outcome", () => {
    expect(getSpinalTraumaTransition("penetrating", "yes")).toBe("none");
  });
  test("time-critical and spinal paths retain their outcomes", () => {
    expect(getSpinalTraumaTransition("critical", "yes")).toBe("timeCritical");
    expect(getSpinalTraumaTransition("critical", "no")).toBe("tenderOrNeuro");
    expect(getSpinalTraumaTransition("tenderOrNeuro", "yes")).toBe("spinal");
    expect(getSpinalTraumaTransition("tenderOrNeuro", "no")).toBe("none");
  });

  test("back navigation allows an earlier answer to recalculate the branch", () => {
    let state = createAssessmentFlowState(flowDefinition);
    state = answerAssessmentStep(flowDefinition, state, "penetrating", "no");
    state = answerAssessmentStep(flowDefinition, state, "critical", "no");
    expect(state.path).toEqual(["penetrating", "critical", "tenderOrNeuro"]);

    state = goBackInAssessment(state);
    state = answerAssessmentStep(flowDefinition, state, "critical", "yes");

    expect(state.completed).toBe(true);
    expect(state.path).toEqual(["penetrating", "critical"]);
    expect(state.answers).toEqual({ penetrating: "no", critical: "yes" });
    expect(getSpinalTraumaTransition("critical", "yes")).toBe("timeCritical");
  });
});
