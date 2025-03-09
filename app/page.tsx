import LoginPage from "./login/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();
  if (!session) {
    return <LoginPage />;
  }
  return redirect("/db-editor");
}
