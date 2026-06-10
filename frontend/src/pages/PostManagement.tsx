import axios from "axios";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "../components/AppNav";
import { API } from "../lib/api";
import { normalizeSeoulDistrict, SEOUL_DISTRICTS } from "../lib/seoulDistricts";
import { supabase } from "../lib/supabase";

type ManagedPost = {
  id: string;
  postType: string;
  title: string;
  region: string;
  address: string;
  rent: number;
  deposit: number;
  moveInDate: string;
  moveOutDate: string;
  genderPreference: string;
  lifestyleTags: string[];
  descriptionEn: string;
  photos: string[];
  nearUniversity: string;
  writerName: string;
  university: string;
  verified: boolean;
  createdAt: string;
  status: "active" | "closed";
};

function normalizePhotos(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Fall back to treating the value as one URL or a comma-separated list.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRequestErrorMessage(err: any, fallback: string): string {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ERR_NETWORK") return `Cannot connect to backend at ${API}. Please start the backend server.`;
  return err?.message || fallback;
}

function formatWonFromTenThousandUnit(value: number) {
  return `₩${(value * 10000).toLocaleString()}`;
}

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || "";
}

export default function PostManagement() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<ManagedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState("");
  const [statusUpdatingPostId, setStatusUpdatingPostId] = useState("");
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const { data } = await axios.get(`${API}/posts/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped: ManagedPost[] = data.map((post: any) => ({
        id: post.id,
        postType: post.post_type === "room_available" ? "Room Available"
          : post.post_type === "looking_for_room" ? "Looking for Room"
          : post.post_type === "sublet" ? "Short-term Rental"
          : "Contract Transfer",
        title: post.description_en?.slice(0, 62) || "Room Post",
        region: normalizeSeoulDistrict(post.district, post.full_address),
        address: post.full_address || "",
        rent: post.monthly_rent || 0,
        deposit: post.deposit || 0,
        moveInDate: post.available_from || "",
        moveOutDate: post.available_until || "",
        genderPreference: post.gender_preference || "No Preference",
        lifestyleTags: post.lifestyle_tags || [],
        descriptionEn: post.description_en || "",
        photos: normalizePhotos(post.photos),
        nearUniversity: post.near_university || "",
        writerName: post.users?.name || "Student",
        university: post.users?.university || "",
        verified: post.users?.is_verified || false,
        createdAt: new Date(post.created_at).toLocaleDateString(),
        status: post.status === "closed" ? "closed" : "active",
      }));

      setPosts(mapped);
    } catch (err: any) {
      setError(getRequestErrorMessage(err, "Failed to load your posts."));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post? This action cannot be undone.")) return;

    setDeletingPostId(postId);
    setError("");

    try {
      const token = await getToken();
      await axios.delete(`${API}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err: any) {
      setError(getRequestErrorMessage(err, "Failed to delete post."));
    } finally {
      setDeletingPostId("");
    }
  };

  const handleClosePost = async (postId: string) => {
    if (!window.confirm("Mark this post as closed? It will no longer appear in Browse.")) return;

    setStatusUpdatingPostId(postId);
    setError("");

    try {
      const token = await getToken();
      await axios.patch(
        `${API}/posts/${postId}/status`,
        { status: "closed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, status: "closed" }
            : post
        )
      );
    } catch (err: any) {
      setError(getRequestErrorMessage(err, "Failed to close post."));
    } finally {
      setStatusUpdatingPostId("");
    }
  };

  const regions = useMemo(() => ["All", ...SEOUL_DISTRICTS.map((district) => district.name)], []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchType = typeFilter === "All" || post.postType === typeFilter;
      const matchStatus = statusFilter === "All" || post.status === statusFilter;
      const matchRegion = regionFilter === "All" || post.region === regionFilter;

      return matchType && matchStatus && matchRegion;
    });
  }, [posts, regionFilter, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const activePosts = posts.filter((post) => post.status === "active").length;
    const closedPosts = posts.filter((post) => post.status === "closed").length;
    const totalPhotos = posts.reduce((count, post) => count + post.photos.length, 0);

    return {
      totalPosts: posts.length,
      activePosts,
      closedPosts,
      totalPhotos,
    };
  }, [posts]);

  if (loading) {
    return <div style={styles.loadingPage}>Loading your posts...</div>;
  }

  return (
    <div style={styles.page} className="roomies-responsive">
      <div style={styles.bgAccent} />

      <AppNav
        activeKey="profile"
        items={[
          { key: "browse", label: "Browse", onClick: () => navigate("/browse") },
          { key: "matches", label: "Matches", onClick: () => navigate("/matches") },
          { key: "chat", label: "Chat", onClick: () => navigate("/chat") },
          { key: "review", label: "Review", onClick: () => navigate("/review") },
          { key: "profile", label: "Profile", onClick: () => navigate("/profile") },
        ]}
      />

      <main style={styles.container} className="roomies-mobile-container">
        <section style={styles.header} className="roomies-mobile-header roomies-mobile-stack">
          <div>
            <p style={styles.kicker}>YOUR LISTINGS</p>
            <h1 style={styles.title}>Post Management</h1>
            <p style={styles.description}>
              Review every room listing you have published, keep track of active versus closed posts,
              and jump back into each post detail page in one click.
            </p>
          </div>

          <div style={styles.headerActions} className="roomies-mobile-stack roomies-mobile-full">
            <button style={styles.secondaryBtn} onClick={() => navigate("/profile")}>
              Back to Profile
            </button>
            <button style={styles.primaryBtn} onClick={() => navigate("/post-form")}>
              Write Post
            </button>
          </div>
        </section>

        {error && <div style={styles.errorBox}>{error}</div>}

        <section style={styles.statsGrid} className="roomies-mobile-grid-1">
          <article style={styles.statCard}>
            <p style={styles.statLabel}>Total Posts</p>
            <p style={styles.statValue}>{stats.totalPosts}</p>
          </article>
          <article style={styles.statCard}>
            <p style={styles.statLabel}>Active</p>
            <p style={styles.statValue}>{stats.activePosts}</p>
          </article>
          <article style={styles.statCard}>
            <p style={styles.statLabel}>Closed</p>
            <p style={styles.statValue}>{stats.closedPosts}</p>
          </article>
          <article style={styles.statCard}>
            <p style={styles.statLabel}>Uploaded Photos</p>
            <p style={styles.statValue}>{stats.totalPhotos}</p>
          </article>
        </section>

        <section style={styles.filterBox} className="roomies-mobile-panel roomies-mobile-grid-1">
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Post Type</label>
            <select
              aria-label="Post Type"
              style={styles.select}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Room Available">Room Available</option>
              <option value="Looking for Room">Looking for Room</option>
              <option value="Short-term Rental">Short-term Rental</option>
              <option value="Contract Transfer">Contract Transfer</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Status</label>
            <select
              aria-label="Status"
              style={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Region / District</label>
            <select
              aria-label="Region / District"
              style={styles.select}
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section style={styles.postGrid}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                style={styles.card}
                onClick={() => navigate(`/post-detail/${post.id}`)}
              >
                <div style={styles.photoBox}>
                  {post.photos.length > 0 ? (
                    <img src={post.photos[0]} alt={post.title} style={styles.photo} />
                  ) : (
                    <div style={styles.emptyPhoto}>roomies</div>
                  )}
                  <div
                    style={{
                      ...styles.statusBadge,
                      ...(post.status === "active" ? styles.activeBadge : styles.closedBadge),
                    }}
                  >
                    {post.status}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.typeBadge}>{post.postType}</span>
                    <span style={styles.date}>{post.createdAt}</span>
                  </div>

                  <h2 style={styles.cardTitle}>{post.title}</h2>
                  <p style={styles.cardText}>{post.descriptionEn}</p>

                  <div style={styles.infoGrid}>
                    <div>
                      <p style={styles.infoLabel}>Region</p>
                      <p style={styles.infoValue}>{post.region}</p>
                    </div>
                    <div>
                      <p style={styles.infoLabel}>Rent</p>
                      <p style={styles.infoValue}>{formatWonFromTenThousandUnit(post.rent)}</p>
                    </div>
                    <div>
                      <p style={styles.infoLabel}>Deposit</p>
                      <p style={styles.infoValue}>{formatWonFromTenThousandUnit(post.deposit)}</p>
                    </div>
                    <div>
                      <p style={styles.infoLabel}>Move-in</p>
                      <p style={styles.infoValue}>{post.moveInDate || "—"}</p>
                    </div>
                  </div>

                  <div style={styles.metaRow}>
                    <span style={styles.metaText}>
                      {post.nearUniversity || post.university || post.writerName}
                    </span>
                    {post.verified && <span style={styles.verified}>Verified</span>}
                  </div>

                  {post.lifestyleTags.length > 0 && (
                    <div style={styles.tagsWrap}>
                      {post.lifestyleTags.slice(0, 4).map((tag) => (
                        <span key={tag} style={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={styles.cardFooter} className="roomies-mobile-stack">
                    <span style={styles.viewPost}>Open Post Detail →</span>
                    <div style={styles.cardActions} className="roomies-mobile-actions">
                      {post.status === "active" ? (
                        <button
                          type="button"
                          style={styles.closeBtn}
                          disabled={statusUpdatingPostId === post.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClosePost(post.id);
                          }}
                        >
                          {statusUpdatingPostId === post.id ? "Closing..." : "Close Post"}
                        </button>
                      ) : (
                        <span style={styles.closedText}>Closed</span>
                      )}
                      <button
                        type="button"
                        style={styles.editBtn}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/post-edit/${post.id}`);
                        }}
                      >
                        Edit Post
                      </button>
                      <button
                        type="button"
                        style={styles.deleteBtn}
                        disabled={deletingPostId === post.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                      >
                        {deletingPostId === post.id ? "Deleting..." : "Delete Post"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div style={styles.emptyResult}>
              {posts.length === 0 ? (
                <>
                  <p style={styles.emptyTitle}>You have not posted any listings yet.</p>
                  <p style={styles.emptyText}>
                    Create your first room post and it will appear here for quick management.
                  </p>
                  <button style={styles.primaryBtn} onClick={() => navigate("/post-form")}>
                    Write Your First Post
                  </button>
                </>
              ) : (
                <>
                  <p style={styles.emptyTitle}>No posts match your current filters.</p>
                  <p style={styles.emptyText}>
                    Adjust the filters above to review more of your published listings.
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fafaf8",
    fontFamily: "'Georgia', serif",
    position: "relative",
    overflowX: "hidden",
    color: "#1a1a1a",
  },
  bgAccent: {
    position: "fixed",
    top: -200,
    right: -200,
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, #e8e4dc 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafaf8",
    color: "#aaa",
    fontFamily: "'Georgia', serif",
  },
  container: {
    maxWidth: 1100,
    margin: "48px auto",
    padding: "0 40px 56px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "40px 48px",
    marginBottom: 28,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 32,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#aaa",
    margin: "0 0 16px",
  },
  title: {
    fontSize: 32,
    fontWeight: 400,
    color: "#1a1a1a",
    margin: "0 0 10px",
  },
  description: {
    fontSize: 14,
    color: "#888",
    lineHeight: 1.7,
    maxWidth: 650,
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  primaryBtn: {
    background: "#1a1a1a",
    border: "none",
    padding: "12px 26px",
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#fff",
    borderRadius: 1,
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    background: "transparent",
    border: "1.5px solid #1a1a1a",
    padding: "10px 22px",
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#1a1a1a",
    borderRadius: 1,
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
    marginBottom: 28,
  },
  statCard: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.04)",
    padding: "24px 28px",
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#aaa",
    margin: "0 0 14px",
  },
  statValue: {
    fontSize: 28,
    color: "#1a1a1a",
    margin: 0,
  },
  filterBox: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.04)",
    padding: "28px 32px",
    marginBottom: 28,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 24,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#bbb",
  },
  select: {
    border: "none",
    borderBottom: "1.5px solid #ddd",
    padding: "8px 0",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    color: "#1a1a1a",
    background: "transparent",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  },
  postGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
  },
  card: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    overflow: "hidden",
    cursor: "pointer",
  },
  photoBox: {
    height: 190,
    background: "#f0ede8",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  emptyPhoto: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    fontSize: 12,
  },
  statusBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "6px 10px",
    borderRadius: 999,
    backdropFilter: "blur(2px)",
  },
  activeBadge: {
    background: "rgba(240,250,244,0.95)",
    color: "#27ae60",
    border: "1px solid #a8e6c1",
  },
  closedBadge: {
    background: "rgba(248,242,235,0.96)",
    color: "#8b6a4b",
    border: "1px solid #e4d6c4",
  },
  cardBody: {
    padding: 24,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  typeBadge: {
    fontSize: 11,
    padding: "4px 12px",
    borderRadius: 20,
    background: "#f0ede8",
    color: "#666",
  },
  date: {
    fontSize: 12,
    color: "#aaa",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 400,
    lineHeight: 1.4,
    margin: "0 0 10px",
  },
  cardText: {
    fontSize: 13,
    color: "#888",
    lineHeight: 1.6,
    margin: 0,
    minHeight: 62,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
    padding: "20px 0",
    borderTop: "1px solid #f0ede8",
    borderBottom: "1px solid #f0ede8",
    marginTop: 20,
  },
  infoLabel: {
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#bbb",
    margin: "0 0 6px",
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    margin: 0,
  },
  metaRow: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  metaText: {
    color: "#888",
    fontSize: 12,
  },
  verified: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 20,
    background: "#f0faf4",
    color: "#27ae60",
    border: "1px solid #a8e6c1",
    whiteSpace: "nowrap",
  },
  tagsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  tag: {
    fontSize: 11,
    padding: "5px 10px",
    background: "#f6f2ec",
    color: "#777",
    borderRadius: 999,
  },
  cardFooter: {
    marginTop: 22,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  cardActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  viewPost: {
    fontSize: 12,
    color: "#1a1a1a",
    letterSpacing: "0.03em",
  },
  editBtn: {
    background: "transparent",
    border: "1.5px solid #ddd",
    padding: "10px 16px",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#666",
    borderRadius: 1,
  },
  closeBtn: {
    background: "#f7f2ea",
    border: "1.5px solid #e4d6c4",
    padding: "10px 16px",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#8b6a4b",
    borderRadius: 1,
  },
  closedText: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8b6a4b",
    padding: "0 4px",
  },
  deleteBtn: {
    background: "transparent",
    border: "1.5px solid #fecaca",
    padding: "10px 16px",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#c0392b",
    borderRadius: 1,
  },
  emptyResult: {
    gridColumn: "1 / -1",
    background: "#ffffff",
    boxShadow: "0 4px 40px rgba(0,0,0,0.04)",
    padding: 48,
    textAlign: "center",
    color: "#888",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 24,
    color: "#1a1a1a",
    margin: "0 0 10px",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    lineHeight: 1.7,
    margin: "0 0 22px",
  },
  errorBox: {
    background: "#fff5f5",
    border: "1px solid #fecaca",
    color: "#c0392b",
    padding: "12px 16px",
    borderRadius: 2,
    fontSize: 13,
    marginBottom: 20,
  },
};
