import { notFound } from "next/navigation";
import { EDITABLE } from "@/config/site.config";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!EDITABLE) notFound();
  return <AdminShell>{children}</AdminShell>;
}
