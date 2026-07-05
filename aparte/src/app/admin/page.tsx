import { getCurrentUser } from "@/features/auth/current-user";
import { AdminConsole } from "@/features/admin/components/admin-console";

export default async function AdminPage() {
  const user = await getCurrentUser();
  return <AdminConsole excludeAccountId={user?.account.id ?? ""} />;
}
