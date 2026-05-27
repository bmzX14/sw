import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

type NavItem = {
  key: string;
  label: string;
  onClick: () => void;
  badgeCount?: number;
  tone?: "default" | "danger";
};

type AppNavProps = {
  items: NavItem[];
  activeKey?: string;
};

export default function AppNav({ items, activeKey }: AppNavProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleItemClick = (item: NavItem) => {
    item.onClick();
    setOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <p style={styles.brand}>roomies</p>

      {isMobile ? (
        <div style={styles.mobileNavWrap}>
          <button
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            style={styles.menuButton}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span style={styles.menuButtonLine} />
            <span style={styles.menuButtonLine} />
            <span style={styles.menuButtonLine} />
          </button>

          {open && (
            <div style={styles.mobileMenu}>
              {items.map((item) => {
                const active = item.key === activeKey;
                const isDanger = item.tone === "danger";

                return (
                  <button
                    key={item.key}
                    type="button"
                    style={{
                      ...styles.mobileMenuItem,
                      ...(active ? styles.mobileMenuItemActive : {}),
                      ...(isDanger ? styles.mobileMenuItemDanger : {}),
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <span>{item.label}</span>
                    {item.badgeCount && item.badgeCount > 0 ? (
                      <span style={styles.mobileMenuBadge}>{item.badgeCount}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={styles.navRight}>
          {items.map((item) => {
            const active = item.key === activeKey;
            const isDanger = item.tone === "danger";

            return (
              <button
                key={item.key}
                type="button"
                style={{
                  ...styles.navLink,
                  ...(active ? styles.navLinkActive : {}),
                  ...(isDanger ? styles.navLinkDanger : {}),
                }}
                onClick={item.onClick}
              >
                <span>{item.label}</span>
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span style={styles.navBadge}>{item.badgeCount}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}

const styles: Record<string, CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #ebe9e4",
    background: "#fafaf8",
    position: "relative",
    zIndex: 30,
  },
  brand: {
    fontSize: 13,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#888",
    margin: 0,
  },
  navRight: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  navLink: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#888",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.05em",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  navLinkActive: {
    color: "#1a1a1a",
  },
  navLinkDanger: {
    color: "#c0392b",
  },
  navBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 20,
    background: "#c0392b",
    color: "#fff",
    fontSize: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
  },
  mobileNavWrap: {
    position: "relative",
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    border: "1px solid #ddd8cf",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    cursor: "pointer",
    padding: 0,
  },
  menuButtonLine: {
    width: 18,
    height: 1.5,
    background: "#1a1a1a",
    display: "block",
  },
  mobileMenu: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: 220,
    background: "#ffffff",
    border: "1px solid #ebe9e4",
    boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
    borderRadius: 16,
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  mobileMenuItem: {
    width: "100%",
    minHeight: 48,
    border: "none",
    background: "transparent",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 15,
    color: "#555",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    textAlign: "left",
  },
  mobileMenuItemActive: {
    background: "#f5f3ef",
    color: "#1a1a1a",
  },
  mobileMenuItemDanger: {
    color: "#c0392b",
  },
  mobileMenuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 22,
    background: "#c0392b",
    color: "#fff",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
  },
};
