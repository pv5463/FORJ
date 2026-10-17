import { createSupabaseServerClient } from "@/lib/supabase/server";
import MentorshipClient, { Mentor, BookedSession } from "./MentorshipClient";

export const metadata = {
  title: "Mentorship & Advisory · FORJ",
  description: "Book 1-on-1 office hours with verified senior engineers, tech leads, and venture advisors.",
};

export default async function MentorshipPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const mentors: Mentor[] = [
    {
      id: "mentor-1",
      name: "Vikram Sengupta",
      headline: "Principal Systems Architect",
      company: "Apex Velocity Logistics",
      domains: ["Distributed Systems", "Python/FastAPI", "High Throughput"],
      bio: "12+ years architecting fault-tolerant backend systems and message brokers processing 50k requests/second. Passionate about helping student builders master low-latency paradigms.",
      rating: 4.95,
      sessions_completed: 48,
      available_slots: [
        "Tomorrow, 4:00 PM - 4:45 PM",
        "Friday, 6:00 PM - 6:45 PM",
        "Saturday, 11:00 AM - 11:45 AM",
      ],
    },
    {
      id: "mentor-2",
      name: "Dr. Radhika Nair",
      headline: "Head of AI & Applied Research",
      company: "FinPulse NeoBank",
      domains: ["AI & ML", "Fraud Graph Detection", "Python"],
      bio: "Former IISc researcher specializing in graph neural networks and financial anomaly detection. Mentors candidates on algorithmic rigor, benchmark evaluation, and LLM safety.",
      rating: 4.98,
      sessions_completed: 62,
      available_slots: [
        "Thursday, 5:00 PM - 5:45 PM",
        "Saturday, 2:00 PM - 2:45 PM",
      ],
    },
    {
      id: "mentor-3",
      name: "Karan Johal",
      headline: "Co-Founder & CTO (Y-Combinator Alumni)",
      company: "Kavach Security",
      domains: ["Venture Strategy", "FinTech & Payments", "Early-stage Go-to-Market"],
      bio: "Built and scaled 2 venture-backed B2B SaaS companies from student thesis to series A. Guides early founders on unit economics, design partner LOIs, and technical hiring.",
      rating: 4.92,
      sessions_completed: 39,
      available_slots: [
        "Wednesday, 7:00 PM - 7:45 PM",
        "Sunday, 10:00 AM - 10:45 AM",
      ],
    },
    {
      id: "mentor-4",
      name: "Sneha Kulkarni",
      headline: "Senior Staff Engineer",
      company: "Solaria CleanTech",
      domains: ["TypeScript", "Node.js", "Cloud Infrastructure"],
      bio: "Leads renewable energy telemetry ingestion pipelines. Mentors engineers on clean code design patterns, Docker containerization, and static analysis tooling.",
      rating: 4.89,
      sessions_completed: 27,
      available_slots: [
        "Tomorrow, 6:30 PM - 7:15 PM",
        "Friday, 3:00 PM - 3:45 PM",
      ],
    },
  ];

  const initialBookings: BookedSession[] = [
    {
      id: "booking-demo-1",
      mentor_name: "Vikram Sengupta",
      mentor_headline: "Principal Systems Architect at Apex Velocity Logistics",
      date_time: "Tomorrow, 4:00 PM - 4:45 PM",
      topic: "Code Review on Mini Job Application API Sandbox Solution",
      meeting_link: "https://meet.forj.network/room-49210",
      status: "confirmed",
    },
  ];

  return <MentorshipClient mentors={mentors} initialBookings={initialBookings} />;
}
