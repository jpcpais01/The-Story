import { notFound } from "next/navigation";
import { EDITABLE } from "@/config/site.config";
import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  if (!EDITABLE) notFound();

  return (
    <main className="min-h-dvh px-4">
      <LoginForm />
    </main>
  );
}
