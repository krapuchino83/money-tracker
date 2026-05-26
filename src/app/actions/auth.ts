"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

function safeNextPath(redirectTo: FormDataEntryValue | null): string {
  const raw = typeof redirectTo === "string" ? redirectTo : "";
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }
  return raw;
}

function mapAuthMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Неверный email или пароль";
  }
  if (lower.includes("email not confirmed")) {
    return "Подтвердите email по ссылке из письма";
  }
  if (lower.includes("user already registered")) {
    return "Этот email уже зарегистрирован";
  }
  return message;
}

export type SignInState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthMessage(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(safeNextPath(formData.get("redirectTo")));
}

export type SignUpState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  needEmailConfirm?: boolean;
};

export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthMessage(error.message) };
  }

  if (!data.session) {
    revalidatePath("/", "layout");
    return { needEmailConfirm: true };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
