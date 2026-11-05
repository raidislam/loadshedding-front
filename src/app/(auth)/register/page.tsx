import type { Metadata } from "next";
import { RegisterForm } from "@/components/public/RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a customer account to report outages and follow repairs.",
  openGraph: { title: "Register | PowerGrid BD", description: "Create a customer account.", type: "website" },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
