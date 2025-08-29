import React from "react";
import type { FrontEvent } from "../types/Event";

//  Görevi: Tek bir Event nesnesini (haber, duyuru veya normal etkinlik) kart görünümünde ekranda göstermek.
// 	Nasıl?
// 	Event’in tipini (NEWS / ANNOUNCEMENT / EVENT) kontrol eder.
// 	Eğer announcement ise: görsel (imagePath) ve geçerlilik tarihi (validUntil) varsa onları gösterir.
// 	Eğer news ise: haber linki (newsUrl) ekler, “Habere git ↗” butonunu render eder.
// 	Ortak kısımda subject (başlık) ve content (içerik) gösterilir.
//  Kısaca: Backend’den gelen FrontEvent’i alır → tipine göre uygun görselleştirme yapar → kullanıcıya okunabilir, şık bir kart UI sunar.
//  Yani bu dosya, frontend’de event bilgisini kullanıcıya göstermekten sorumlu UI bileşenidir.

const isNews = (e: FrontEvent) => e.eventType === "NEWS";
const isAnnouncement = (e: FrontEvent) => e.eventType === "ANNOUNCEMENT";

export default function EventCard({ event }: { event: FrontEvent }) {
    const news = isNews(event);
    const ann = isAnnouncement(event);

    const hasImage =
        !!(event as any).imagePath && String((event as any).imagePath).trim().length > 0;

    const valid =
        (event as any).validUntil && String((event as any).validUntil).trim().length > 0;

    return (
        <div
            style={{
                border: "1px solid #ececec",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
        >
            {/* Üst satır: etiket + tarih */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
            style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                color: "#374151",
                background: "#f9fafb",
            }}
        >
          {news ? "NEWS" : ann ? "ANNOUNCEMENT" : "EVENT"}
        </span>

                {ann && valid && (
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
            Geçerlilik: {(event as any).validUntil}
          </span>
                )}
            </div>

            {/* Gövde */}
            <div style={{ display: "flex", gap: 12 }}>
                {ann && hasImage && (
                    <img
                        src={(event as any).imagePath}
                        alt="announcement"
                        style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #eee",
                        }}
                    />
                )}

                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{event.subject}</div>
                    <div style={{ color: "#4b5563", fontSize: 14 }}>{event.content}</div>

                    {news && (event as any).newsUrl && String((event as any).newsUrl).trim() && (
                        <div style={{ marginTop: 8 }}>
                            <a
                                href={(event as any).newsUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    fontSize: 14,
                                    textDecoration: "none",
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #e5e7eb",
                                    background: "#f8fafc",
                                }}
                            >
                                Habere git ↗
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}