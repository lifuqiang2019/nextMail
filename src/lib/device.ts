import { headers } from "next/headers";

const MOBILE_USER_AGENT_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|HarmonyOS/i;

export async function detectIsMobile() {
  const userAgent = (await headers()).get("user-agent") ?? "";
  return MOBILE_USER_AGENT_RE.test(userAgent);
}
