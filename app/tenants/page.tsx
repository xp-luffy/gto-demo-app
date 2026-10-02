import Link from "next/link";
import { AppShell, PageHeading } from "@/app/_components/app-shell";
import { deleteTenant } from "@/app/actions";
import { ConfirmButton } from "@/app/_components/confirm-button";
import { getTenants } from "@/lib/data/queries";
import { money } from "@/lib/format";

export default async function TenantsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const [tenants, params] = await Promise.all([getTenants(), searchParams]);
  return <AppShell active="/tenants">
    <PageHeading eyebrow="Portfolio directory" title="Tenants" subtitle="Manage lease terms and keep daily turnover current." action={<Link className="button button-primary" href="/tenants/new">＋ Add tenant</Link>} />
    {params.deleted && <div className="notice">Tenant removed from your portfolio.</div>}
    <section className="panel"><div className="panel-header"><div><div className="panel-title">All tenants</div><div className="panel-subtitle">{tenants.length} tenant{tenants.length===1?"":"s"} · Sales tracking and lease details</div></div></div>
      {tenants.length ? <div className="table-wrap"><table><thead><tr><th>Tenant</th><th>Unit / location</th><th>GTO rate</th><th>Minimum rent</th><th>Lease end</th><th></th></tr></thead><tbody>{tenants.map(tenant=><tr key={tenant.id}>
        <td><Link className="tenant-cell" href={"/tenants/"+tenant.id}><span className="tenant-badge">{tenant.name.slice(0,2).toUpperCase()}</span><span><span className="tenant-name">{tenant.name}</span><span className="tenant-meta">{tenant.category??"Uncategorised"}</span></span></Link></td>
        <td className="location-cell">{tenant.unit_location??"—"}</td><td>{Number(tenant.gto_rate).toFixed(1)}%</td><td className="money-cell">{money(tenant.min_monthly_rent)}</td><td className="location-cell">{tenant.lease_end??"—"}</td>
        <td><div style={{display:"flex",gap:9,alignItems:"center"}}><Link className="text-link" href={"/tenants/"+tenant.id+"/edit"}>Edit</Link><form action={deleteTenant}><input type="hidden" name="id" value={tenant.id}/><ConfirmButton question={"Delete "+tenant.name+" and all associated sales?"}>Delete</ConfirmButton></form></div></td>
      </tr>)}</tbody></table></div>:<div className="empty-state"><strong>No tenants yet</strong>Add your first tenant to begin tracking the portfolio.<div style={{marginTop:14}}><Link className="button button-primary" href="/tenants/new">Add your first tenant</Link></div></div>}
    </section>
  </AppShell>;
}
