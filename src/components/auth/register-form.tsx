"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUp, type SignUpState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialButtons } from "@/components/auth/social-buttons";

const initial: SignUpState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, initial);

  if (state.needEmailConfirm) {
    return (
      <Card className="rounded-3xl border-border/50 bg-card/90 shadow-2xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Проверьте почту</CardTitle>
          <CardDescription>
            Мы отправили письмо со ссылкой для подтверждения. После подтверждения вы сможете войти.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="text-primary font-medium underline"
            href="/login"
          >
            На страницу входа
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-border/50 bg-card/90 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт для учёта личных транзакций.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {state.error && (
          <p className="text-destructive text-sm" role="alert">
            {state.error}
          </p>
        )}
        <form action={action} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
            />
            {state.fieldErrors?.email?.[0] && (
              <p className="text-destructive text-xs">{state.fieldErrors.email[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
              minLength={8}
            />
            {state.fieldErrors?.password?.[0] && (
              <p className="text-destructive text-xs">{state.fieldErrors.password[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
            />
            {state.fieldErrors?.confirmPassword?.[0] && (
              <p className="text-destructive text-xs">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Регистрация…" : "Зарегистрироваться"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground px-2">или</span>
          </div>
        </div>

        <SocialButtons redirectTo="/" />

        <p className="text-muted-foreground text-center text-sm">
          Уже есть аккаунт?{" "}
          <Link className="text-foreground font-medium underline" href="/login">
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
