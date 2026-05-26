import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "..", ".taskmaster", "tasks", "tasks.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));
if (j.master.tasks.some((t) => t.id === "23")) {
  console.log("PRD-3 tasks already present (id 23+). Skipping.");
  process.exit(0);
}
const iso = new Date().toISOString();

const newTasks = [
  {
    id: "23",
    title: "Миграция profiles: роль user/admin + связь с auth.users",
    description: "Таблица public.profiles и значение по умолчанию user.",
    status: "pending",
    dependencies: ["22"],
    priority: "high",
    details:
      "SQL: profiles (user_id uuid PK FK auth.users ON DELETE CASCADE, role text с check user|admin, default user, created_at). Триггер при signup или backfill. RLS на profiles: пользователь читает свою строку; смена роли admin — через сервер.",
    testStrategy: "Миграция в Supabase; новый пользователь получает profile.",
    subtasks: [
      {
        id: 1,
        title: "DDL и политики",
        description: "",
        status: "pending",
        dependencies: [],
        testStrategy: "SQL без ошибок.",
        parentId: "undefined",
      },
      {
        id: 2,
        title: "Строка profile при регистрации",
        description: "",
        status: "pending",
        dependencies: [],
        testStrategy: "После signUp есть строка в profiles.",
        parentId: "undefined",
      },
    ],
    updatedAt: iso,
  },
  {
    id: "24",
    title: "Переменные ADMIN_EMAIL и SUPABASE_SERVICE_ROLE_KEY",
    description: "Только сервер; обновить .env.example.",
    status: "pending",
    dependencies: [],
    priority: "high",
    details:
      "ADMIN_EMAIL — email админа (trim, lower). SUPABASE_SERVICE_ROLE_KEY не в NEXT_PUBLIC. Документировать в .env.example.",
    testStrategy: "Service role не попадает в клиентский импорт.",
    subtasks: [
      {
        id: 1,
        title: ".env.example без секретов",
        description: "",
        status: "pending",
        dependencies: [],
        testStrategy: "",
        parentId: "undefined",
      },
    ],
    updatedAt: iso,
  },
  {
    id: "25",
    title: "lib/supabase/admin.ts — клиент с service role (только сервер)",
    description: "createAdminClient для Auth Admin API.",
    status: "pending",
    dependencies: ["24"],
    priority: "high",
    details:
      "createClient из @supabase/supabase-js с service role; не импортировать из client components.",
    testStrategy: "Импорт только из server actions / server-only модулей.",
    subtasks: [],
    updatedAt: iso,
  },
  {
    id: "26",
    title: "Проверка админа и role=admin для ADMIN_EMAIL",
    description: "Утилита isAdmin + sync profiles.",
    status: "pending",
    dependencies: ["23", "25", "24"],
    priority: "high",
    details:
      "Сравнение email сессии с ADMIN_EMAIL; upsert profiles.role=admin. Финальная проверка на страницах admin.",
    testStrategy: "Под admin email — доступ; под другим — нет.",
    subtasks: [],
    updatedAt: iso,
  },
  {
    id: "27",
    title: "Защита /admin: layout или server guard",
    description: "Только админы видят раздел.",
    status: "pending",
    dependencies: ["26"],
    priority: "high",
    details:
      "app/admin/layout.tsx: getUser + isAdmin; иначе redirect или notFound.",
    testStrategy: "Не-админ не видит контент админки.",
    subtasks: [],
    updatedAt: iso,
  },
  {
    id: "28",
    title: "Страница /admin/users — список через Admin API",
    description: "Email, дата регистрации, статус бана.",
    status: "pending",
    dependencies: ["25", "27"],
    priority: "high",
    details:
      "Server Component; listUsers; shadcn table. Без утечки service key на клиент.",
    testStrategy: "Список совпадает с Dashboard → Users.",
    subtasks: [
      {
        id: 1,
        title: "Таблица UI",
        description: "",
        status: "pending",
        dependencies: [],
        testStrategy: "",
        parentId: "undefined",
      },
    ],
    updatedAt: iso,
  },
  {
    id: "29",
    title: "Server Actions: бан и разбан пользователя",
    description: "Нельзя забанить себя.",
    status: "pending",
    dependencies: ["28"],
    priority: "high",
    details:
      "adminUsers.ts: zod для user_id; ban/unban через admin client.",
    testStrategy: "Бан блокирует вход; разбан восстанавливает.",
    subtasks: [],
    updatedAt: iso,
  },
  {
    id: "30",
    title: "Удаление пользователя + confirm; каскад транзакций",
    description: "deleteUser в Auth; FK CASCADE.",
    status: "pending",
    dependencies: ["28"],
    priority: "high",
    details:
      "Запрет удалить себя. Диалог confirm. Проверить ON DELETE CASCADE для transactions.user_id.",
    testStrategy: "Пользователь удалён из Auth; данные каскадом.",
    subtasks: [],
    updatedAt: iso,
  },
  {
    id: "31",
    title: "Аудит: service role не в клиентском бандле",
    description: "Сборка и при необходимости grep.",
    status: "pending",
    dependencies: ["25", "29", "30"],
    priority: "medium",
    details:
      "npm run build; убедиться что admin.ts не в client chunks.",
    testStrategy: "Сборка ок; нет импорта admin client в client.",
    subtasks: [],
    updatedAt: iso,
  },
  {
    id: "32",
    title: "Сквозной тест модуля 8 по PRD-3",
    description: "Критерии приёмки.",
    status: "pending",
    dependencies: ["27", "28", "29", "30", "31"],
    priority: "medium",
    details:
      "Два аккаунта: админ управляет тестовым пользователем; обычный не открывает /admin/users.",
    testStrategy: "Чеклист из PRD-3.",
    subtasks: [],
    updatedAt: iso,
  },
];

j.master.tasks.push(...newTasks);
j.master.metadata.taskCount = j.master.tasks.length;
j.master.metadata.completedCount = j.master.tasks.filter((t) => t.status === "done").length;
j.master.metadata.lastModified = iso;

fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
console.log("tasks total:", j.master.tasks.length, "done:", j.master.metadata.completedCount);
