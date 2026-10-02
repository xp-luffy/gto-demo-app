import Link from "next/link";
import { saveTenant } from "@/app/actions";
import type { Tenant } from "@/lib/data/types";

export function TenantForm({ tenant }: { tenant?: Tenant }) {
  return (
    <form action={saveTenant} className="form-card">
      {tenant && <input type="hidden" name="id" value={tenant.id} />}
      <div className="form-grid">
        <label className="field full-field">Tenant name<input required name="name" defaultValue={tenant?.name} placeholder="e.g. Cafe Aroma" /></label>
        <label className="field">Category<select name="category" defaultValue={tenant?.category ?? "F&B"}><option>F&B</option><option>Retail</option><option>Service</option><option>Other</option></select></label>
        <label className="field">Unit / location<input name="unit_location" defaultValue={tenant?.unit_location ?? ""} placeholder="e.g. Ground Floor G-12" /></label>
        <label className="field">GTO rate (%)<input required type="number" min="0" max="100" step="0.1" name="gto_rate" defaultValue={tenant?.gto_rate ?? 8} /></label>
        <label className="field">Minimum monthly rent (SGD)<input required type="number" min="0" step="0.01" name="min_monthly_rent" defaultValue={tenant?.min_monthly_rent ?? 0} /></label>
        <label className="field">Lease start<input type="date" name="lease_start" defaultValue={tenant?.lease_start ?? ""} /></label>
        <label className="field">Lease end<input type="date" name="lease_end" defaultValue={tenant?.lease_end ?? ""} /></label>
      </div>
      <div className="form-footer"><Link className="button button-quiet" href={tenant ? `/tenants/${tenant.id}` : "/tenants"}>Cancel</Link><button className="button button-primary" type="submit">{tenant ? "Save changes" : "Add tenant"}<span>↗</span></button></div>
    </form>
  );
}
