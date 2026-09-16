import { useEffect, useRef, useState } from "react";
import { STEPS, SCENARIOS, getCurrentStep, getElapsedSimMinutes, track } from "../tracking";

const LAST_STEP = STEPS.length - 1;

export default function OrderTracking({ session }) {
  const { scenario, startedAt, order } = session;
  const [elapsed, setElapsed] = useState(() => getElapsedSimMinutes(startedAt));
  const step = getCurrentStep(scenario, elapsed);
  const previousStep = useRef(step);

  // Recompute from the clock every second; stop once delivered.
  useEffect(() => {
    if (step === LAST_STEP) return;
    const timer = setInterval(() => setElapsed(getElapsedSimMinutes(startedAt)), 1000);
    return () => clearInterval(timer);
  }, [startedAt, step]);

  useEffect(() => {
    track("tracking_screen_viewed", { scenario_id: scenario });
    function handleExit() {
      const minutes = getElapsedSimMinutes(startedAt);
      track("tracking_screen_exited", {
        step_at_exit: STEPS[getCurrentStep(scenario, minutes)].title,
        elapsed_simulated_minutes: Math.round(minutes),
      });
    }
    window.addEventListener("pagehide", handleExit);
    return () => window.removeEventListener("pagehide", handleExit);
  }, [scenario, startedAt]);

  useEffect(() => {
    if (step === previousStep.current) return;
    track("tracking_step_changed", {
      from_step: STEPS[previousStep.current].title,
      to_step: STEPS[step].title,
      elapsed_simulated_minutes: SCENARIOS[scenario].stepStarts[step],
    });
    previousStep.current = step;
  }, [scenario, step]);

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

        {/* Reserved at final size for spec 02 (ETA) and spec 03 (map). */}
        <div className="tracking-slot tracking-slot--eta" />
        <div className="tracking-slot tracking-slot--map" />
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
