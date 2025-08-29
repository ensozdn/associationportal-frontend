import api from "./api";



// KISACA TEMEL GÖREVİ :Bu dosya, frontend’in event servis katmanı:
// 	Backend ile haber/duyuru arama, listeleme, detay, oluşturma, güncelleme, silme işlemlerini yapar.
// 	Backend response’unu FrontEvent modeline map’leyerek UI’ı backend alan adlarından izole eder.
// 	Tarih ve payload alanlarını normalize ederek Strategy kurallarıyla uyumlu, temiz istekler gönderir.



// ---- Tipler ----

export type EventType = "NEWS" | "ANNOUNCEMENT";

export type FrontEvent = {
    id: number;
    subject: string;
    content: string;
    validUntil?: string | null;
    newsUrl?: string | null;
    imagePath?: string | null;
    eventType: EventType;
};

// Backend’in döndürdüğü alan adları (type / eventClass vb.) için küçük tip
type BackendEvent = {
    id: number;
    subject: string;
    content: string;
    validUntil?: string | null;
    newsUrl?: string | null;
    imagePath?: string | null;
    type: EventType;          // zorunlu alan (polimorfik hiyerarşiden geliyor)
    eventClass?: string;      // bazı yerlerde mevcut olabilir
};

type SpringPage<T> = {
    content: T[];
    totalElements?: number;
    totalPages?: number;
    number?: number; // current page (0-based)
    size?: number;
    sort?: unknown;
    pageable?: unknown;
};

// ---- Yardımcılar ----
function toIsoDate(d?: string | null) {
    if (!d) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    return new Date(d).toISOString().slice(0, 10);
}

// Backend -> Front map
export const mapBackendToFront = (e: BackendEvent): FrontEvent => ({
    id: e.id,
    subject: e.subject,
    content: e.content,
    validUntil: e.validUntil ?? null,
    newsUrl: e.newsUrl ?? null,
    imagePath: e.imagePath ?? null,
    eventType: (e.type ?? (e as any).eventType) as EventType, // normalize
});

// Page map
const mapPage = (page: SpringPage<BackendEvent>): SpringPage<FrontEvent> => ({
    ...page,
    content: page.content.map(mapBackendToFront),
});


// Pagination + filtre + keyword arama
export async function searchEvents(params?: {
    type?: EventType; // "NEWS" | "ANNOUNCEMENT"
    q?: string;       // keyword
    page?: number;    // 0-based
    size?: number;    // default 10
    sort?: string;    // ör: "id,desc" | "subject,asc"
}): Promise<SpringPage<FrontEvent>> {
    const { data } = await api.get<SpringPage<BackendEvent>>("/events/search", {
        params,
    });
    return mapPage(data);
}

// Home ekranı için basit tüm liste
export async function getEvents(): Promise<FrontEvent[]> {
    const { data } = await api.get<BackendEvent[]>("/events");
    return data.map(mapBackendToFront);
}

// Tekil kayıt
// noinspection JSUnusedGlobalSymbols
export async function getEventById(id: number): Promise<FrontEvent> {
    const { data } = await api.get<BackendEvent>(`/events/${id}`);
    return mapBackendToFront(data);
}

// ---- CREATE / UPDATE / DELETE --------------------------------------------

// NEWS: create
export async function createNews(form: {
    subject: string;
    content: string;
    newsUrl?: string | null;
}): Promise<FrontEvent> {
    const payload: any = {
        eventClass: "NEWS",
        subject: form.subject,
        content: form.content,
    };
    if (form.newsUrl) payload.newsUrl = form.newsUrl;

    const { data } = await api.post<BackendEvent>("/events", payload);
    return mapBackendToFront(data);
}

// NEWS: update
export async function updateNews(
    id: number,
    form: {
        subject: string;
        content: string;
        newsUrl?: string | null;
    }
): Promise<FrontEvent> {
    const payload: any = {
        eventClass: "NEWS",
        subject: form.subject,
        content: form.content,
    };
    if (form.newsUrl !== undefined && form.newsUrl !== null) {
        payload.newsUrl = form.newsUrl;
    }

    const { data } = await api.put<BackendEvent>(`/events/${id}`, payload);
    return mapBackendToFront(data);
}

// ANNOUNCEMENT form tipi (frontend)
export type AnnouncementForm = {
    subject: string;
    content: string;
    validUntil?: string | null; // "yyyy-MM-dd" (backend LocalDate) veya null
    imagePath?: string | null;  // opsiyonel (upload yoksa direkt path)
};

// ANNOUNCEMENT: create
export async function createAnnouncement(
    form: AnnouncementForm
): Promise<FrontEvent> {
    const payload: any = {
        eventClass: "ANNOUNCEMENT",
        subject: form.subject,
        content: form.content,
    };


    const v = toIsoDate(form.validUntil);
    if (v) payload.validUntil = v;

    if (form.imagePath) payload.imagePath = form.imagePath;

    const { data } = await api.post<BackendEvent>("/events", payload);
    return mapBackendToFront(data);
}

// ANNOUNCEMENT: update
export async function updateAnnouncement(
    id: number,
    form: AnnouncementForm
): Promise<FrontEvent> {
    const payload: any = {
        eventClass: "ANNOUNCEMENT",
        subject: form.subject,
        content: form.content,
    };

    const v = toIsoDate(form.validUntil);
    if (v) payload.validUntil = v;

    if (form.imagePath !== undefined && form.imagePath !== null) {
        payload.imagePath = form.imagePath;
    }

    const { data } = await api.put<BackendEvent>(`/events/${id}`, payload);
    return mapBackendToFront(data);
}

// DELETE (ortak)
export async function deleteEvent(id: number): Promise<boolean> {
    await api.delete(`/events/${id}`);
    return true;
}

// (Opsiyonel) ANNOUNCEMENT için görsel upload
// noinspection JSUnusedGlobalSymbols
export async function uploadAnnouncementImage(
    id: number,
    file: File
): Promise<FrontEvent> {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post<BackendEvent>(`/events/${id}/image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return mapBackendToFront(data);
}



    //“(Opsiyonel) Haber Detay Sayfası: /news/:id → getEventById geri eklenecek.”
	//“(Opsiyonel) Duyuru görsel upload (multipart) → uploadAnnouncementImage + backend endpoint.”