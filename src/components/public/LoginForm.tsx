"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, User as UserIcon, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { useRedirectIfLoggedIn } from "@/components/layout/useRedirectIfLoggedIn";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROLE_HOME } from "@/constants/navigation";
import { errorMessage } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/validations";
import type { Role } from "@/types/api";

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

  // Which demo button is busy (so we can show "Logging in..." on it)
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);

  async function onSubmit(values: LoginValues) {
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.replace(ROLE_HOME[user.role]);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function handleDemo(role: Role) {
    setDemoLoading(role);
    try {
      const user = await loginAs(role);
      toast.success(`Logged in as ${user.name} (demo)`);
      router.replace(ROLE_HOME[user.role]);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-xl font-semibold leading-snug">Log in</h1>
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
            <Button
              key={b.role}
              type="button"
              variant="outline"
              className="h-10 w-full justify-start"
              disabled={demoLoading !== null || isSubmitting}
              onClick={() => handleDemo(b.role)}
            >
              <b.icon /> {demoLoading === b.role ? "Logging in..." : b.label}
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
