import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview", icon: "◫" },
  { href: "/tenants", label: "Tenants", icon: "▦" },
  { href: "/billing", label: "Billing", icon: "＄" },
];

export function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Groundtruth home">
          <span className="brand-mark">G</span>
          <span><strong>groundtruth</strong><small>PROPERTY OPERATIONS</small></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link className={active === item.href ? "nav-link active" : "nav-link"} href={item.href} key={item.href}>
              <span className="nav-icon">{item.icon}</span>{item.label}
              {active === item.href && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="building-card">
            <span className="building-icon">⌂</span>
            <span><strong>Harbour Point</strong><small>ONE PROPERTY · SINGAPORE</small></span>
            <span className="more-dots">···</span>
          </div>
          <div className="user-row"><span className="avatar">AM</span><span><strong>Alex Morgan</strong><small>Portfolio manager</small></span><span className="more-dots">⌄</span></div>
        </div>
      </aside>
      <main className="main-area">
        <div className="topbar"><span>Portfolio <span className="crumb-sep">/</span> {active === "/" ? "Overview" : active.slice(1).replace(/^./, (letter) => letter.toUpperCase())}</span><div className="topbar-right"><span className="live-dot" /> All systems operational <span className="top-divider" /> <span className="top-date">Singapore · {new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", year: "numeric" }).format(new Date())}</span></div></div>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}
