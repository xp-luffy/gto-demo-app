import Link from "next/link";
import { AppShell, PageHeading } from "@/app/_components/app-shell";
import { Sparkline } from "@/app/_components/sparkline";
import { getPortfolioPerformance } from "@/lib/data/queries";
import { currentMonthLabel, money } from "@/lib/format";

export default async function Home() {
  const portfolio = await getPortfolioPerformance();
  const currentSales = portfolio.reduce((sum, tenant) => sum + tenant.currentSales, 0);
  const monthlyRent = portfolio.reduce((sum, tenant) => sum + Math.max(tenant.currentSales * tenant.gto_rate / 100, tenant.min_monthly_rent), 0);
  const growing = portfolio.filter((tenant) => tenant.score !== null && tenant.score > 100).length;
  const declining = portfolio.filter((tenant) => tenant.score !== null && tenant.score < 70).length;
  return (
    <AppShell active="/">
      <PageHeading eyebrow={"Portfolio overview · " + currentMonthLabel()} title="Good morning, Alex" subtitle="A clear view of tenant performance across Harbour Point." action={<Link className="button button-primary" href="/tenants/new">＋ Add tenant</Link>} />
      <section className="kpi-grid">
        <article className="kpi-card"><div className="kpi-top">Portfolio sales <span className="kpi-icon">↗</span></div><div className="kpi-value">{money(currentSales)}</div><div className="kpi-foot">Sales recorded this month</div></article>
        <article className="kpi-card"><div className="kpi-top">Projected GTO rent <span className="kpi-icon">＄</span></div><div className="kpi-value">{money(monthlyRent)}</div><div className="kpi-foot">GTO or minimum rent, whichever is higher</div></article>
        <article className="kpi-card"><div className="kpi-top">Active tenants <span className="kpi-icon">▦</span></div><div className="kpi-value">{portfolio.length.toString().padStart(2, "0")}</div><div className="kpi-foot">Across one managed property</div></article>
        <article className="kpi-card"><div className="kpi-top">Needs attention <span className="kpi-icon">!</span></div><div className="kpi-value">{declining.toString().padStart(2, "0")} <span style={{fontSize:12,color:"#829087"}}>of {portfolio.length.toString().padStart(2, "0")}</span></div><div className="kpi-foot">Sales below 70% of last month</div></article>
      </section>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-header"><div><div className="panel-title">Tenant performance</div><div className="panel-subtitle">Ranked by current month sales vs last month</div></div><Link className="text-link" href="/tenants">All tenants ↗</Link></div>
          {portfolio.length ? <div className="table-wrap"><table><thead><tr><th>Tenant</th><th>Location</th><th>This month</th><th>Trend</th><th>Performance</th></tr></thead><tbody>{portfolio.map((tenant,index)=>(
            <tr key={tenant.id}><td><Link className="tenant-cell" href={"/tenants/"+tenant.id}><span className="tenant-badge">{tenant.name.slice(0,2).toUpperCase()}</span><span><span className="tenant-name">{tenant.name}</span><span className="tenant-meta">{tenant.category ?? "Uncategorised"}</span></span></Link></td><td className="location-cell">{tenant.unit_location ?? "—"}</td><td className="money-cell">{money(tenant.currentSales)}</td><td className="trend-cell"><Sparkline values={tenant.trend} /></td><td><span className={tenant.score === null ? "score-pill neutral" : tenant.score < 70 ? "score-pill declining" : "score-pill"}>{tenant.score === null ? "New" : Math.round(tenant.score) + "% · " + (tenant.score < 70 ? "Declining" : tenant.score <= 100 ? "Stable" : "Growing")}</span></td></tr>
          ))}</tbody></table></div> : <div className="empty-state"><strong>No tenants yet</strong>Add your first tenant to start tracking sales and GTO billing.<div style={{marginTop:14}}><Link className="button button-primary" href="/tenants/new">Add your first tenant</Link></div></div>}
        </section>
        <aside className="panel ranking-panel"><div className="panel-header"><div><div className="panel-title">Top performers</div><div className="panel-subtitle">Sales growth this month</div></div><span className="kpi-icon">✦</span></div>
          {portfolio.slice(0,4).map((tenant,index)=><Link className="ranking-item" href={"/tenants/"+tenant.id} key={tenant.id}><span className="rank-number">0{index+1}</span><span className="rank-copy"><strong>{tenant.name}</strong><small>{tenant.category ?? "Tenant"}</small></span><span className="rank-score">{tenant.score === null ? "New" : Math.round(tenant.score) + "%"}</span></Link>)}
          {portfolio.length===0&&<div className="empty-state">Your tenant rankings will appear here.</div>}
          <div className="insight-card"><div className="insight-label">Portfolio pulse</div><p>{declining ? declining + " tenant" + (declining===1 ? " is" : "s are") + " below the 70% sales threshold." : growing ? growing + " tenant" + (growing===1 ? " is" : "s are") + " growing against last month." : "Sales trends update automatically as you log daily turnover."}</p></div>
        </aside>
      </div>
      <div className="footer-note">Numbers update when sales are logged · Currency shown in SGD</div>
    </AppShell>
  );
}
