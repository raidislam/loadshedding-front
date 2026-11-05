"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, User as UserIcon, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { useRedirectIfLoggedIn } from "@/components/layout/useRedirectIfLoggedIn";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROLE_HOME } from "@/constants/navigation";
import { loginSchema, type LoginValues } from "@/lib/validations";
import type { Role } from "@/types";

const demoButtons: { role: Role; label: string; icon: typeof Shield }[] = [
  { role: "ADMIN", label: "Admin Demo Login", icon: Shield },
  { role: "CUSTOMER", label: "Customer Demo Login", icon: UserIcon },
  { role: "TECHNICIAN", label: "Technician Demo Login", icon: Wrench },
];

export function LoginForm() {
  const router = useRouter();
  const { login, loginAs } = useAuth();
  useRedirectIfLoggedIn();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.replace(ROLE_HOME[user.role]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed.");
    }
  }

  function handleDemo(role: Role) {
    const user = loginAs(role);
    toast.success(`Logged in as ${user.name} (demo)`);
    router.replace(ROLE_HOME[role]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>Enter your email and password, or use a demo account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
          </FormField>
          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or try a demo account</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-2">
          {demoButtons.map((b) => (
            <Button key={b.role} type="button" variant="outline" className="h-10 w-full justify-start" onClick={() => handleDemo(b.role)}>
              <b.icon /> {b.label}
            </Button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          New customer?{" "}
          <Link href="/register" className="font-medium text-electric hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
