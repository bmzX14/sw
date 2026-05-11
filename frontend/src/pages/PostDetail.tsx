import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
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

export default function PostDetail() {
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState("");

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const postId = pathParts[pathParts.length - 1];

    const saved = localStorage.getItem("roomies_posts");
    const savedPosts: Post[] = saved ? JSON.parse(saved) : [];

    const allPosts = [...savedPosts, ...samplePosts];
    const found = allPosts.find((item) => item.id === postId) || null;

    setPost(found);
    setSelectedPhoto(found?.photos[0] || "");
  }, []);

  const handleInterest = () => {
    alert("Interest request has been sent.");
  };

  if (!post) {
    return (
      <div style={styles.page}>
        <div style={styles.bgAccent} />

        <main style={styles.notFoundBox}>
          <h1 style={styles.notFoundTitle}>Post Not Found</h1>
          <p style={styles.notFoundText}>
            This post may have been removed or the address is incorrect.
          </p>
          <button style={styles.mainBtn} onClick={() => navigate("/browse")}>
            Back to Browse
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgAccent} />

      <nav style={styles.nav}>
        <p style={styles.brand}>roomies</p>

        <div style={styles.navRight}>
          <button style={styles.navLink} onClick={() => navigate("/browse")}>
            Browse
          </button>
          <button style={styles.navLink} onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>
      </nav>

      <main style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate("/browse")}>
          ← Back to Browse
        </button>

        <section style={styles.photoPanel}>
          <div style={styles.mainPhotoBox}>
            {selectedPhoto ? (
              <img src={selectedPhoto} alt={post.title} style={styles.mainPhoto} />
            ) : (
              <div style={styles.emptyPhoto}>roomies</div>
            )}
          </div>

          {post.photos.length > 1 && (
            <div style={styles.thumbnailRow}>
              {post.photos.map((photo, index) => (
                <button
                  key={index}
                  style={styles.thumbnailBtn}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo}
                    alt={`thumbnail-${index + 1}`}
                    style={styles.thumbnail}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section style={styles.header}>
          <div style={styles.topLine}>
            <span style={styles.typeBadge}>{post.postType}</span>
            <span style={styles.date}>{post.createdAt}</span>
          </div>

          <h1 style={styles.title}>{post.title}</h1>

          <div style={styles.profileBox}>
            <div style={styles.avatar}>{post.writerName.slice(0, 1)}</div>

            <div>
              <p style={styles.writerName}>{post.writerName}</p>
              <p style={styles.university}>
                {post.university}
                {post.verified && (
                  <span style={styles.verified}>✓ Verified Student</span>
                )}
              </p>
            </div>
          </div>
        </section>

        <section style={styles.infoPanel}>
          <p style={styles.sectionLabel}>Room Information</p>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>Region</p>
              <p style={styles.infoValue}>{post.region}</p>
            </div>

            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>Monthly Rent</p>
              <p style={styles.infoValue}>{post.rent}0,000 KRW</p>
            </div>

            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>Deposit</p>
              <p style={styles.infoValue}>{post.deposit}0,000 KRW</p>
            </div>

            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>Move-in Date</p>
              <p style={styles.infoValue}>{post.moveInDate}</p>
            </div>

            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>Gender Preference</p>
              <p style={styles.infoValue}>{post.genderPreference}</p>
            </div>

            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>Full Address</p>
              <p style={styles.privateAddress}>Visible after matching</p>
            </div>
          </div>
        </section>

        <section style={styles.contentPanel}>
          <p style={styles.sectionLabel}>Description</p>
          <p style={styles.descriptionText}>{post.descriptionEn}</p>
        </section>

        <section style={styles.contentPanel}>
          <p style={styles.sectionLabel}>Lifestyle Tags</p>

          <div style={styles.tagsGrid}>
            {post.lifestyleTags.length > 0 ? (
              post.lifestyleTags.map((tag) => (
                <span key={tag} style={styles.tag}>
                  {tag}
                </span>
              ))
            ) : (
              <span style={styles.emptyTag}>No selected tags.</span>
            )}
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <h2 style={styles.actionTitle}>Interested in this post?</h2>
            <p style={styles.actionText}>
              Send an interest request to start matching with the writer.
            </p>
          </div>

          <button style={styles.mainBtn} onClick={handleInterest}>
            I'm Interested
          </button>
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
    maxWidth: 980,
    margin: "48px auto",
    padding: "0 40px",
    position: "relative",
    zIndex: 1,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#888",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    marginBottom: 18,
  },
  photoPanel: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: 24,
    marginBottom: 28,
  },
  mainPhotoBox: {
    height: 380,
    background: "#f0ede8",
    borderRadius: 2,
    overflow: "hidden",
  },
  mainPhoto: {
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
    fontSize: 13,
  },
  thumbnailRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },
  thumbnailBtn: {
    border: "1px solid #ebe9e4",
    background: "#fff",
    padding: 0,
    width: 90,
    height: 66,
    cursor: "pointer",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  header: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "40px 48px",
    marginBottom: 28,
  },
  topLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  title: {
    fontSize: 32,
    fontWeight: 400,
    lineHeight: 1.35,
    color: "#1a1a1a",
    margin: "0 0 24px",
  },
  profileBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#e8e4dc",
    color: "#888",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    border: "3px solid #ebe9e4",
  },
  writerName: {
    fontSize: 16,
    color: "#1a1a1a",
    margin: "0 0 5px",
  },
  university: {
    fontSize: 13,
    color: "#888",
    margin: 0,
  },
  verified: {
    marginLeft: 8,
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 20,
    background: "#f0faf4",
    color: "#27ae60",
    border: "1px solid #a8e6c1",
  },
  infoPanel: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "40px 48px",
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#aaa",
    margin: "0 0 18px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  infoItem: {
    borderBottom: "1.5px solid #f0ede8",
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#bbb",
    margin: "0 0 8px",
  },
  infoValue: {
    fontSize: 15,
    color: "#1a1a1a",
    margin: 0,
  },
  privateAddress: {
    fontSize: 15,
    color: "#b8860b",
    margin: 0,
  },
  contentPanel: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "40px 48px",
    marginBottom: 28,
  },
  descriptionText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 1.8,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  tagsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    fontSize: 12,
    padding: "6px 14px",
    background: "#1a1a1a",
    color: "#fff",
    borderRadius: 20,
    letterSpacing: "0.03em",
  },
  emptyTag: {
    fontSize: 13,
    color: "#aaa",
  },
  actionPanel: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "32px 48px",
    marginBottom: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: 400,
    color: "#1a1a1a",
    margin: "0 0 8px",
  },
  actionText: {
    fontSize: 13,
    color: "#888",
    margin: 0,
    lineHeight: 1.6,
  },
  mainBtn: {
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
  notFoundBox: {
    maxWidth: 560,
    margin: "140px auto 0",
    background: "#ffffff",
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "48px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  notFoundTitle: {
    fontSize: 28,
    fontWeight: 400,
    margin: "0 0 12px",
  },
  notFoundText: {
    fontSize: 14,
    color: "#888",
    lineHeight: 1.6,
    margin: "0 0 24px",
  },
};