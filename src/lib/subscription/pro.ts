import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ProProfile = {
  subscription_status: string;
  pro_current_period_end: string | null;
  stripe_customer_id: string | null;
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function isProFromProfile(profile: ProProfile | null | undefined): boolean {
  if (!profile) return false;
  if (ACTIVE_STATUSES.has(profile.subscription_status)) {
    return true;
  }
  if (profile.pro_current_period_end) {
    const end = new Date(profile.pro_current_period_end).getTime();
    return end > Date.now();
  }
  return false;
}

export async function getProfileProFields(
  userId: string,
): Promise<ProProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_status, pro_current_period_end, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ProProfile;
}

export async function getCurrentUserIsPro(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const profile = await getProfileProFields(user.id);
  return isProFromProfile(profile);
}

export async function updateProfileFromStripeSubscription(params: {
  userId: string;
  customerId: string;
  subscriptionId: string;
  status: string;
  currentPeriodEnd: Date | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      subscription_status: params.status,
      pro_current_period_end: params.currentPeriodEnd?.toISOString() ?? null,
    })
    .eq("user_id", params.userId);

  if (error) {
    throw new Error(`Failed to update profile subscription: ${error.message}`);
  }
}

export async function clearProfileSubscription(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      stripe_subscription_id: null,
      subscription_status: "none",
      pro_current_period_end: null,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to clear profile subscription: ${error.message}`);
  }
}
