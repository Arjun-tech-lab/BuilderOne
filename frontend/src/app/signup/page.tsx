"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Logo } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { register } from "@/lib/auth";
import { ApiError } from "@/lib/api";

function SignupForm() {
  const params = useSearchParams();
  const role = (params.get("role") === "builder" ? "BUILDER" : "CUSTOMER") as
    | "CUSTOMER"
    | "BUILDER";
  const router = useRouter();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm_password") || "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        password,
        confirm_password: confirm,
        role,
      });
      setUser(res.user);
      toast("Account created successfully.", "success");
      router.push(
        role === "BUILDER" ? "/builder/onboarding" : "/customer/onboarding"
      );
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Unable to create account. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="name">
          {role === "BUILDER" ? "Contact person name" : "Full name"}
        </Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div>
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          required
          placeholder="10-digit mobile number"
          inputMode="tel"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <Label htmlFor="confirm_password">Confirm password</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={8}
        />
      </div>
      <FieldError message={error} />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Create {role === "BUILDER" ? "builder" : "homeowner"} account
      </Button>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f7f6f3]">
      <div className="mx-auto grid min-h-[100dvh] max-w-6xl md:grid-cols-2">
        <div className="hidden bg-ink-900 p-12 text-white md:flex md:flex-col md:justify-between">
          <Logo light />
          <div>
            <h1 className="font-display text-4xl leading-tight">
              Build better.
              <br />
              Choose smarter.
            </h1>
            <p className="mt-4 max-w-sm text-white/70">
              Join BuilderOne to connect with the right side of Bengaluru&apos;s
              residential construction marketplace.
            </p>
          </div>
          <p className="text-sm text-white/40">Bengaluru · Marketplace</p>
        </div>
        <div className="page-pad flex flex-col justify-center py-10 pb-safe md:px-16">
          <div className="md:hidden">
            <Logo />
          </div>
          <h2 className="heading-page mt-6 font-display text-ink-900 md:mt-0">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-brand-700">
              Login
            </Link>
          </p>
          <Suspense fallback={<div className="skeleton mt-8 h-80 rounded-2xl" />}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
