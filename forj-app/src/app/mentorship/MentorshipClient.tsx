"use client";

import React, { useState } from "react";
import {
  Compass,
  Calendar,
  Clock,
  User,
  Star,
  CheckCircle2,
  Video,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";

export interface Mentor {
  id: string;
  name: string;
  headline: string;
  company: string;
  avatar_url?: string;
  domains: string[];
  bio: string;
  rating: number;
  sessions_completed: number;
  available_slots: string[];
}

export interface BookedSession {
  id: string;
  mentor_name: string;
  mentor_headline: string;
  date_time: string;
  topic: string;
  meeting_link: string;
  status: "confirmed" | "completed";
}

export default function MentorshipClient({
  mentors,
  initialBookings,
}: {
  mentors: Mentor[];
  initialBookings: BookedSession[];
}) {
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<BookedSession[]>(initialBookings);

  // Booking modal state
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sessionTopic, setSessionTopic] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredMentors = mentors.filter((m) => {
    const matchesDomain =
      selectedDomain === "all" ||
      m.domains.some((d) => d.toLowerCase().includes(selectedDomain.toLowerCase()));
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor || !selectedSlot) return;

    const newBooking: BookedSession = {
      id: `booking-${Date.now()}`,
      mentor_name: bookingMentor.name,
      mentor_headline: `${bookingMentor.headline} at ${bookingMentor.company}`,
      date_time: selectedSlot,
      topic: sessionTopic || "General Technical Advisory & Code Audit",
      meeting_link: "https://meet.forj.network/room-" + Math.floor(Math.random() * 89999 + 10000),
      status: "confirmed",
    };

    setBookings([newBooking, ...bookings]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingMentor(null);
      setSelectedSlot("");
      setSessionTopic("");
    }, 1500);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Hero Header ─────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: "2rem",
          background: "linear-gradient(135deg, var(--color-paper) 0%, var(--color-bone) 100%)",
          border: "1px solid var(--color-steel-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                background: "rgba(224, 90, 43, 0.12)",
                color: "var(--color-ember)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Vetted Engineering Advisory
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>1-on-1 Tactical Guidance</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.03em" }}>
            Mentorship & Advisory
          </h1>
          <p style={{ color: "var(--color-steel)", fontSize: "1rem", lineHeight: 1.6, marginTop: "0.3rem" }}>
            Book 1-on-1 office hours with verified senior engineers, tech leads, and venture advisors.
            Get candid architectural feedback, review code submissions, and accelerate milestone delivery.
          </p>
        </div>

        <div style={{ background: "var(--color-paper)", padding: "1rem 1.5rem", borderRadius: "8px", border: "1px solid var(--color-steel-light)", textAlign: "right" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
            Confirmed Sessions
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-ember)" }}>
            {bookings.length} Active
          </div>
        </div>
      </div>

      {/* ─── Active Booked Sessions (if any) ─────────────────────── */}
      {bookings.length > 0 && (
        <div className="card" style={{ padding: "1.5rem", background: "var(--color-paper)", border: "1px solid var(--color-steel-light)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "1rem" }}>
            Your Upcoming Advisory Sessions
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {bookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: "var(--color-bone)",
                  padding: "1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--color-steel-light)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-ink)" }}>{b.mentor_name}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>{b.mentor_headline}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "4px", background: "rgba(34, 197, 94, 0.15)", color: "#15803d" }}>
                    Confirmed
                  </span>
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--color-ink)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Calendar size={13} style={{ color: "var(--color-ember)" }} />
                  <strong>{b.date_time}</strong>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Topic: {b.topic}</p>

                <a
                  href={b.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                >
                  <Video size={13} /> Join Video Room
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Search and Domain Filters ────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "var(--color-paper)",
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--color-steel-light)",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Advisors" },
            { id: "systems", label: "Distributed Systems" },
            { id: "ai", label: "AI & ML" },
            { id: "founder", label: "Venture Strategy" },
            { id: "fintech", label: "FinTech & Payments" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDomain(tab.id)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: selectedDomain === tab.id ? "1.5px solid var(--color-ember)" : "1px solid var(--color-steel-light)",
                background: selectedDomain === tab.id ? "rgba(224, 90, 43, 0.1)" : "var(--color-bone)",
                color: selectedDomain === tab.id ? "var(--color-ember)" : "var(--color-steel)",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "240px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--color-steel)" }} />
          <input
            type="text"
            placeholder="Search by name, company, or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "0.45rem 0.75rem 0.45rem 2rem",
              borderRadius: "6px",
              border: "1px solid var(--color-steel-light)",
              background: "var(--color-bone)",
              fontSize: "0.82rem",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* ─── Mentors Grid ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="card"
            style={{
              padding: "1.75rem",
              background: "var(--color-paper)",
              border: "1px solid var(--color-steel-light)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(224, 90, 43, 0.12)",
                    color: "var(--color-ember)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {mentor.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-ink)" }}>
                    {mentor.name}
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>
                    {mentor.headline} • <strong>{mentor.company}</strong>
                  </div>
                </div>
              </div>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-ink)" }}>
                <Star size={13} style={{ fill: "var(--color-brass)", stroke: "var(--color-brass)" }} />
                {mentor.rating}
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", lineHeight: 1.5 }}>
              {mentor.bio}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {mentor.domains.map((dom, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    background: "var(--color-bone)",
                    color: "var(--color-ink)",
                    border: "1px solid var(--color-steel-light)",
                  }}
                >
                  {dom}
                </span>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--color-steel-light)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>
                {mentor.sessions_completed} sessions conducted
              </span>

              <button
                onClick={() => {
                  setBookingMentor(mentor);
                  setSelectedSlot(mentor.available_slots[0] || "");
                }}
                className="btn btn-primary"
                style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
              >
                Book Office Hours
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Booking Modal ───────────────────────────────────────── */}
      {bookingMentor && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100,
          }}
          onClick={() => !bookingSuccess && setBookingMentor(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "var(--color-paper)",
              padding: "2rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {bookingSuccess ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <CheckCircle2 size={48} style={{ color: "#15803d", margin: "0 auto 1rem" }} />
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-ink)" }}>Session Confirmed!</h3>
                <p style={{ color: "var(--color-steel)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
                  A video room link has been generated and added to your upcoming advisory sessions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-steel)", textTransform: "uppercase" }}>
                      Book 1-on-1 Office Hours
                    </span>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-ink)", marginTop: "0.2rem" }}>
                      {bookingMentor.name}
                    </h3>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-steel)" }}>
                      {bookingMentor.headline} at {bookingMentor.company}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingMentor(null)}
                    style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--color-steel)" }}
                  >
                    ×
                  </button>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.4rem" }}>
                    Select Available Timeslot (IST)
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "6px",
                      border: "1px solid var(--color-steel-light)",
                      background: "var(--color-bone)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {bookingMentor.available_slots.map((slot, i) => (
                      <option key={i} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.4rem" }}>
                    Discussion Agenda / Code Context
                  </label>
                  <textarea
                    rows={3}
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="e.g. Code review on Mini Job API challenge, advice on cold-chain sensor architecture, scaling PostgreSQL transactions..."
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "6px",
                      border: "1px solid var(--color-steel-light)",
                      background: "var(--color-bone)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--color-steel-light)", paddingTop: "1rem" }}>
                  <button type="button" onClick={() => setBookingMentor(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirm Free Advisory Session
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
