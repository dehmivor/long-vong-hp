const stats = [
  { label: "Verified shops", value: "128", delta: "+12 this week" },
  { label: "Pending reviews", value: "24", delta: "Needs moderation" },
  { label: "Active quests", value: "7", delta: "2 ending soon" },
  { label: "Check-ins today", value: "342", delta: "+18% vs yesterday" },
];

const shops = [
  { name: "Banh da cua Ba Cu", district: "Hong Bang", status: "Open", score: "4.8" },
  { name: "Nem cua be Co Lan", district: "Ngo Quyen", status: "Open", score: "4.6" },
  { name: "Hai san Do Son", district: "Do Son", status: "Verification", score: "4.7" },
  { name: "Cafe Hoang Dieu Vintage", district: "Hong Bang", status: "Draft", score: "4.4" },
];

export default function AdminDashboard() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Long Vong HP</p>
          <h1>Admin</h1>
        </div>
        <nav>
          {["Overview", "Shops", "Quests", "Reviews", "Content", "Partners"].map((item) => (
            <a key={item} className={item === "Overview" ? "active" : ""} href="#">
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations</p>
            <h2>Hai Phong travel and food control room</h2>
          </div>
          <button type="button">Add shop</button>
        </header>

        <div className="stats">
          {stats.map((stat) => (
            <article key={stat.label} className="stat">
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <span>{stat.delta}</span>
            </article>
          ))}
        </div>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Shop pipeline</p>
              <h3>Priority places</h3>
            </div>
            <span>Supabase-ready table</span>
          </div>
          <div className="table">
            <div className="row heading">
              <span>Shop</span>
              <span>District</span>
              <span>Status</span>
              <span>Rating</span>
            </div>
            {shops.map((shop) => (
              <div key={shop.name} className="row">
                <span>{shop.name}</span>
                <span>{shop.district}</span>
                <span>{shop.status}</span>
                <span>{shop.score}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid">
          <article className="panel compact">
            <p className="eyebrow">Next action</p>
            <h3>Connect Supabase</h3>
            <p>
              Use the shared api-client with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
            </p>
          </article>
          <article className="panel compact">
            <p className="eyebrow">Deployment</p>
            <h3>Vercel project</h3>
            <p>Set Root Directory to apps/admin-dashboard and keep the same GitHub repository.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
