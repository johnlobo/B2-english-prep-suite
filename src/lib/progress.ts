import { ModuleData, UserProgress } from '../types';

const THEORY_WEIGHT = 0.3;
const TESTS_WEIGHT = 0.7;

function bestScore(scores: number[]): number {
  return scores.length > 0 ? Math.max(...scores) : 0;
}

/**
 * Global progress = 30% theory days read + 70% test performance.
 * Test performance is the average, across each module's control exam plus one
 * overall simulation slot, of that slot's best historical score (repeated
 * attempts only ever raise progress, never lower it).
 */
export function calculateGlobalProgress(progress: UserProgress, modules: ModuleData[]): number {
  const totalTheoryCount = modules.reduce((acc, m) => acc + m.days.length, 0);
  const theoryScore = totalTheoryCount > 0 ? progress.completedTheory.length / totalTheoryCount : 0;

  const examAttempts = progress.examAttempts || [];
  const moduleSlotScores = modules.map((mod) =>
    bestScore(
      examAttempts.filter((e) => e.type === 'module' && e.moduleIndex === mod.index).map((e) => e.score)
    ) / 100
  );
  const simulationSlotScore =
    bestScore(examAttempts.filter((e) => e.type === 'simulation').map((e) => e.score)) / 100;

  const testSlotScores = [...moduleSlotScores, simulationSlotScore];
  const testsScore = testSlotScores.reduce((acc, s) => acc + s, 0) / testSlotScores.length;

  return Math.round((theoryScore * THEORY_WEIGHT + testsScore * TESTS_WEIGHT) * 100);
}
