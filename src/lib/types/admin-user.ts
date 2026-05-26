/** Сериализуемая строка для таблицы админки (Auth user). */
export type AdminUserRow = {
  id: string;
  email: string | undefined;
  created_at: string;
  banned: boolean;
  is_pro: boolean;
  subscription_status: string;
  pro_current_period_end: string | null;
};
