import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/current-user";
import { ThemeProvider } from "@/components/theme-provider";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui";

/**
 * Console SaaS admin — accès réservé au rôle `admin`, hors shell CRM.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <ThemeProvider accent={user.account.accent}>
      <div className="flex h-screen flex-col bg-app">
        <header className="flex h-[66px] flex-none items-center justify-between border-b border-black/[.07] bg-surface px-7">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-accent-2 text-[17px] font-extrabold text-white">
              {user.account.brandName[0]}
            </div>
            <div>
              <div className="text-[15px] font-extrabold tracking-tight">
                {user.account.brandName} · Console SaaS
              </div>
              <div className="text-[10.5px] font-semibold tracking-wide text-faint">
                GESTION DES ABONNÉS
              </div>
            </div>
          </div>
          <form action={signOut}>
            <Button variant="danger" size="sm">
              Se déconnecter
            </Button>
          </form>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[860px]">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
