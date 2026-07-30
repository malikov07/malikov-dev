import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import LoginForm from "@/components/admin/LoginForm";
import { isAuthed } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toAdminProject } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAuthed())) {
    return <LoginForm />;
  }

  const rows = await prisma.projectRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  return <AdminDashboard projects={rows.map(toAdminProject)} />;
}
