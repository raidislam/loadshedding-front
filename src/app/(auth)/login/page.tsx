import type { Metadata } from "next";
import { LoginForm } from "@/components/public/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to PowerGrid BD as an admin, customer or technician, or use a one-click demo account.",
  openGraph: { title: "Login | PowerGrid BD", description: "Log in or use a demo account.", type: "website" },
};

export default function LoginPage() {
  return <LoginForm />;
}
