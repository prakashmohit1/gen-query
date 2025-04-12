import LoginPage from "./login/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function Home() {
  const session = await getServerSession();
  console.log(">>>> session", session);
  const pathname = (await headers()).get("x-invoke-path") || "";

  // Skip session check for accept-invite routes
  if (pathname.startsWith("/accept-invite/")) {
    return null;
  }

  if (!session) {
    return <LoginPage />;
  }
  return redirect("/db-editor");
}
