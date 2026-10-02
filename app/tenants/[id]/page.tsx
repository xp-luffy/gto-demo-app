import Link from "next/link";
import { notFound } from "next/navigation";
import { addDailySale, deleteDailySale, deleteTenant, editDailySale } from "@/app/actions";
import { AppShell, PageHeading } from "@/app/_components/app-shell";
import { ConfirmButton } from "@/app/_components/confirm-button";
import { getTenant, getTenantBilling, getTenantSales } from "@/lib/data/queries";
import { currentMonthLabel, dateLabel, money } from "@/lib/format";

export default async function TenantDetailPage({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{logged?:string;deleted?:string;saved?:string;error?:string;date?:string;amount?:string}> }) {
  const [{id}, query] = await Promise.all([params, searchParams]);
  const [tenant, sales, billing] = await Promise.all([getTenant(id),getTenantSales(id),getTenantBilling(id)]);
  if(!tenant)notFound();
  const month = new Date().toISOString().slice(0,7)+"-01";
  const activePeriod = billing.find((period)=>period.period_month===month);
  const currentSales = activePeriod ? Number(activePeriod.total_sales) : sales.filter((sale)=>sale.sale_date.slice(0,7)===month.slice(0,7)).reduce((sum,sale)=>sum+Number(sale.amount),0);
  const gtoRent = currentSales*Number(tenant.gto_rate)/100;
  const finalRent = Math.max(gtoRent,Number(tenant.min_monthly_rent));
  const chartSales = [...sales].slice(0,14).reverse();
  const maxSale = Math.max(...chartSales.map((sale)=>Number(sale.amount)),1);
  const today = new Date().toISOString().slice(0,10);
  return <AppShell active="/tenants">
    <PageHeading eyebrow="Tenant profile · " title={tenant.name} subtitle={(tenant.category??"Uncategorised")+" · "+(tenant.unit_location??"Location not set")} action={<><Link className="button button-quiet" href={"/tenants/"+id+"/edit"}>Edit details</Link><Link className="button button-primary" href="/tenants">All tenants <span>↗</span></Link></>}/>
    {query.logged&&<div className="toast">Daily sales saved. Monthly billing and portfolio performance have been recalculated.</div>}
    {query.saved&&<div className="toast">Tenant details saved.</div>}
    {query.deleted&&<div className="toast">Sales entry deleted and billing recalculated.</div>}
    {query.error&&<div className="notice">{query.error}</div>}
    <section className="kpi-grid">
      <article className="kpi-card"><div className="kpi-top">{currentMonthLabel()} sales<span className="kpi-icon">↗</span></div><div className="kpi-value">{money(currentSales)}</div><div className="kpi-foot">{sales.filter((sale)=>sale.sale_date.slice(0,7)===month.slice(0,7)).length} daily entries this month</div></article>
      <article className="kpi-card"><div className="kpi-top">GTO rent<span className="kpi-icon">％</span></div><div className="kpi-value">{money(gtoRent)}</div><div className="kpi-foot">{Number(tenant.gto_rate).toFixed(1)}% of recorded sales</div></article>
      <article className="kpi-card"><div className="kpi-top">Minimum rent<span className="kpi-icon">＄</span></div><div className="kpi-value">{money(tenant.min_monthly_rent)}</div><div className="kpi-foot">Lease floor per month</div></article>
      <article className="kpi-card"><div className="kpi-top">Current bill<span className="kpi-icon">▤</span></div><div className="kpi-value">{money(finalRent)}</div><div className="kpi-foot">{gtoRent>=Number(tenant.min_monthly_rent)?"GTO rent applies":"Minimum rent applies"} · {currentMonthLabel()}</div></article>
    </section>
    <div className="two-column">
      <div>
        <section className="panel sale-form"><h3>Log daily sales</h3><form action={addDailySale}><input type="hidden" name="tenant_id" value={tenant.id}/><div className="sale-form-grid">
          <label className="field">Sale date<input required type="date" name="sale_date" defaultValue={query.date??today}/></label>
          <label className="field">Amount (SGD)<input required type="number" name="amount" min="0" step="0.01" placeholder="0.00" defaultValue={query.amount}/></label>
          <label className="field full-field">Notes <input name="notes" placeholder="Optional note for this sales entry"/></label>
          <div className="full-field" style={{display:"flex",justifyContent:"flex-end"}}><button className="button button-primary" type="submit">Save sales entry <span>↗</span></button></div>
        </div></form></section>
        <section className="panel section-spacer">
          <div className="panel-header"><div><div className="panel-title">Sales history</div><div className="panel-subtitle">Daily entries · latest first</div></div><span className="category-pill">{sales.length} records</span></div>
          {sales.length ? <div className="table-wrap"><table className="sales-table"><thead><tr><th>Date</th><th>Daily sales</th><th>Notes</th><th></th></tr></thead><tbody>{sales.map((sale)=><tr key={sale.id}><td>{dateLabel(sale.sale_date)}</td><td className="money-cell">{money(sale.amount)}</td><td className="location-cell">{sale.notes??"—"}</td><td><div className="sales-actions"><details className="edit-sale"><summary>Edit</summary><form action={editDailySale}><input type="hidden" name="id" value={sale.id}/><input type="hidden" name="tenant_id" value={tenant.id}/><input type="hidden" name="sale_date" value={sale.sale_date}/><label>Amount<input required type="number" min="0" step="any" name="amount" defaultValue={sale.amount}/></label><label>Notes<input name="notes" defaultValue={sale.notes??""}/></label><button className="button button-primary button-small" type="submit">Save entry</button></form></details><form action={deleteDailySale}><input type="hidden" name="id" value={sale.id}/><input type="hidden" name="tenant_id" value={tenant.id}/><input type="hidden" name="sale_date" value={sale.sale_date}/><ConfirmButton question={"Delete the sales entry from "+sale.sale_date+"?"}>Delete</ConfirmButton></form></div></td></tr>)}</tbody></table></div>:<div className="empty-state"><strong>No sales logged</strong>Log today's sales to update billing for this tenant.</div>}
        </section>
        <section className="panel section-spacer"><div className="panel-header"><div><div className="panel-title">Recent daily sales</div><div className="panel-subtitle">Last {chartSales.length} recorded days</div></div></div>
          {chartSales.length?<div style={{display:"flex",alignItems:"end",gap:8,height:91,padding:"6px 18px 15px"}}>{chartSales.map((sale)=><div title={dateLabel(sale.sale_date)+": "+money(sale.amount)} key={sale.id} style={{height:Math.max(7,Number(sale.amount)/maxSale*64),flex:1,borderRadius:"3px 3px 0 0",background:"#78a58a"}}/>)}</div>:<div className="empty-state">A sales trend appears once you log entries.</div>}
        </section>
      </div>
      <aside>
        <section className="panel billing-card"><h3>Monthly billing</h3><div className="billing-month">{currentMonthLabel()} · {activePeriod?.status??"Open"}</div><div className="billing-rule"/>
          <div className="billing-line"><span>Total reported sales</span><strong>{money(currentSales)}</strong></div><div className="billing-line"><span>GTO rate ({Number(tenant.gto_rate).toFixed(1)}%)</span><strong>{money(gtoRent)}</strong></div><div className="billing-line"><span>Minimum monthly rent</span><strong>{money(tenant.min_monthly_rent)}</strong></div><div className="billing-total"><span>Current bill</span><strong>{money(finalRent)}</strong></div>
          <p className="small-label" style={{lineHeight:1.5,margin:"9px 0 0"}}>Final rent is the greater of GTO rent and minimum rent.</p>
        </section>
        <section className="panel lease-card section-spacer"><h3>Lease terms</h3><div className="lease-grid"><div className="lease-field"><small>LEASE START</small><strong>{tenant.lease_start?dateLabel(tenant.lease_start):"—"}</strong></div><div className="lease-field"><small>LEASE END</small><strong>{tenant.lease_end?dateLabel(tenant.lease_end):"—"}</strong></div><div className="lease-field"><small>GTO RATE</small><strong>{Number(tenant.gto_rate).toFixed(1)}%</strong></div><div className="lease-field"><small>MINIMUM RENT</small><strong>{money(tenant.min_monthly_rent)}</strong></div></div><div className="form-footer" style={{justifyContent:"space-between"}}><span className="small-label">Tenant and sales records</span><form action={deleteTenant}><input type="hidden" name="id" value={tenant.id}/><ConfirmButton question={"Delete "+tenant.name+" and all associated sales?"} className="button button-danger button-small">Delete tenant</ConfirmButton></form></div></section>
        <div className="callout">Sales entries are recorded once per tenant per day. If a date was entered incorrectly, delete that entry and submit the correct amount.</div>
      </aside>
    </div>
  </AppShell>;
}
