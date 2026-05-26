import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 md:p-10">
      <div className="absolute end-6 top-6 z-10 md:end-10 md:top-10">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
