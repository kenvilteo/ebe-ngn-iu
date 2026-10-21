import type { DatePlan, SubmitDateResponse } from "../types";
import { randomId } from "../utils/randomId";

export async function submitDate(
  plan: DatePlan,
  clientSubmissionId: string = randomId()
): Promise<SubmitDateResponse & { clientSubmissionId: string }> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    const response = await fetch("/api/submit-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, clientSubmissionId }),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    const data = (await response.json().catch(() => null)) as SubmitDateResponse | null;
    if (!data) return { ok: false, error: "SEND_FAILED", clientSubmissionId };
    return { ...data, clientSubmissionId };
  } catch {
    return { ok: false, error: "NETWORK_ERROR", clientSubmissionId };
  }
}
