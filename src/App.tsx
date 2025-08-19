import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import EventCard from "./components/EventCard";
import type { FrontEvent } from "./types/Event";
import { getEvents } from "./services/events";
import "./App.css";

import AdminNewsPage from "./pages/AdminNewsPage";
import AdminAnnouncementsPage from "./pages/AdminAnnouncementsPage";
import NewsPage from "./pages/NewsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";

// ===== Home (yalın liste) =====
function Home() {
    const [items, setItems] = React.useState<FrontEvent[]>([]);

    React.useEffect(() => {
        getEvents().then(setItems).catch(() => setItems([]));
    }, []);

    const news = React.useMemo(
        () => items.filter((e) => e.eventType === "NEWS"),
        [items]
    );

    return (
        <main className="container">
            {news.length > 0 && <h2 style={{ margin: "8px 12px 0" }}>News</h2>}
            {news.map((e) => (
                <EventCard key={e.id} event={e} />
            ))}
        </main>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <nav className="topnav">
                <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                    Home
                </NavLink>
                <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>
                    News
                </NavLink>
                <NavLink to="/announcements" className={({ isActive }) => (isActive ? "active" : "")}>
                    Announcements
                </NavLink>

                <span className="divider" />

                <NavLink to="/admin/news" className={({ isActive }) => (isActive ? "active" : "")}>
                    Admin · News
                </NavLink>
                <NavLink
                    to="/admin/announcements"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Admin · Announcements
                </NavLink>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />

                {/* Admin */}
                <Route path="/admin/news" element={<AdminNewsPage />} />
                <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
            </Routes>
        </BrowserRouter>
    );
}