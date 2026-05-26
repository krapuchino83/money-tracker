"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn, type SignInState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialButtons } from "@/components/auth/social-buttons";

const initial: SignInState = {};

type Props = {
  redirectTo: string;
  urlError?: string;
};

export function LoginForm({ redirectTo, urlError }: Props) {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <Card className="rounded-3xl border-border/50 bg-card/90 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Войдите в Money Tracker, чтобы видеть свои транзакции.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {(urlError || state.error) && (
          <p className="text-destructive text-sm" role="alert">
            {urlError ? "Ошибка входа после OAuth. Продублируйте попытку." : state.error}
          </p>
        )}
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
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
              autoComplete="current-password"
              required
              disabled={pending}
            />
            {state.fieldErrors?.password?.[0] && (
              <p className="text-destructive text-xs">{state.fieldErrors.password[0]}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Вход…" : "Войти"}
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

        <SocialButtons redirectTo={redirectTo} />

        <p className="text-muted-foreground text-center text-sm">
          Нет аккаунта?{" "}
          <Link className="text-foreground font-medium underline" href="/register">
            Зарегистрироваться
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
