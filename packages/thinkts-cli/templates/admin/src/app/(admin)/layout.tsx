import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession, initialsFromUser } from "@/lib/saas-admin/session";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: Props) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const sidebarDefaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const user = {
    name: session.user.name || session.user.username || "Admin",
    email: session.user.email || `${session.user.username || "admin"}@demo.local`,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(initialsFromUser(session.user))}`,
  };

  return (
    <div className="border-grid flex flex-1 flex-col">
      <SidebarProvider defaultOpen={sidebarDefaultOpen}>
        <AppSidebar
          user={user}
          teamName={session.user.tenant_code || "SaaS Demo"}
          teamPlan={`${session.user.role} · tenant ${session.user.tenant_id}`}
        />
        <div
          id="content"
          className={cn(
            "flex h-full w-full min-w-0 flex-col",
            "has-[div[data-layout=fixed]]:h-svh",
            "group-data-[scroll-locked=1]/body:h-full",
            "has-[data-layout=fixed]:group-data-[scroll-locked=1]/body:h-svh",
          )}
        >
          <Header />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
