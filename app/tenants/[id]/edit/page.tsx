import { notFound } from "next/navigation";
import { AppShell, PageHeading } from "@/app/_components/app-shell";
import { TenantForm } from "@/app/_components/tenant-form";
import { getTenant } from "@/lib/data/queries";

export default async function EditTenantPage({ params }: { params: Promise<{id:string}> }) {
  const {id}=await params;
  const tenant=await getTenant(id);
  if(!tenant)notFound();
  return <AppShell active="/tenants"><PageHeading eyebrow="Tenant record" title="Edit tenant" subtitle={tenant.name}/><TenantForm tenant={tenant}/></AppShell>;
}
