import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Proxy Next.js (ex-middleware) : rafraîchit la session et garde les routes. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf : fichiers statiques Next, images, favicon.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
