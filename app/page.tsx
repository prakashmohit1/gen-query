import LoginPage from "./login/page";
import { getServerSession } from "next-auth";
import Sidebar from "@/components/common/side-menu";
import Header from "@/components/common/header";

export default async function Home() {
  const session = await getServerSession();
  console.log("session", session);
  if (!session) {
    return <LoginPage />;
  }
  return null;
}
