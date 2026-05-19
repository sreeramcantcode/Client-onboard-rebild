import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/client-portal/login");
}
