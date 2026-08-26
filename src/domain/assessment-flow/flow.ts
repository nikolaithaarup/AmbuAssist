export type AssessmentAnswers<StepId extends string, Answer> = Partial<
  Record<StepId, Answer>
>;

export type AssessmentStep<StepId extends string, Answer> = {
  id: StepId;
  next: (
    answer: Answer,
    answers: AssessmentAnswers<StepId, Answer>,
  ) => StepId | null;
};

export type AssessmentDefinition<StepId extends string, Answer> = {
  startStepId: StepId;
  steps: readonly AssessmentStep<StepId, Answer>[];
  totalSteps?: (
    answers: AssessmentAnswers<StepId, Answer>,
    path: readonly StepId[],
  ) => number;
};

export type AssessmentFlowState<StepId extends string, Answer> = {
  answers: AssessmentAnswers<StepId, Answer>;
  path: StepId[];
  position: number;
  completed: boolean;
};

export type AssessmentProgress = {
  current: number;
  total: number;
};

export function createAssessmentFlowState<StepId extends string, Answer>(
  definition: AssessmentDefinition<StepId, Answer>,
): AssessmentFlowState<StepId, Answer> {
  return {
    answers: {},
    path: [definition.startStepId],
    position: 0,
    completed: false,
  };
}

function findStep<StepId extends string, Answer>(
  definition: AssessmentDefinition<StepId, Answer>,
  stepId: StepId,
): AssessmentStep<StepId, Answer> {
  const step = definition.steps.find((candidate) => candidate.id === stepId);
  if (!step) throw new Error(`Unknown assessment step: ${stepId}`);
  return step;
}

export function answerAssessmentStep<StepId extends string, Answer>(
  definition: AssessmentDefinition<StepId, Answer>,
  state: AssessmentFlowState<StepId, Answer>,
  stepId: StepId,
  answer: Answer,
): AssessmentFlowState<StepId, Answer> {
  if (state.completed || state.path[state.position] !== stepId) return state;

  const previousAnswer = state.answers[stepId];
  if (Object.is(previousAnswer, answer) && state.position < state.path.length - 1) {
    return { ...state, position: state.position + 1 };
  }

  const retainedPath = state.path.slice(0, state.position + 1);
  const retainedIds = new Set<StepId>(retainedPath);
  const answers = Object.fromEntries(
    Object.entries(state.answers).filter(([id]) => retainedIds.has(id as StepId)),
  ) as AssessmentAnswers<StepId, Answer>;
  answers[stepId] = answer;

  const nextStepId = findStep(definition, stepId).next(answer, answers);
  if (nextStepId === null) {
    return {
      answers,
      path: retainedPath,
      position: retainedPath.length - 1,
      completed: true,
    };
  }

  findStep(definition, nextStepId);
  const path = [...retainedPath, nextStepId];
  return {
    answers,
    path,
    position: path.length - 1,
    completed: false,
  };
}

export function goBackInAssessment<StepId extends string, Answer>(
  state: AssessmentFlowState<StepId, Answer>,
): AssessmentFlowState<StepId, Answer> {
  if (state.completed) return { ...state, completed: false };
  if (state.position === 0) return state;
  return { ...state, position: state.position - 1 };
}

export function restartAssessment<StepId extends string, Answer>(
  definition: AssessmentDefinition<StepId, Answer>,
): AssessmentFlowState<StepId, Answer> {
  return createAssessmentFlowState(definition);
}

export function getAssessmentProgress<StepId extends string, Answer>(
  definition: AssessmentDefinition<StepId, Answer>,
  state: AssessmentFlowState<StepId, Answer>,
): AssessmentProgress {
  const total = Math.max(
    state.path.length,
    definition.totalSteps?.(state.answers, state.path) ?? definition.steps.length,
  );
  return {
    current: state.completed ? total : Math.min(state.position + 1, total),
    total,
  };
}

export function getCurrentAssessmentStepId<StepId extends string, Answer>(
  state: AssessmentFlowState<StepId, Answer>,
): StepId | null {
  return state.completed ? null : state.path[state.position] ?? null;
}

