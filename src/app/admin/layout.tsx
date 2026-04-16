import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminFromRequest } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";
import { NextRequest } from "next/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Construct a pseudo NextRequest to use our helper
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  // Create a minimal req object with headers
  const req = new NextRequest(new URL(`${protocol}://${host}/admin`), {
    headers: headersList,
  });

  const admin = await getAdminFromRequest(req);

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <AdminNav username={admin.username} role={admin.role} />
      <main className="flex-1 overflow-auto p-8 relative">
         <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
         <div className="relative z-10 max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
}
