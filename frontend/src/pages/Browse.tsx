import axios from "axios";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type PostType =
  | "Room Available"
  | "Looking for Room"
  | "Short-term Rental"
  | "Contract Transfer";

type Post = {
  id: string;
  postType: PostType;
  title: string;
  region: string;
  address: string;
  rent: number;
  deposit: number;
  moveInDate: string;
  genderPreference: string;
  lifestyleTags: string[];
  descriptionKo: string;
  descriptionEn: string;
  photos: string[];
  writerName: string;
  university: string;
  verified: boolean;
  createdAt: string;
  status: "active" | "closed";
};

const samplePosts: Post[] = [
  {
    id: "sample-1",
    postType: "Room Available",
    title: "Looking for a roommate near Myongji University",
    region: "Seodaemun-gu",
    address: "Namgajwa-dong, Seodaemun-gu, Seoul",
    rent: 45,
    deposit: 500,
    moveInDate: "2026-06-01",
    genderPreference: "Female Preferred",
    lifestyleTags: ["Non-smoker", "Quiet lifestyle", "Clean"],
    descriptionKo:
      "Looking for a roommate to share a two-room apartment near Myongji University. The place is close to campus and convenient for student life.",
    descriptionEn:
      "Looking for a roommate to share a two-room apartment near Myongji University. The place is close to campus and convenient for student life.",
    photos: [],
    writerName: "Jeong An",
    university: "Myongji University",
    verified: true,
    createdAt: "2026.05.11",
    status: "active",
  },
  {
    id: "sample-2",
    postType: "Looking for Room",
    title: "Looking for someone to share rent and deposit",
    region: "Mapo-gu",
    address: "Yeonnam-dong, Mapo-gu, Seoul",
    rent: 60,
    deposit: 1000,
    moveInDate: "2026-06-15",
    genderPreference: "No Preference",
    lifestyleTags: ["Regular routine", "No pets", "Clean"],
    descriptionKo:
      "Looking for a roommate to search for a two-room or three-room apartment together and share the deposit and monthly rent.",
    descriptionEn:
      "Looking for a roommate to search for a two-room or three-room apartment together and share the deposit and monthly rent.",
    photos: [],
    writerName: "Mya",
    university: "Myongji University",
    verified: true,
    createdAt: "2026.05.10",
    status: "active",
  },
  {
    id: "sample-3",
    postType: "Short-term Rental",
    title: "Short-term roommate wanted during vacation",
    region: "Eunpyeong-gu",
    address: "Eungam-dong, Eunpyeong-gu, Seoul",
    rent: 35,
    deposit: 0,
    moveInDate: "2026-07-01",
    genderPreference: "Female Preferred",
    lifestyleTags: ["Short-term available", "Quiet lifestyle", "Non-smoker"],
    descriptionKo:
      "Looking for a short-term roommate during vacation. This post is suitable for students who need temporary housing.",
    descriptionEn:
      "Looking for a short-term roommate during vacation. This post is suitable for students who need temporary housing.",
    photos: [],
    writerName: "Nguyen",
    university: "Myongji University",
    verified: true,
    createdAt: "2026.05.09",
    status: "active",
  },
];

export default function Browse() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [maxBudget, setMaxBudget] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = async () => {
  try {
    const { data } = await axios.get("http://localhost:8000/api/posts");
    console.log("API response:", data);
    console.log("Number of posts:", data.length);
    // Map DB fields to UI fields
    const mapped: Post[] = data.map((p: any) => ({
      id: p.id,
      postType: p.post_type === "room_available" ? "Room Available"
        : p.post_type === "looking_for_room" ? "Looking for Room"
        : p.post_type === "sublet" ? "Short-term Rental"
        : "Contract Transfer",
      title: p.description_en?.slice(0, 60) || "Room Post",
      region: p.district || "",
      address: p.full_address || "",
      rent: p.monthly_rent || 0,
      deposit: p.deposit || 0,
      moveInDate: p.available_from || "",
      genderPreference: p.gender_preference || "No Preference",
      lifestyleTags: p.lifestyle_tags || [],
      descriptionKo: p.description_ko || "",
      descriptionEn: p.description_en || "",
      photos: p.photos || [],
      writerName: p.users?.name || "Student",
      university: p.users?.university || "",
      verified: p.users?.is_verified || false,
      createdAt: new Date(p.created_at).toLocaleDateString(),
      status: p.status || "active",
    }));

    setPosts(mapped);
  } catch (err) {
    console.error("Failed to fetch posts", err);
    setPosts(samplePosts);
  }
};
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(posts.map((post) => post.region)));
    return ["All", ...uniqueRegions];
  }, [posts]);

  const filteredPosts = posts.filter((post) => {
    const matchStatus = post.status === "active";
    const matchType = typeFilter === "All" || post.postType === typeFilter;
    const matchRegion = regionFilter === "All" || post.region === regionFilter;
    const matchBudget =
      maxBudget.trim() === "" || post.rent <= Number(maxBudget);

    return matchStatus && matchType && matchRegion && matchBudget;
  });

  return (
    <div style={styles.page}>
      <div style={styles.bgAccent} />

      <nav style={styles.nav}>
        <p style={styles.brand}>roomies</p>

        <div style={styles.navRight}>
  <button style={styles.navLink} onClick={() => navigate("/browse")}>
    Browse
  </button>
  <button style={styles.navLink} onClick={() => navigate("/matches")}>
    Matches
  </button>
  <button style={styles.navLink} onClick={() => navigate("/chat")}>
    Chat
  </button>
  <button style={styles.navLink} onClick={() => navigate("/review")}>
    Review
  </button>
  <button style={styles.navLink} onClick={() => navigate("/profile")}>
    Profile
  </button>
</div>
      </nav>

      <main style={styles.container}>
        <section style={styles.header}>
          <div>
            <p style={styles.kicker}>ROOMMATE POSTS</p>
            <h1 style={styles.title}>Browse Rooms</h1>
            <p style={styles.description}>
              Find a room, roommate, short-term stay, or contract transfer that
              fits your lifestyle and budget.
            </p>
          </div>

          <button style={styles.primaryBtn} onClick={() => navigate("/post-form")}>
            Write Post
          </button>
        </section>

        <section style={styles.filterBox}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Post Type</label>
            <select
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
            <label style={styles.label}>Region</label>
            <select
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

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Max Rent</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
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
                    <img
                      src={post.photos[0]}
                      alt={post.title}
                      style={styles.photo}
                    />
                  ) : (
                    <div style={styles.emptyPhoto}>roomies</div>
                  )}
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
                      <p style={styles.infoValue}>{post.rent}0,000 KRW</p>
                    </div>

                    <div>
                      <p style={styles.infoLabel}>Deposit</p>
                      <p style={styles.infoValue}>{post.deposit}0,000 KRW</p>
                    </div>

                    <div>
                      <p style={styles.infoLabel}>Move-in</p>
                      <p style={styles.infoValue}>{post.moveInDate}</p>
                    </div>
                  </div>

                  <div style={styles.writerRow}>
                    <span>
                      {post.writerName} · {post.university}
                    </span>

                    {post.verified && (
                      <span style={styles.verified}>Verified</span>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div style={styles.emptyResult}>No posts match your filters.</div>
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
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 48px",
    borderBottom: "1px solid #ebe9e4",
    background: "#fafaf8",
    position: "relative",
    zIndex: 1,
  },
  brand: {
    fontSize: 13,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#888",
    fontFamily: "'Georgia', serif",
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
  },
  container: {
    maxWidth: 1100,
    margin: "48px auto",
    padding: "0 40px",
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
    maxWidth: 620,
    margin: 0,
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
  input: {
    border: "none",
    borderBottom: "1.5px solid #ddd",
    padding: "8px 0",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    color: "#1a1a1a",
    background: "transparent",
    outline: "none",
    width: "100%",
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
    height: 180,
    background: "#f0ede8",
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
  writerRow: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
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
  emptyResult: {
    gridColumn: "1 / -1",
    background: "#ffffff",
    boxShadow: "0 4px 40px rgba(0,0,0,0.04)",
    padding: 48,
    textAlign: "center",
    color: "#888",
    fontSize: 14,
  },
};