import axios from "axios";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/api";
import { loadKakaoMapsSdk } from "../lib/kakaoMaps";
import { normalizeSeoulDistrict, SEOUL_DISTRICTS } from "../lib/seoulDistricts";
import AppNav from "../components/AppNav";

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
  latitude: number | null;
  longitude: number | null;
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

function getCoordinateKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

function formatWonFromTenThousandUnit(value: number) {
  return `₩${(value * 10000).toLocaleString()}`;
}

function getOffsetMarkerPosition(
  kakao: any,
  latitude: number,
  longitude: number,
  duplicateIndex: number,
  duplicateCount: number
) {
  if (duplicateCount <= 1) {
    return new kakao.maps.LatLng(latitude, longitude);
  }

  const angle = (Math.PI * 2 * duplicateIndex) / duplicateCount;
  const latRadius = 0.00045;
  const lngRadius = latRadius / Math.max(Math.cos((latitude * Math.PI) / 180), 0.35);

  return new kakao.maps.LatLng(
    latitude + Math.sin(angle) * latRadius,
    longitude + Math.cos(angle) * lngRadius
  );
}

export default function Browse() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [maxBudget, setMaxBudget] = useState("");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = async () => {
  try {
    setError("");
    const { data } = await axios.get(`${API}/posts`);
    // Map DB fields to UI fields
    const mapped: Post[] = data.map((p: any) => ({
      id: p.id,
      postType: p.post_type === "room_available" ? "Room Available"
        : p.post_type === "looking_for_room" ? "Looking for Room"
        : p.post_type === "sublet" ? "Short-term Rental"
        : "Contract Transfer",
      title: p.description_en?.slice(0, 60) || "Room Post",
      region: normalizeSeoulDistrict(p.district, p.full_address),
      address: p.full_address || "",
      rent: p.monthly_rent || 0,
      deposit: p.deposit || 0,
      moveInDate: p.available_from || "",
      genderPreference: p.gender_preference || "No Preference",
      lifestyleTags: p.lifestyle_tags || [],
      descriptionKo: p.description_ko || "",
      descriptionEn: p.description_en || "",
      photos: normalizePhotos(p.photos),
      writerName: p.users?.name || "Student",
      university: p.users?.university || "",
      verified: p.users?.is_verified || false,
      createdAt: new Date(p.created_at).toLocaleDateString(),
      status: p.status || "active",
      latitude: p.latitude || null,
      longitude: p.longitude || null,
    }));

    setPosts(mapped);
  } catch (err: any) {
    console.error("Failed to fetch posts", err);
    setError(getRequestErrorMessage(err, "Failed to load posts from database."));
    setPosts([]);
  }
};
  const regions = useMemo(() => {
    const districtNames = SEOUL_DISTRICTS.map((district) => district.name);
    return ["All", ...districtNames];
  }, []);
  const selectedDistrict = useMemo(
    () => SEOUL_DISTRICTS.find((district) => district.name === normalizeSeoulDistrict(regionFilter)),
    [regionFilter]
  );

  const filteredPosts = posts.filter((post) => {
    const matchStatus = post.status === "active";
    const matchType = typeFilter === "All" || post.postType === typeFilter;
    const matchRegion = regionFilter === "All" || post.region === regionFilter;
    const matchBudget =
      maxBudget.trim() === "" || post.rent * 10000 <= Number(maxBudget);

    return matchStatus && matchType && matchRegion && matchBudget;
  });

  useEffect(() => {
    const container = document.getElementById("kakao-map");
    if (!container) return;
    let isCancelled = false;

    loadKakaoMapsSdk()
      .then((kakao) => {
        if (isCancelled) return;

        setMapError("");
        container.innerHTML = "";

        const map = new kakao.maps.Map(container, {
          center: new kakao.maps.LatLng(37.5665, 126.9780),
          level: 8,
        });

        const postsToShow = filteredPosts;
        const bounds = new kakao.maps.LatLngBounds();
        const duplicateCounts = new Map<string, number>();
        let hasMarker = false;

        (window as any).navigateToPost = (postId: string) => {
          navigate(`/post-detail/${postId}`);
        };

        postsToShow.forEach((post: Post) => {
          if (post.latitude === null || post.longitude === null) return;

          const key = getCoordinateKey(post.latitude, post.longitude);
          duplicateCounts.set(key, (duplicateCounts.get(key) || 0) + 1);
        });

        const duplicateIndexes = new Map<string, number>();

        postsToShow.forEach((post: Post) => {
          if (post.latitude === null || post.longitude === null) return;

          const key = getCoordinateKey(post.latitude, post.longitude);
          const duplicateIndex = duplicateIndexes.get(key) || 0;
          const duplicateCount = duplicateCounts.get(key) || 1;

          duplicateIndexes.set(key, duplicateIndex + 1);
          hasMarker = true;
          const position = getOffsetMarkerPosition(
            kakao,
            post.latitude,
            post.longitude,
            duplicateIndex,
            duplicateCount
          );
          bounds.extend(position);

          const marker = new kakao.maps.Marker({ position, map });

          const content = `<div
    onclick="window.navigateToPost('${post.id}')"
    style="padding:12px 14px;font-family:Georgia,serif;min-width:200px;cursor:pointer;">
    <p style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin:0 0 6px;">
      ${post.postType}
    </p>
    <p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">
      ${post.region}
    </p>
    <p style="font-size:13px;color:#888;margin:0 0 8px;">
      ${formatWonFromTenThousandUnit(post.rent)} / month
    </p>
    <p style="font-size:11px;color:#2E86AB;margin:0;text-decoration:underline;">
      View Post →
    </p>
  </div>`;

          const infoWindow = new kakao.maps.InfoWindow({
            content,
            removable: true,
          });

          kakao.maps.event.addListener(marker, "click", () => {
            infoWindow.open(map, marker);
          });
        });

        if (selectedDistrict) {
          map.setLevel(6);
          map.setCenter(new kakao.maps.LatLng(selectedDistrict.lat, selectedDistrict.lng));
        } else if (hasMarker) {
          map.setBounds(bounds);
        }
      })
      .catch((sdkError: Error) => {
        if (isCancelled) return;

        console.error("Failed to initialize Kakao Map", sdkError);
        setMapError(
          "Map could not be loaded in this browser right now. Please refresh once or check Safari content blockers."
        );
      });

    return () => {
      isCancelled = true;
    };
  }, [filteredPosts, navigate, selectedDistrict]);




  return (
    <div style={styles.page} className="roomies-responsive">
      <div style={styles.bgAccent} />

      <AppNav
        activeKey="browse"
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

        {error && <div style={styles.errorBox}>{error}</div>}

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

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Max Rent (KRW)</label>
            <input
              aria-label="Max Rent"
              style={styles.input}
              type="number"
              min="0"
              placeholder="e.g. 500000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </div>
        </section>

        {mapError && <div style={styles.errorBox}>{mapError}</div>}

        {/* Map */}
          <div
            id="kakao-map"
            style={{
              width: "100%",
              height: "450px",
              marginBottom: 28,
              borderRadius: 2,
              boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
            }}
          />

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
                      <p style={styles.infoValue}>{formatWonFromTenThousandUnit(post.rent)}</p>
                    </div>

                    <div>
                      <p style={styles.infoLabel}>Deposit</p>
                      <p style={styles.infoValue}>{formatWonFromTenThousandUnit(post.deposit)}</p>
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
