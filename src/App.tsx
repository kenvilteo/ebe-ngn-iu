import { AnimatePresence } from "framer-motion";
import ProgressHearts from "./components/ProgressHearts";
import StepContainer from "./components/StepContainer";
import ActivityDetailStep from "./components/steps/ActivityDetailStep";
import ActivityStep from "./components/steps/ActivityStep";
import DateTicket from "./components/steps/DateTicket";
import DateTimeStep from "./components/steps/DateTimeStep";
import InviteStep from "./components/steps/InviteStep";
import { useDatePlanner } from "./hooks/useDatePlanner";
import { RouteLink } from "./router";
import type { Step } from "./types";

function renderStep(step: Step) {
  switch (step) {
    case "invite":
      return <InviteStep />;
    case "datetime":
      return <DateTimeStep />;
    case "activity":
      return <ActivityStep />;
    case "activityDetail":
      return <ActivityDetailStep />;
    case "ticket":
      return <DateTicket />;
    default:
      return <InviteStep />;
  }
}

export default function App() {
  const { step, activeSteps, stepIndex } = useDatePlanner();
  const showProgress = step !== "invite";

  return (
    <>
      {showProgress && <ProgressHearts activeSteps={activeSteps} stepIndex={stepIndex} />}
      <AnimatePresence mode="wait">
        <StepContainer key={step}>{renderStep(step)}</StepContainer>
      </AnimatePresence>
      <footer className="pb-6 text-center text-xs text-[#C2ADB7]">
        Làm vội trong một buổi tối, nhưng là làm cho em 💗
        <span className="mx-2 opacity-60">·</span>
        <RouteLink
          to="/love"
          className="underline decoration-dotted underline-offset-2 transition hover:text-raspberry"
        >
          Chuyện của hai đứa mình
        </RouteLink>
      </footer>
    </>
  );
}
