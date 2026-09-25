"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await login({
        email: String(fd.get("email") || ""),
        password: String(fd.get("password") || ""),
      });
      setUser(res.user);
      toast("Welcome back.", "success");
      if (res.user.role === "BUILDER") router.push("/builder/dashboard");
      else router.push("/customer/dashboard");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Unable to login. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#f7f6f3]">
      <div className="page-container page-pad flex min-h-[100dvh] max-w-md flex-col justify-center py-10 pb-safe">
        <Logo />
        <h1 className="heading-page mt-8 font-display text-ink-900 sm:mt-10">
          Welcome back
        </h1>
        <p className="mt-2 break-all text-sm text-ink-500">
          Demo: customer@demo.builderone.in / Demo@1234
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <FieldError message={error} />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-500">
          New to BuilderOne?{" "}
          <Link href="/get-started" className="font-medium text-brand-700">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
