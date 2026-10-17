import { createSupabaseServerClient } from "@/lib/supabase/server";
import IdeasClient, { VentureIdea } from "./IdeasClient";

export const metadata = {
  title: "Venture Ideas · FORJ",
  description: "AI-assisted venture validation, milestone tracking, and incubator bridging for student and early-career founders.",
};

export default async function IdeasPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialIdeas: VentureIdea[] = [
    {
      id: "idea-1",
      title: "AgriSense: Decentralized Cold-Chain Telemetry",
      pitch:
        "Low-cost IoT sensors paired with open REST telemetry enabling smallholder vegetable farmers in Maharashtra to guarantee cold-chain transit logs directly to regional supermarket distribution hubs.",
      category: "AgriTech",
      stage: "Prototype",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      validation_score: 87,
      validation_breakdown: {
        problem_fit: 28,
        market_size: 22,
        moat_and_tech: 21,
        execution_risk: 16,
      },
      ai_feedback:
        "Exceptional alignment with Smart India post-harvest waste reduction priorities. Hardware supply chain is the primary friction point. Target 10 pilot farm co-ops to prove unit economics before capital expenditure.",
      milestones: [
        { id: "m1", title: "Complete 10 farmer co-op interviews in Nashik", completed: true },
        { id: "m2", title: "Assemble 3 ESP32 temperature telemetry prototypes", completed: true },
        { id: "m3", title: "Run 1 live transit trial with regional distributor", completed: false },
      ],
      incubator_ready: false,
    },
    {
      id: "idea-2",
      title: "PulseGuard: Zero-Trust Clinic Records for Rural PHCs",
      pitch:
        "Offline-first mobile EHR application syncing encrypted health records to ABDM (Ayushman Bharat Digital Mission) whenever opportunistic 4G connectivity is available.",
      category: "HealthTech",
      stage: "MVP",
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      validation_score: 92,
      validation_breakdown: {
        problem_fit: 29,
        market_size: 24,
        moat_and_tech: 22,
        execution_risk: 17,
      },
      ai_feedback:
        "High strategic synergy with public health infrastructure. Compliance with ABDM milestone 1, 2, and 3 certified. Strong candidate for BIRAC / NASSCOM healthcare incubator cohorts.",
      milestones: [
        { id: "m4", title: "Pass ABDM M1 sandbox compliance check", completed: true },
        { id: "m5", title: "Pilot with 5 rural PHC medical officers", completed: true },
        { id: "m6", title: "Obtain institutional ethics advisory clearance", completed: true },
      ],
      incubator_ready: true,
    },
    {
      id: "idea-3",
      title: "KavachAPI: Developer Sandbox for Indian UPI Fraud Detection",
      pitch:
        "Sub-15ms fraud detection API leveraging graph neural networks to catch money mule account rings across fast inter-bank UPI payment rails.",
      category: "FinTech",
      stage: "Idea",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      validation_score: 79,
      validation_breakdown: {
        problem_fit: 25,
        market_size: 21,
        moat_and_tech: 18,
        execution_risk: 15,
      },
      ai_feedback:
        "Massive enterprise TAM. Incumbents possess deeper historical transaction data; focus initial wedge on neo-banks and P2P lending platforms before approaching tier-1 banks.",
      milestones: [
        { id: "m7", title: "Benchmark latency on 10,000 synthetic transaction graph", completed: false },
        { id: "m8", title: "Publish open research paper on mule ring graph patterns", completed: false },
        { id: "m9", title: "Pitch to 3 fintech risk heads", completed: false },
      ],
      incubator_ready: false,
    },
  ];

  return <IdeasClient initialIdeas={initialIdeas} />;
}
