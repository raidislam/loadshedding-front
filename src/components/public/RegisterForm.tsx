"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { useRedirectIfLoggedIn } from "@/components/layout/useRedirectIfLoggedIn";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_HOME } from "@/constants/navigation";
import { useLoad } from "@/hooks/useLoad";
import { registerSchema, type RegisterValues } from "@/lib/validations";
import { getAreas } from "@/services/areas";
import { registerCustomer } from "@/services/auth";

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  useRedirectIfLoggedIn();
  const { data: areas } = useLoad(getAreas);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { areaId: "" },
  });

  const areaItems = (areas ?? []).map((a) => ({ value: a.id, label: a.name }));

  async function onSubmit(values: RegisterValues) {
    try {
      await registerCustomer({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        address: values.address,
        areaId: values.areaId,
      });
      await login(values.email, values.password);
      toast.success("Account created. Welcome!");
      router.replace(ROLE_HOME.CUSTOMER);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create a customer account</CardTitle>
        <CardDescription>Customers can check power status and report outages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <FormField label="Mobile number" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" autoComplete="tel" placeholder="01811-234567" aria-invalid={!!errors.phone} {...register("phone")} />
          </FormField>
          <FormField label="Address" htmlFor="address" error={errors.address?.message}>
            <Input id="address" autoComplete="street-address" aria-invalid={!!errors.address} {...register("address")} />
          </FormField>
          <FormField label="Service area" htmlFor="areaId" error={errors.areaId?.message}>
            <Controller
              name="areaId"
              control={control}
              render={({ field }) => (
                <Select items={areaItems} value={field.value || null} onValueChange={(v) => field.onChange(v ?? "")}>
                  <SelectTrigger id="areaId" className="w-full" aria-invalid={!!errors.areaId}>
                    <SelectValue placeholder="Choose your area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaItems.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
            </FormField>
            <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
              <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
            </FormField>
          </div>
          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-electric hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
