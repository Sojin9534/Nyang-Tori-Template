import { env } from "cloudflare:workers";

export type LifeLog = {
  id: string;
  type: string;
  value: number | null;
  unit: string | null;
  status: string | null;
  memo: string;
  occurred_at: string;
};

export type AlbumEntry = {
  id: string;
  image_key: string | null;
  fallback_url: string | null;
  caption: string;
  taken_at: string;
  milestone: string | null;
  is_public: number;
  like_count?: number;
};

export type PublicMessage = { id: string; nickname: string; content: string; created_at: string; album_entry_id?: string };

export type CatProfile = {
  id: string;
  name: string;
  birth_date: string;
  breed: string;
  bio: string;
  profile_image_key: string | null;
};

function db() {
  if (!env.DB) throw new Error("기록 저장소를 사용할 수 없습니다.");
  return env.DB;
}

export async function ensureCat(ownerId: string) {
  const database = db();
  let created = false;
  let existing = await database
    .prepare("SELECT * FROM cats WHERE share_slug = ? LIMIT 1")
    .bind("tori")
    .first<Record<string, string>>();
  if (!existing) {
    await database
      .prepare(
        "INSERT OR IGNORE INTO cats (id, owner_id, name, birth_date, breed, bio, share_slug, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        "cat-owner",
        ownerId,
        "나의 고양이",
        "2025-01-01",
        "품종을 입력해주세요",
        "우리 고양이의 소중한 성장기록",
        "tori",
        new Date().toISOString(),
      )
      .run();
    created = true;
    existing = await database
      .prepare("SELECT * FROM cats WHERE share_slug = ? LIMIT 1")
      .bind("tori")
      .first<Record<string, string>>();
  }

  if (!existing) throw new Error("고양이의 기본 정보를 만들 수 없습니다.");
  if (existing.owner_id === "demo-owner" && ownerId !== "demo-owner") {
    await database
      .prepare("UPDATE cats SET owner_id = ? WHERE id = ? AND owner_id = ?")
      .bind(ownerId, existing.id, "demo-owner")
      .run();
    existing = { ...existing, owner_id: ownerId };
  }

  if (!created) return existing;

  return existing;
}

export async function getDashboard(ownerId: string) {
  const cat = await ensureCat(ownerId);
  if (cat.owner_id !== ownerId) throw new Error("이 고양이의 기록을 볼 권한이 없습니다.");
  const [logs, album, comments, guestbook] = await Promise.all([
    db().prepare("SELECT id, type, value, unit, status, memo, occurred_at FROM life_logs WHERE cat_id = ? AND type != 'pee' ORDER BY occurred_at DESC LIMIT 40").bind(cat.id).all<LifeLog>(),
    db().prepare("SELECT id, image_key, fallback_url, caption, taken_at, milestone, is_public FROM album_entries WHERE cat_id = ? ORDER BY taken_at DESC LIMIT 40").bind(cat.id).all<AlbumEntry>(),
    db().prepare("SELECT id, album_entry_id, nickname, content, created_at FROM album_comments WHERE cat_id = ? ORDER BY created_at DESC LIMIT 100").bind(cat.id).all<PublicMessage>(),
    db().prepare("SELECT id, nickname, content, created_at FROM guestbook_entries WHERE cat_id = ? ORDER BY created_at DESC LIMIT 100").bind(cat.id).all<PublicMessage>(),
  ]);
  return { cat, logs: logs.results, album: album.results, comments: comments.results, guestbook: guestbook.results };
}

export async function getPublicAlbum(slug: string) {
  const database = db();
  if (slug === "tori") await ensureCat("demo-owner");
  const cat = await database
    .prepare("SELECT id, name, birth_date, breed, bio, profile_image_key, share_slug FROM cats WHERE share_slug = ? LIMIT 1")
    .bind(slug)
    .first<Record<string, string>>();
  if (!cat) return null;
  const [album, comments, guestbook] = await Promise.all([database
    .prepare("SELECT id, image_key, fallback_url, caption, taken_at, milestone, is_public, (SELECT COUNT(*) FROM album_likes WHERE album_entry_id = album_entries.id) AS like_count FROM album_entries WHERE cat_id = ? AND is_public = 1 ORDER BY taken_at DESC")
    .bind(cat.id)
    .all<AlbumEntry>(), database.prepare("SELECT id, album_entry_id, nickname, content, created_at FROM album_comments WHERE cat_id = ? ORDER BY created_at ASC").bind(cat.id).all<PublicMessage>(), database.prepare("SELECT id, nickname, content, created_at FROM guestbook_entries WHERE cat_id = ? ORDER BY created_at DESC LIMIT 50").bind(cat.id).all<PublicMessage>()]);
  return { cat, album: album.results, comments: comments.results, guestbook: guestbook.results };
}

export function imageUrl(entry: AlbumEntry) {
  return entry.image_key ? `/api/media/${encodeURIComponent(entry.image_key)}` : entry.fallback_url ?? "/tori-mascot.png";
}

export function catImageUrl(cat: { profile_image_key?: string | null }) {
  return cat.profile_image_key ? `/api/media/${encodeURIComponent(cat.profile_image_key)}` : "/tori-mascot.png";
}
