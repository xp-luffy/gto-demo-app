import { AppShell, PageHeading } from "@/app/_components/app-shell";
import { TenantForm } from "@/app/_components/tenant-form";

export default function NewTenantPage() {
  return <AppShell active="/tenants"><PageHeading eyebrow="Portfolio directory" title="Add a tenant" subtitle="Set the lease terms used to calculate monthly turnover rent."/><TenantForm/></AppShell>;
}
