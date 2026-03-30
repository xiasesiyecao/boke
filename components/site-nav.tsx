"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "项目" },
  { href: "/blog", label: "博客" },
  { href: "/labs", label: "Labs" },
  { href: "/about", label: "关于" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="topnav">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "nav-link is-active" : "nav-link"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
