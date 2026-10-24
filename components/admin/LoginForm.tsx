"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertTriangle, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BunMark } from "@/components/brand/Logo";
import { EASE_HEARTH } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { DEMO_CREDENTIALS, useAdminAuth } from "@/lib/store/admin-auth";
import { loginSchema, type LoginValues } from "@/lib/schemas";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, hydrated, signIn } = useAdminAuth();
  const [failed, setFailed] = useState(false);
  const next = params.get("next")?.startsWith("/admin") ? params.get("next")! : "/admin";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, next, router]);

  const onSubmit = async (values: LoginValues) => {
    setFailed(false);
    const ok = await signIn(values.email, values.password);
    if (ok) router.replace(next);
    else setFailed(true);
  };

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-2">
      <div className="on-dark halftone relative hidden flex-col justify-between overflow-hidden border-r-2 border-ink bg-tomato p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <BunMark className="h-10 w-11 text-white" />
          <span className="font-display text-3xl uppercase">Hot Bun</span>
        </Link>
        <div>
          <p className="font-display text-[8rem] uppercase leading-[0.85] text-white" aria-hidden>
            Back of
            <br />
            <span className="text-mustard">house.</span>
          </p>
          <p className="mt-6 max-w-sm font-display text-display-sm uppercase">The rail, the menu and tonight&apos;s book, all in one place.</p>
        </div>
        <p className="text-sm font-semibold">Demo staff panel · no real authentication</p>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_HEARTH }}
        >
          <BunMark className="h-10 w-9 text-ink lg:hidden" />
          <h1 className="mt-4 font-display text-4xl">Staff sign in</h1>
          <p className="mt-2 text-muted">For the Kera team. This is a demo — use the account below.</p>

          <button
            type="button"
            onClick={() => {
              setValue("email", DEMO_CREDENTIALS.email, { shouldValidate: true });
              setValue("password", DEMO_CREDENTIALS.password, { shouldValidate: true });
            }}
            className="mt-6 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-muted/40 bg-card p-4 text-left text-sm transition-colors hover:border-ink"
          >
            <KeyRound className="h-5 w-5 shrink-0 text-muted" aria-hidden />
            <span>
              <span className="block font-semibold">Fill demo credentials</span>
              <span className="font-mono text-xs text-muted">
                {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
              </span>
            </span>
          </button>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            {failed && (
              <p role="alert" className="flex gap-2 rounded-xl bg-tomato-tint/70 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 text-tomato" aria-hidden />
                Those details don&apos;t match the demo account.
              </p>
            )}
            <Field label="Email" error={errors.email?.message}>
              {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="username" aria-describedby={describedBy} invalid={invalid} {...register("email")} />}
            </Field>
            <Field label="Password" error={errors.password?.message}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="password" autoComplete="current-password" aria-describedby={describedBy} invalid={invalid} {...register("password")} />
              )}
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText="Signing in…">
              Sign in
            </Button>
          </form>
          <Link href="/" className="mt-6 inline-block text-sm text-muted underline underline-offset-4 hover:text-ink">
            ← Back to the website
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
