"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Globe2, MapPinned, Landmark, ScrollText, LayoutDashboard, LogOut } from "lucide-react";
import { AuthGuard } from "./AuthGuard";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/world", label: "World Settings", Icon: Globe2 },
  { href: "/admin/locations", label: "Locations", Icon: MapPinned },
  { href: "/admin/civilizations", label: "Civilizations", Icon: Landmark },
  { href: "/admin/events", label: "Events", Icon: ScrollText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    if (isFirebaseConfigured && auth) await signOut(auth);
    router.push("/");
  }

  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-dvh max-w-7xl gap-6 px-4 pb-16 pt-24 sm:px-6">
        <aside className="hidden w-56 shrink-0 sm:block">
          <nav className="sticky top-24 flex flex-col gap-1">
            {NAV.map(({ href, label, Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gold-500/15 text-gold-300"
                      : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-500 transition-colors hover:bg-white/5 hover:text-stone-300"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AuthGuard>
  );
}
