import Link from "next/link";
import { AppShell, PageHeading } from "@/app/_components/app-shell";
import { getBillingOverview } from "@/lib/data/queries";
import { currentMonthLabel, money } from "@/lib/format";

export default async function BillingPage() {
  const rows=await getBillingOverview();
  const total=rows.reduce((sum,row)=>sum+Number(row.period?.final_rent??Math.max(row.tenant.min_monthly_rent,0)),0);
  return <AppShell active="/billing">
    <PageHeading eyebrow={"Billing overview · "+currentMonthLabel()} title="Monthly billing" subtitle="Current GTO rent and minimum rent across your tenant portfolio."/>
    <section className="kpi-grid"><article className="kpi-card"><div className="kpi-top">Portfolio billing<span className="kpi-icon">＄</span></div><div className="kpi-value">{money(total)}</div><div className="kpi-foot">Current month · all tenants</div></article><article className="kpi-card"><div className="kpi-top">Billing periods<span className="kpi-icon">▤</span></div><div className="kpi-value">{rows.length.toString().padStart(2,"0")}</div><div className="kpi-foot">One active period per tenant</div></article><article className="kpi-card"><div className="kpi-top">Open periods<span className="kpi-icon">◷</span></div><div className="kpi-value">{rows.filter((row)=>!row.period||row.period.status==="open").length.toString().padStart(2,"0")}</div><div className="kpi-foot">Ready for monthly review</div></article><article className="kpi-card"><div className="kpi-top">Calculation<span className="kpi-icon">⌁</span></div><div className="kpi-value" style={{fontSize:17}}>GTO or minimum</div><div className="kpi-foot">Higher amount becomes final rent</div></article></section>
    <section className="panel"><div className="panel-header"><div><div className="panel-title">Tenant billing periods</div><div className="panel-subtitle">Ranked by final monthly rent</div></div></div>
      {rows.length?<div className="table-wrap"><table><thead><tr><th>Tenant</th><th>Sales this month</th><th>GTO rate</th><th>GTO rent</th><th>Minimum rent</th><th>Final rent</th><th>Status</th></tr></thead><tbody>{rows.map(({tenant,period})=>{const totalSales=Number(period?.total_sales??0);const gtoRent=Number(period?.gto_rent??0);const finalRent=Number(period?.final_rent??Math.max(gtoRent,tenant.min_monthly_rent));return <tr key={tenant.id}><td><Link className="tenant-cell" href={"/tenants/"+tenant.id}><span className="tenant-badge">{tenant.name.slice(0,2).toUpperCase()}</span><span><span className="tenant-name">{tenant.name}</span><span className="tenant-meta">{tenant.unit_location??tenant.category??"Tenant"}</span></span></Link></td><td>{money(totalSales)}</td><td>{Number(tenant.gto_rate).toFixed(1)}%</td><td>{money(gtoRent)}</td><td>{money(tenant.min_monthly_rent)}</td><td className="money-cell">{money(finalRent)}</td><td><span className="status-pill">{period?.status??"open"}</span></td></tr>})}</tbody></table></div>:<div className="empty-state"><strong>No billing periods yet</strong>Add tenants to see their monthly turnover rent here.<div style={{marginTop:14}}><Link className="button button-primary" href="/tenants/new">Add a tenant</Link></div></div>}
    </section>
    <div className="callout">Billing periods recalculate when daily sales are added or removed. Minimum rent is used when GTO rent is lower.</div>
  </AppShell>;
}
