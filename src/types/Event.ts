export type EventType = "NEWS" | "ANNOUNCEMENT";


//KISACA TEMEL GÖREVİ : Backend’ten gelen ham veri (BackendEvent)
// 	Frontend’in kullandığı normalize edilmiş veri (FrontEvent)
// 	Form payload tipleri (NewsForm, AnnouncementForm)
// 	Sayfalama tipleri (SpringPage<T>)
// 	EventType union type (NEWS | ANNOUNCEMENT)



// Frontend'te kullandığımız normalize edilmiş tip
export interface FrontEvent {
    id: number;
    eventType: EventType;
    subject: string;
    content: string;
    validUntil?: string | null;
    newsUrl?: string | null;
    imagePath?: string | null;
}
// noinspection JSUnusedGlobalSymbols
export type BackendEvent = {
    id?: number;
    subject: string;
    content: string;
    validUntil?: string | null;
    eventType?: EventType;
    type?: EventType;
    newsUrl?: string | null;
    imagePath?: string | null;
};

// Create/Update payload'ları (frontend form'undan gelen)
// noinspection JSUnusedGlobalSymbols
export interface NewsForm {
    subject: string;
    content: string;
    newsUrl?: string;
}

// noinspection JSUnusedGlobalSymbols
export interface AnnouncementForm {
    subject: string;
    content: string;
    validUntil?: string;      // "YYYY-MM-DD"
    imagePath?: string;       // upload sonrası path yazılabilir
}

// Spring Data Page yanıtı (backend response şekli)
// noinspection JSUnusedGlobalSymbols
export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // current page index (0-based)
    size: number;   // page size
}
// noinspection JSUnusedGlobalSymbols
export type Event = FrontEvent;