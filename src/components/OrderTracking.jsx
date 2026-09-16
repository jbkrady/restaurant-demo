import { useEffect, useRef, useState } from "react";
import DeliveryMap from "./DeliveryMap";
import {
  STEPS,
  SCENARIOS,
  formatEta,
  getDeliveryProgress,
  getCurrentStep,
  getElapsedSimMinutes,
  getEta,
  track,
} from "../tracking";

const LAST_STEP = STEPS.length - 1;

export default function OrderTracking({ session }) {
  const { scenario, startedAt, order } = session;
  const variant = session.variant ?? "with_map";
  const showMapSlot = variant === "with_map";
  const [elapsed, setElapsed] = useState(() => getElapsedSimMinutes(startedAt));
  const step = getCurrentStep(scenario, elapsed);
  const previousStep = useRef(step);
  const eta = getEta(scenario, elapsed);
  const wasDelayed = useRef(eta.delayed);

  // Recompute from the clock every second; stop once delivered.
  useEffect(() => {
    if (step === LAST_STEP) return;
    const timer = setInterval(() => setElapsed(getElapsedSimMinutes(startedAt)), 1000);
    return () => clearInterval(timer);
  }, [startedAt, step]);

  useEffect(() => {
    const opening = getEta(scenario, getElapsedSimMinutes(startedAt));
    track("tracking_screen_viewed", {
      scenario_id: scenario,
      variant,
      eta_min: opening.initialMin,
      eta_max: opening.initialMax,
      confidence: opening.confidence,
    });
    function handleExit() {
      const minutes = getElapsedSimMinutes(startedAt);
      track("tracking_screen_exited", {
        step_at_exit: STEPS[getCurrentStep(scenario, minutes)].title,
        elapsed_simulated_minutes: Math.round(minutes),
      });
    }
    window.addEventListener("pagehide", handleExit);
    return () => window.removeEventListener("pagehide", handleExit);
  }, [scenario, startedAt, variant]);

  useEffect(() => {
    if (step === previousStep.current) return;
    track("tracking_step_changed", {
      from_step: STEPS[previousStep.current].title,
      to_step: STEPS[step].title,
      elapsed_simulated_minutes: SCENARIOS[scenario].stepStarts[step],
    });
    if (step === 2 && showMapSlot) {
      track("tracking_map_shown", {
        variant,
        elapsed_simulated_minutes: SCENARIOS[scenario].stepStarts[step],
      });
    }
    previousStep.current = step;
  }, [scenario, step, showMapSlot, variant]);

  // Fire once when the re-estimation happens on screen (not on reload).
  useEffect(() => {
    if (!eta.delayed || wasDelayed.current) return;
    wasDelayed.current = true;
    const { reestimate } = SCENARIOS[scenario];
    const before = getEta(scenario, reestimate.at - 1);
    track("tracking_eta_extended", {
      old_min: before.initialMin,
      old_max: before.initialMax,
      new_min: eta.initialMin,
      new_max: eta.initialMax,
      confidence_after: eta.confidence,
      elapsed_simulated_minutes: reestimate.at,
    });
  }, [scenario, eta]);

  const delivered = step === LAST_STEP;
  const deliveredAt = new Date(
    startedAt + SCENARIOS[scenario].stepStarts[LAST_STEP] * 60000
  ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const formattedTime = new Date(order.orderTime).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="tracking">
      <section className="tracking-card">
        <h2 className="tracking-title">Your order</h2>
        <p className="tracking-current" aria-live="polite">{STEPS[step].text}</p>

        <div className="tracking-eta" aria-live="polite">
          <p key={eta.delayed ? "revised" : "initial"} className={`tracking-eta-value${eta.delayed ? " tracking-eta-value--revised" : ""}`}>
            {delivered ? `Delivered at ${deliveredAt}` : formatEta(eta)}
          </p>
          {!delivered && eta.delayed && (
            <p className="tracking-eta-note">
              The restaurant is busier than expected · Estimate less precise than usual
            </p>
          )}
        </div>

        <ol className="tracking-steps">
          {STEPS.map((s, i) => {
            const state = i < step || step === LAST_STEP ? "done" : i === step ? "current" : "upcoming";
            return (
              <li key={s.title} className={`tracking-step tracking-step--${state}`}>
                <span className="tracking-dot">{state === "done" ? "✓" : ""}</span>
                <span className="tracking-step-title">{s.title}</span>
              </li>
            );
          })}
        </ol>

        {/* Map space is reserved from the start so it never pushes content. */}
        {showMapSlot && (
          <div className="tracking-map-slot">
            {step >= 2 && <DeliveryMap progress={getDeliveryProgress(scenario, elapsed)} />}
          </div>
        )}
      </section>

      <section className="tracking-card">
        <p className="success-meta">Order {order.orderNumber} · {formattedTime}</p>
        <ul className="modal-item-list modal-item-list--receipt">
          {order.items.map((item, i) => (
            <li key={i} className="modal-item-row">
              <span className="modal-item-emoji">{item.emoji}</span>
              <span className="modal-item-name">{item.name}</span>
              <span className="modal-item-qty">x{item.quantity}</span>
              <span className="modal-item-price">€{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="modal-totals">
          <div className="modal-totals-row modal-totals-total">
            <span>Total paid</span><span>€{order.total.toFixed(2)}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
