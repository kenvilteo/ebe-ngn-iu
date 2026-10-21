import { AnimatePresence } from "framer-motion";
import ProgressHearts from "./components/ProgressHearts";
import StepContainer from "./components/StepContainer";
import DateTicket from "./components/steps/DateTicket";
import DateTimeStep from "./components/steps/DateTimeStep";
import FoodStep from "./components/steps/FoodStep";
import InviteStep from "./components/steps/InviteStep";
import ScratchStep from "./components/steps/ScratchStep";
import ThisOrThatStep from "./components/steps/ThisOrThatStep";
import VibeStep from "./components/steps/VibeStep";
import { useDatePlanner } from "./hooks/useDatePlanner";
import { RouteLink } from "./router";
import type { Step } from "./types";

function renderStep(step: Step) {
  switch (step) {
    case "invite":
      return <InviteStep />;
    case "scratch":
      return <ScratchStep />;
    case "vibe":
      return <VibeStep />;
    case "datetime":
      return <DateTimeStep />;
    case "thisOrThat":
      return <ThisOrThatStep />;
    case "food":
      return <FoodStep />;
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
        made with 💗 in like, an hour
        <span className="mx-2 opacity-60">·</span>
        <RouteLink
          to="/love"
          className="underline decoration-dotted underline-offset-2 transition hover:text-raspberry"
        >
          chuyện của hai đứa mình
        </RouteLink>
      </footer>
    </>
  );
}
