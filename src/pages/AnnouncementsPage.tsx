import React from "react";
import { FrontEvent } from "../types/Event";
import { getEvents } from "../services/events";


//AnnouncementsPage: Son kullanıcının duyuruları görüp arayabildiği,
// istemci tarafında sayfalayabildiği bir liste sayfasıdır. Kart görünümleri ile özetleri gösterir,
// kart tıklanınca modalda detayları açar. Backend’den getEvents() ile veriyi alır ve yalnızca ANNOUNCEMENT tipini ekranda sunar.


function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "numeric" });
}

    export default function AnnouncementsPage() {
    const [all, setAll] = React.useState<FrontEvent[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [q, setQ] = React.useState("");
    const [pageSize, setPageSize] = React.useState(12);
    const [page, setPage] = React.useState(1);

    const [selected, setSelected] = React.useState<FrontEvent | null>(null);

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getEvents();
                setAll(data.filter(e => e.eventType === "ANNOUNCEMENT"));
            } catch (err: any) {
                setError(err?.message ?? "Duyurular yüklenemedi");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = React.useMemo(() => {
        const k = q.trim().toLowerCase();
        if (!k) return all;
        return all.filter(e =>
            (e.subject ?? "").toLowerCase().includes(k) ||
            (e.content ?? "").toLowerCase().includes(k)
        );
    }, [all, q]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    React.useEffect(() => { setPage(1); }, [q, pageSize]);

    if (loading) return <div style={{ padding: 24 }}>Yükleniyor…</div>;
    if (error)   return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 12 }}>Duyurular</h1>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <input
                    placeholder="Ara (başlık/içerik)"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{ flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
                />
                <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                    style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
                >
                    <option value={6}>6/sayfa</option>
                    <option value={12}>12/sayfa</option>
                    <option value={24}>24/sayfa</option>
                </select>
            </div>

            {pageItems.length === 0 ? (
                <div style={{ color: "#666", padding: 12 }}>Kayıt bulunamadı.</div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: 12,
                    }}
                >
                    {pageItems.map(a => (
                        <article
                            key={a.id}
                            onClick={() => setSelected(a)}
                            style={{
                                cursor: "pointer",
                                border: "1px solid #eee",
                                borderRadius: 12,
                                padding: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                background: "#fff",
                            }}
                        >
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>{a.subject}</div>
                            <div style={{ color: "#666", fontSize: 14, minHeight: 36 }}>
                                {(a.content ?? "").slice(0, 120)}
                            </div>
                            <div style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
                                Geçerlilik: {formatDate(a.validUntil)}
                            </div>
                            {a.imagePath && (
                                <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                                    Görsel: <code>{a.imagePath}</code>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 12 }}>
                <button onClick={() => setPage(1)} disabled={current === 1}>« İlk</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={current === 1}>‹ Önceki</button>
                <span style={{ fontSize: 12, color: "#666" }}>
          Sayfa {current} / {totalPages}
        </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={current === totalPages}>Sonraki ›</button>
                <button onClick={() => setPage(totalPages)} disabled={current === totalPages}>Son »</button>
            </div>

            {/* Modal */}
            {selected && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelected(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        zIndex: 50,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: "min(720px, 96vw)",
                            background: "#fff",
                            borderRadius: 14,
                            padding: 16,
                            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                            position: "relative",
                        }}
                    >
                        <button
                            aria-label="Kapat"
                            onClick={() => setSelected(null)}
                            style={{
                                position: "absolute",
                                top: 10, right: 10,
                                border: "1px solid #eee",
                                background: "#fff",
                                borderRadius: 8,
                                width: 28, height: 28, lineHeight: "26px",
                                cursor: "pointer",
                            }}
                        >×</button>

                        <h3 style={{ marginBottom: 6 }}>{selected.subject}</h3>
                        <div style={{ color: "#666", whiteSpace: "pre-wrap" }}>{selected.content}</div>

                        <div style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
                            Geçerlilik: {formatDate(selected.validUntil)}
                        </div>

                        {selected.imagePath && (
                            <div style={{ marginTop: 10 }}>
                                <img
                                    src={selected.imagePath}
                                    alt=""
                                    style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #eee" }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}