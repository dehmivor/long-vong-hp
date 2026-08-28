import Link from "next/link";

export type AdminSection = "overview" | "shops" | "quests" | "reels" | "reviews";

const links: { section: AdminSection; href: string; label: string }[] = [
  { section: "overview", href: "/", label: "Overview" },
  { section: "shops", href: "/shops", label: "Shops" },
  { section: "quests", href: "/quests", label: "Quests" },
  { section: "reels", href: "/reels", label: "Reels" },
  { section: "reviews", href: "/reviews", label: "Reviews" },
];

/** Shared sidebar so every admin page stays in sync as sections are added. */
export function AdminNav({ active }: { active: AdminSection }) {
  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Lòng Vòng HP</p>
        <h1>Admin</h1>
      </div>
      <nav>
        {links.map((link) => (
          <Link
            key={link.section}
            href={link.href}
            className={link.section === active ? "active" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
