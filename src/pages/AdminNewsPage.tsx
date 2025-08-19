import React from "react";
import type { FrontEvent } from "../types/Event";
import { searchEvents, createNews, updateNews, deleteEvent } from "../services/events";

type SpringPage<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // 0-based
    size: number;
};

/** Haber form modeli */
type NewsForm = {
    subject: string;
    content: string;
    newsUrl?: string | null;
};

const emptyForm: NewsForm = { subject: "", content: "", newsUrl: "" };

/** ufak stiller */
const sx = {
    container: {
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 20px",
    },
    card: {
        background: "#fff",
        border: "1px solid #e7ecf1",
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
    },
    section: {
        padding: 16,
    },
    h2: {
        margin: "0 0 12px",
        fontSize: 26,
        fontWeight: 700 as const,
        letterSpacing: 0.2,
        color: "#0f172a",
    },
    toolbar: {
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        gap: 10,
        alignItems: "center",
        margin: "12px 0 18px",
    },
    input: {
        width: "100%",
        height: 40,
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #dbe3ef",
        outline: "none",
    },
    select: {
        height: 40,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #dbe3ef",
        background: "#fff",
    },
    button: {
        height: 40,
        padding: "0 14px",
        borderRadius: 10,
        border: "1px solid #2563eb",
        background: "#2563eb",
        color: "#fff",
        fontWeight: 600 as const,
        cursor: "pointer",
    },
    tableWrap: {
        overflowX: "auto" as const,
        borderRadius: 12,
        border: "1px solid #eef2f6",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
        fontSize: 15,
    },
    th: {
        textAlign: "left" as const,
        background: "#f8fafc",
        color: "#334155",
        padding: "12px 14px",
        borderBottom: "1px solid #eef2f6",
        whiteSpace: "nowrap" as const,
    },
    td: {
        padding: "12px 14px",
        borderBottom: "1px solid #f1f5f9",
        verticalAlign: "top" as const,
    },
    ghost: { color: "#64748b" },
    actions: { display: "flex", gap: 8 },
    btnGhost: {
        height: 34,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid #dbe3ef",
        background: "#fff",
        cursor: "pointer",
    },
    pager: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 12,
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 10,
    },
    textarea: {
        width: "100%",
        minHeight: 110,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #dbe3ef",
        outline: "none",
        resize: "vertical" as const,
    },
    formRow: { display: "flex", gap: 10 },
    btnWarn: {
        height: 34,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid #e11d48",
        background: "#fff",
        color: "#e11d48",
        cursor: "pointer",
    },
};

export default function AdminNewsPage() {
    // tablo state
    // noinspection DuplicatedCode
    const [rows, setRows] = React.useState<FrontEvent[]>([]);
    const [page, setPage] = React.useState<Pick<
        SpringPage<any>,
        "number" | "size" | "totalPages" | "totalElements"
    >>({ number: 0, size: 10, totalPages: 0, totalElements: 0 });

    // filtre/sıralama
    const [q, setQ] = React.useState("");
    const [sort, setSort] = React.useState("id,desc");

    // durum
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // form
    const [form, setForm] = React.useState<NewsForm>(emptyForm);
    const [editing, setEditing] = React.useState<FrontEvent | null>(null);

    // data yükleme
    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await searchEvents({
                type: "NEWS",
                q: q.trim() || undefined,
                page: page.number,
                size: page.size,
                sort,
            });
            // noinspection DuplicatedCode
            const sp = (data ?? {}) as Partial<SpringPage<FrontEvent>>;
            const content = sp.content ?? [];
            const sizeSafe = sp.size ?? page.size ?? 10;
            const totalElementsSafe = sp.totalElements ?? 0;
            const numberSafe = sp.number ?? 0;
            const totalPagesSafe =
                sp.totalPages ?? Math.max(1, Math.ceil(totalElementsSafe / sizeSafe));

            setRows(content);
            setPage((p) => ({
                ...p,
                number: numberSafe,
                size: sizeSafe,
                totalPages: totalPagesSafe,
                totalElements: totalElementsSafe,
            }));
        } catch (e: any) {
            setError(e?.message ?? "Liste yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, [q, page.number, page.size, sort]);

    // aramada debounce
    // noinspection DuplicatedCode
    React.useEffect(() => {
        const t = setTimeout(() => void load(), q ? 300 : 0);
        return () => clearTimeout(t);
    }, [q, load]);

    // sayfa/size/sort anında
    React.useEffect(() => {
        void load();
    }, [page.number, page.size, sort, load]);

    // CRUD
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const payload: NewsForm = {
                subject: form.subject.trim(),
                content: form.content.trim(),
                newsUrl: form.newsUrl?.trim() || null,
            };

            if (editing) {
                await updateNews(editing.id, payload);
                setEditing(null);
            } else {
                await createNews(payload);
            }
            setForm(emptyForm);
            setPage((p) => ({ ...p, number: 0 }));
            await load();
        } catch (err: any) {
            alert(err?.message ?? "Kaydetme sırasında hata oluştu.");
        }
    }

    function onEdit(ev: FrontEvent) {
        setEditing(ev);
        setForm({
            subject: ev.subject ?? "",
            content: ev.content ?? "",
            newsUrl: ev.newsUrl ?? "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function onDelete(id: number) {
        if (!window.confirm("Bu haberi silmek istediğine emin misin?")) return;
        // noinspection DuplicatedCode
        try {
            await deleteEvent(id);
            setPage((p) => {
                const willBeEmpty = rows.length === 1 && p.number > 0;
                return willBeEmpty ? { ...p, number: p.number - 1 } : p;
            });
            await load();
        } catch (err: any) {
            alert(err?.message ?? "Silme sırasında hata oluştu.");
        }
    }

    // UI
    // noinspection DuplicatedCode
    return (
        <div style={sx.container}>
            <h2 style={sx.h2}>Admin • Haberler</h2>
            {/* Araç çubuğu */}
            <div style={sx.toolbar}>
                <input
                    style={sx.input}
                    placeholder="Ara (başlık/içerik)"
                    value={q}
                    onChange={(e) => {
                        setPage((p) => ({ ...p, number: 0 }));
                        setQ(e.target.value);
                    }}
                />

                <select
                    style={sx.select}
                    value={page.size}
                    onChange={(e) =>
                        setPage((p) => ({ ...p, number: 0, size: Number(e.target.value) }))
                    }
                    title="Sayfa boyutu"
                >
                    <option value={5}>5/sayfa</option>
                    <option value={10}>10/sayfa</option>
                    <option value={20}>20/sayfa</option>
                </select>

                <select
                    style={sx.select}
                    value={sort}
                    onChange={(e) => {
                        setPage((p) => ({ ...p, number: 0 }));
                        setSort(e.target.value);
                    }}
                    title="Sırala"
                >
                    <option value="id,desc">ID ↓</option>
                    <option value="id,asc">ID ↑</option>
                    <option value="subject,asc">Başlık A→Z</option>
                    <option value="subject,desc">Başlık Z→A</option>
                </select>

                <button style={sx.button} disabled={loading} onClick={() => void load()}>
                    Yenile
                </button>
            </div>

            {/* Durum */}
            {loading && <div style={{ padding: 8 }}>Yükleniyor…</div>}
            {error && <div style={{ padding: 8, color: "crimson" }}>{error}</div>}

            {/* Tablo */}
            <div style={{ ...sx.card, ...sx.section, paddingTop: 6 }}>
                <div style={sx.tableWrap}>
                    <table style={sx.table}>
                        <thead>
                        <tr>
                            <th style={{ ...sx.th, width: 70 }}>ID</th>
                            <th style={sx.th}>Başlık</th>
                            <th style={sx.th}>Link</th>
                            <th style={{ ...sx.th, width: 190 }}>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((r) => (
                            <tr key={r.id}>
                                <td style={sx.td}>{r.id}</td>
                                <td style={sx.td}>{r.subject}</td>
                                <td style={sx.td}>
                                    {r.newsUrl ? (
                                        <a href={r.newsUrl} target="_blank" rel="noreferrer">
                                            {r.newsUrl}
                                        </a>
                                    ) : (
                                        <span style={sx.ghost}>-</span>
                                    )}
                                </td>
                                <td style={{ ...sx.td }}>
                                    <div style={sx.actions}>
                                        <button style={sx.btnGhost} onClick={() => onEdit(r)}>
                                            Düzenle
                                        </button>
                                        <button style={sx.btnWarn} onClick={() => onDelete(r.id)}>
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} style={{ ...sx.td, textAlign: "center", color: "#64748b" }}>
                                    Kayıt bulunamadı.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Sayfalama */}
                <div style={sx.pager}>
                    <button
                        style={sx.btnGhost}
                        disabled={page.number === 0}
                        onClick={() => setPage((p) => ({ ...p, number: 0 }))}
                    >
                        « İlk
                    </button>
                    <button
                        style={sx.btnGhost}
                        disabled={page.number === 0}
                        onClick={() => setPage((p) => ({ ...p, number: p.number - 1 }))}
                    >
                        ‹ Önceki
                    </button>
                    <span style={{ color: "#334155" }}>
            Sayfa <b>{page.number + 1}</b> / {Math.max(page.totalPages, 1)}
          </span>
                    <button
                        style={sx.btnGhost}
                        disabled={page.number + 1 >= page.totalPages}
                        onClick={() => setPage((p) => ({ ...p, number: p.number + 1 }))}
                    >
                        Sonraki ›
                    </button>
                    <button
                        style={sx.btnGhost}
                        disabled={page.number + 1 >= page.totalPages}
                        onClick={() =>
                            setPage((p) => ({ ...p, number: Math.max(p.totalPages - 1, 0) }))
                        }
                    >
                        Son »
                    </button>
                </div>
            </div>

            {/* Form */}
            <div style={{ ...sx.card, ...sx.section, marginTop: 18 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 18, color: "#0f172a" }}>
                    {editing ? "Haberi Güncelle" : "Yeni Haber"}
                </h3>

                <form onSubmit={onSubmit} style={sx.formGrid}>
                    <input
                        style={sx.input}
                        placeholder="Başlık"
                        value={form.subject}
                        onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                        required
                    />
                    <textarea
                        style={sx.textarea}
                        placeholder="İçerik"
                        value={form.content}
                        onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                        required
                    />
                    <input
                        style={sx.input}
                        placeholder="Haber bağlantısı (ops.)"
                        value={form.newsUrl ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, newsUrl: e.target.value }))}
                    />

                    <div style={sx.formRow}>
                        <button type="submit" style={sx.button} disabled={loading}>
                            {editing ? "Güncelle" : "Kaydet"}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                style={sx.btnGhost}
                                onClick={() => {
                                    setEditing(null);
                                    setForm(emptyForm);
                                }}
                            >
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}