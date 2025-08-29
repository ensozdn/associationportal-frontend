
import React from "react";
import type { FrontEvent } from "../types/Event";
import { searchEvents } from "../services/events";

//NewsPage: Kullanıcıların haberleri arayıp sayfalayarak kart grid’inde görmesini sağlar;
// kart tıklanınca modalda detay ve “Habere git” linki sunar. Veriyi backend’den searchEvents({ type: "NEWS", ... }) ile çeker;
// aramada debounce ve klavye ile kapatılabilen modal gibi UX detaylarına sahiptir.

type SpringPage<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // 0-based
    size: number;
};

export default function NewsPage() {
    const [rows, setRows] = React.useState<FrontEvent[]>([]);
    const [q, setQ] = React.useState("");
    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(12);
    const [totalPages, setTotalPages] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // modal state
    const [selected, setSelected] = React.useState<FrontEvent | null>(null);

    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await searchEvents({
                type: "NEWS",
                q: q.trim() || undefined,
                page,
                size,
                sort: "id,desc",
            });
            const sp = data as unknown as SpringPage<FrontEvent>;
            setRows(sp.content ?? []);
            setTotalPages(sp.totalPages ?? 1);
        } catch (e: any) {
            setError(e?.message ?? "Haberler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, [q, page, size]);

    // aramada küçük debounce
    React.useEffect(() => {
        const t = setTimeout(() => {
            setPage(0);
            void load();
        }, q ? 300 : 0);
        return () => clearTimeout(t);
    }, [q, load]);

    // sayfa/size değişince yükle
    React.useEffect(() => {
        void load();
    }, [page, size, load]);

    // ESC ile modal kapat
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelected(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    function openModal(item: FrontEvent) {
        setSelected(item);
    }

    function closeModal() {
        setSelected(null);
    }

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
            <h2>Haberler</h2>

            {/* arama & boyut */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 12,
                }}
            >
                <input
                    placeholder="Ara (başlık/içerik)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                    <option value={6}>6/sayfa</option>
                    <option value={12}>12/sayfa</option>
                    <option value={24}>24/sayfa</option>
                </select>
            </div>

            {loading && <div style={{ padding: 8 }}>Yükleniyor…</div>}
            {error && <div style={{ padding: 8, color: "crimson" }}>{error}</div>}

            {/* kart grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                    gap: 16,
                }}
            >
                {rows.map((r) => (
                    <article
                        key={r.id}
                        onClick={() => openModal(r)}
                        style={{
                            cursor: "pointer",
                            border: "1px solid #eee",
                            borderRadius: 12,
                            padding: 12,
                            background: "#fff",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                            transition: "transform .12s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        <h3 style={{ margin: "0 0 6px 0" }}>{r.subject}</h3>
                        <p style={{ margin: 0, color: "#555", minHeight: 48 }}>
                            {truncate(r.content ?? "", 120)}
                        </p>
                        {r.newsUrl ? (
                            <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                                Kaynak: {r.newsUrl}
                            </div>
                        ) : (
                            <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>Kaynak yok</div>
                        )}
                    </article>
                ))}
            </div>

            {rows.length === 0 && !loading && (
                <div style={{ padding: 12, color: "#666" }}>Kayıt bulunamadı.</div>
            )}

            {/* sayfalama */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
                <button disabled={page === 0} onClick={() => setPage(0)}>
                    « İlk
                </button>
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    ‹ Önceki
                </button>
                <span>
          Sayfa {page + 1} / {Math.max(totalPages, 1)}
        </span>
                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Sonraki ›
                </button>
                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(totalPages - 1)}
                >
                    Son »
                </button>
            </div>

            {/* ---- MODAL ---- */}
            {selected && (
                <div
                    onClick={closeModal}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "min(720px, 95vw)",
                            maxHeight: "85vh",
                            overflow: "auto",
                            background: "#fff",
                            borderRadius: 16,
                            boxShadow: "0 12px 40px rgba(0,0,0,.2)",
                            padding: 20,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <h3 style={{ margin: 0 }}>{selected.subject}</h3>
                            <button onClick={closeModal} aria-label="Kapat">
                                ✕
                            </button>
                        </div>
                        <div style={{ color: "#444", lineHeight: 1.6, marginTop: 8, whiteSpace: "pre-wrap" }}>
                            {selected.content}
                        </div>
                        {selected.newsUrl && (
                            <div style={{ marginTop: 12 }}>
                                <a href={selected.newsUrl} target="_blank" rel="noreferrer">
                                    Habere git →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// küçük yardımcı
function truncate(s: string, n: number) {
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
}