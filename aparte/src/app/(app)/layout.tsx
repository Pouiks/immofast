import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/current-user";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { AccountPanel } from "@/features/account/account-panel";
import { Overlays } from "@/components/shell/overlays";

/**
 * Shell CRM (client & invité). Garde de rôle :
 *  - non authentifié → /login
 *  - admin SaaS → console dédiée /admin (pas d'accès CRM)
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  return (
    <ThemeProvider accent={user.account.accent}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar brandName={user.account.brandName} fullName={user.fullName} role={user.role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-7 py-[26px]">{children}</main>
        </div>
      </div>
      <AccountPanel />
      <Overlays />
    </ThemeProvider>
  );
}
