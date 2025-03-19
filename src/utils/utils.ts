import { redirect } from "next/navigation";

export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  const params = new URLSearchParams();
  params.set(type, "true");
  params.set("message", message);
  return redirect(`${path}?${params.toString()}`);
}
