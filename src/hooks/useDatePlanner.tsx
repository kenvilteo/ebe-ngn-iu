import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CONFIG, STORAGE_KEYS, getActiveSteps } from "../config";
import { initialPlan } from "../types";
import type { DatePlan, Step } from "../types";
import { todayLocalISO } from "../utils/dateFormat";

interface PersistedState {
  step: Step;
  plan: DatePlan;
}

function withTodayDefault(plan: DatePlan): DatePlan {
  if (plan.date) return plan;
  return { ...plan, date: todayLocalISO() };
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.state);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || typeof parsed !== "object" || !parsed.plan) return null;
    // Tên người nhận là hằng số trong CONFIG, nên trạng thái cũ trong localStorage
    // không được phép ghi đè.
    return {
      step: parsed.step ?? "invite",
      plan: withTodayDefault({ ...initialPlan, ...parsed.plan, recipientName: CONFIG.recipientName }),
    };
  } catch {
    return null;
  }
}

function persist(step: Step, plan: DatePlan) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.state, JSON.stringify({ step, plan }));
  } catch {
    // storage full or unavailable — the in-memory state still works
  }
}

export function clearPersistedState() {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.state);
  } catch {
    // ignore
  }
}

interface PlannerContextValue {
  step: Step;
  plan: DatePlan;
  activeSteps: string[];
  stepIndex: number;
  updatePlan: (partial: Partial<DatePlan>) => void;
  setPlan: (plan: DatePlan) => void;
  goToStep: (step: Step) => void;
  next: () => void;
  back: () => void;
  reset: (keepSubmittedFlag?: boolean) => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

function nextStepName(steps: string[], current: Step): Step {
  const idx = steps.indexOf(current);
  const nextStep = steps[Math.min(idx + 1, steps.length - 1)];
  return nextStep as Step;
}

export function DatePlannerProvider({ children }: { children: ReactNode }) {
  const activeSteps = useMemo(() => getActiveSteps(), []);
  const seeded = useRef<PersistedState | null | undefined>(undefined);
  if (seeded.current === undefined) {
    seeded.current = typeof window === "undefined" ? null : loadPersisted();
  }

  const [step, setStep] = useState<Step>(() => {
    const s = seeded.current?.step ?? "invite";
    return (activeSteps.includes(s) ? s : "invite") as Step;
  });
  const [plan, setPlanState] = useState<DatePlan>(() =>
    withTodayDefault({ ...(seeded.current?.plan ?? initialPlan), recipientName: CONFIG.recipientName })
  );

  useEffect(() => {
    persist(step, plan);
  }, [step, plan]);

  const updatePlan = useCallback((partial: Partial<DatePlan>) => {
    setPlanState((prev) => ({ ...prev, ...partial }));
  }, []);

  const setPlan = useCallback((nextPlan: DatePlan) => {
    setPlanState(nextPlan);
  }, []);

  const goToStep = useCallback(
    (nextStep: Step) => {
      if (!activeSteps.includes(nextStep)) return;
      setStep(nextStep);
    },
    [activeSteps]
  );

  const next = useCallback(() => {
    setStep((prev) => nextStepName(activeSteps, prev));
  }, [activeSteps]);

  const back = useCallback(() => {
    setStep((prev) => {
      const idx = activeSteps.indexOf(prev);
      return (activeSteps[Math.max(idx - 1, 0)] ?? "invite") as Step;
    });
  }, [activeSteps]);

  const reset = useCallback((_keepSubmittedFlag = true) => {
    clearPersistedState();
    setPlanState(withTodayDefault({ ...initialPlan, recipientName: CONFIG.recipientName }));
    setStep("invite");
  }, []);

  const value = useMemo<PlannerContextValue>(
    () => ({
      step,
      plan,
      activeSteps,
      stepIndex: Math.max(activeSteps.indexOf(step), 0),
      updatePlan,
      setPlan,
      goToStep,
      next,
      back,
      reset,
    }),
    [step, plan, activeSteps, updatePlan, setPlan, goToStep, next, back, reset]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function useDatePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("useDatePlanner must be used inside DatePlannerProvider");
  return ctx;
}
