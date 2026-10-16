import { NavLink } from "react-router-dom";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBriefcase,
  FiChevronsLeft,
  FiChevronsRight,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiShield,
  FiTruck,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

type SidebarItem = {
  to: string;
  label: string;
  icon: IconType;
};

const navItems: SidebarItem[] = [
  { to: "/Dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/Users", label: "Users", icon: FiUsers },
  { to: "/Drivers", label: "Drivers", icon: FiUserCheck },
  { to: "/Companies", label: "Companies", icon: FiBriefcase },
  { to: "/Requests", label: "Requests", icon: FiPackage },
  { to: "/Trips", label: "Trips", icon: FiTruck },
  { to: "/Payments", label: "Payments", icon: FiCreditCard },
  { to: "/Roles", label: "Roles & Permissions", icon: FiShield },
  { to: "/AuditLogs", label: "Audit Logs", icon: FiFileText },
];

function SidebarLink({ item, className = "sidebar-link" }: { item: SidebarItem; className?: string }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} end className={className} title={item.label}>
      <span className="sidebar-icon"><Icon aria-hidden="true" /></span>
      <b>{item.label}</b>
    </NavLink>
  );
}

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar${collapsed ? " collapsed" : ""}`}>

      <div className="sidebar-logo">
        <img src="/logosidebar.png" alt="Workhorse" />
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiChevronsRight aria-hidden="true" /> : <FiChevronsLeft aria-hidden="true" />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => <SidebarLink key={item.to} item={item} />)}
      </nav>

      <div className="sidebar-bottom">
        <SidebarLink item={{ to: "/Settings", label: "Settings", icon: FiSettings }} />
        <SidebarLink item={{ to: "/", label: "Logout", icon: FiLogOut }} className="sidebar-link logout" />
      </div>

    </aside>
  );
}

export default AdminSidebar;
