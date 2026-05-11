import { useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
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

const lifestyleOptions = [
  "Non-smoker",
  "Smoking allowed",
  "Quiet lifestyle",
  "Social lifestyle",
  "Clean",
  "Pets allowed",
  "Late return allowed",
  "Regular routine",
];

export default function PostForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    postType: "Room Available" as PostType,
    title: "",
    region: "",
    address: "",
    rent: "",
    deposit: "",
    moveInDate: "",
    genderPreference: "No Preference",
    descriptionKo: "",
    descriptionEn: "",
    writerName: "",
    university: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : [...prev, tag]
    );
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);

    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          })
      )
    ).then((images) => {
      setPhotos(images);
    });
  };

  const submitPost = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.region.trim() ||
      !form.address.trim() ||
      !form.rent.trim() ||
      !form.deposit.trim() ||
      !form.moveInDate.trim() ||
      !form.descriptionEn.trim() ||
      !form.writerName.trim() ||
      !form.university.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const today = new Date();
    const createdAt = `${today.getFullYear()}.${String(
      today.getMonth() + 1
    ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

    const newPost: Post = {
      id: String(Date.now()),
      postType: form.postType,
      title: form.title,
      region: form.region,
      address: form.address,
      rent: Number(form.rent),
      deposit: Number(form.deposit),
      moveInDate: form.moveInDate,
      genderPreference: form.genderPreference,
      lifestyleTags: selectedTags,
      descriptionKo: form.descriptionEn,
      descriptionEn: form.descriptionEn,
      photos,
      writerName: form.writerName,
      university: form.university,
      verified: true,
      createdAt,
      status: "active",
    };

    const saved = localStorage.getItem("roomies_posts");
    const savedPosts: Post[] = saved ? JSON.parse(saved) : [];

    localStorage.setItem(
      "roomies_posts",
      JSON.stringify([newPost, ...savedPosts])
    );

    alert("Post created successfully.");
    navigate("/browse");
  };

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

        <section style={styles.header}>
          <p style={styles.kicker}>CREATE POST</p>
          <h1 style={styles.title}>Write a Room Post</h1>
          <p style={styles.description}>
            Add room details, budget, move-in date, lifestyle tags, and
            description for roommate matching.
          </p>
        </section>

        <form style={styles.formPanel} onSubmit={submitPost}>
          <div style={styles.section}>
            <p style={styles.sectionLabel}>Basic Information</p>

            <div style={styles.grid2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Post Type</label>
                <select
                  name="postType"
                  value={form.postType}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Room Available">Room Available</option>
                  <option value="Looking for Room">Looking for Room</option>
                  <option value="Short-term Rental">Short-term Rental</option>
                  <option value="Contract Transfer">Contract Transfer</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Looking for a roommate near campus"
                />
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Region</label>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Seodaemun-gu"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Full address will be hidden until matching"
                />
              </div>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <p style={styles.sectionLabel}>Budget & Move-in</p>

            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Monthly Rent</label>
                <input
                  name="rent"
                  type="number"
                  min="0"
                  value={form.rent}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="45"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Deposit</label>
                <input
                  name="deposit"
                  type="number"
                  min="0"
                  value={form.deposit}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="500"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Move-in Date</label>
                <input
                  name="moveInDate"
                  type="date"
                  value={form.moveInDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <p style={styles.hint}>
              Enter rent and deposit in units of 10,000 KRW.
            </p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <p style={styles.sectionLabel}>Preferences</p>

            <div style={styles.grid2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Gender Preference</label>
                <select
                  name="genderPreference"
                  value={form.genderPreference}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="No Preference">No Preference</option>
                  <option value="Female Preferred">Female Preferred</option>
                  <option value="Male Preferred">Male Preferred</option>
                </select>
              </div>
            </div>

            <div style={styles.tagsGrid}>
              {lifestyleOptions.map((tag) => {
                const active = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      ...styles.tagBtn,
                      background: active ? "#1a1a1a" : "transparent",
                      color: active ? "#fff" : "#888",
                      border: active
                        ? "1.5px solid #1a1a1a"
                        : "1.5px solid #ddd",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <p style={styles.sectionLabel}>Room Photos</p>

            <label style={styles.uploadBox}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
              <span style={styles.uploadText}>Upload up to 3 room photos</span>
            </label>

            <div style={styles.previewGrid}>
              {photos.length > 0 ? (
                photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`room-${index + 1}`}
                    style={styles.previewImage}
                  />
                ))
              ) : (
                <p style={styles.hint}>No photos selected.</p>
              )}
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <p style={styles.sectionLabel}>Description</p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>English Description</label>
              <textarea
                name="descriptionEn"
                value={form.descriptionEn}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="Please describe the room, lifestyle, and roommate preferences."
              />
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <p style={styles.sectionLabel}>Writer Information</p>

            <div style={styles.grid2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Name</label>
                <input
                  name="writerName"
                  value={form.writerName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Jeong An"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>University</label>
                <input
                  name="university"
                  value={form.university}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Myongji University"
                />
              </div>
            </div>

            <p style={styles.hint}>
              A student verification badge will be displayed on the detail page.
            </p>
          </div>

          <button type="submit" style={styles.submitBtn}>
            Create Post
          </button>
        </form>
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
  header: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "40px 48px",
    marginBottom: 28,
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
    maxWidth: 680,
    margin: 0,
  },
  formPanel: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "40px 48px",
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#aaa",
    marginBottom: 18,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 18,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 24,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 18,
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
  textarea: {
    border: "1.5px solid #ddd",
    padding: "14px",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    color: "#1a1a1a",
    background: "transparent",
    outline: "none",
    width: "100%",
    minHeight: 120,
    resize: "vertical",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },
  divider: {
    height: 1,
    background: "#f0ede8",
    margin: "28px 0",
  },
  tagsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBtn: {
    padding: "6px 14px",
    fontSize: 12,
    fontFamily: "'Georgia', serif",
    borderRadius: 20,
    transition: "all 0.2s ease",
    letterSpacing: "0.03em",
    cursor: "pointer",
  },
  uploadBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px dashed #ddd",
    padding: "20px",
    cursor: "pointer",
    borderRadius: 2,
    marginTop: 8,
  },
  uploadText: {
    fontSize: 13,
    color: "#888",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  previewImage: {
    width: "100%",
    height: 130,
    objectFit: "cover",
    borderRadius: 2,
    border: "1px solid #ebe9e4",
  },
  hint: {
    fontSize: 11,
    color: "#bbb",
    marginTop: 8,
    lineHeight: 1.6,
  },
  submitBtn: {
    width: "100%",
    background: "#1a1a1a",
    border: "none",
    padding: "14px 24px",
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#fff",
    borderRadius: 1,
    marginTop: 16,
  },
};