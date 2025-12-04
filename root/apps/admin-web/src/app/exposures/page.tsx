import Header from "@/components/Header";
import CropChart from "@/components/CropChart";
import type { AdminContract } from "@/types";
import dummyContracts from "@/data/dummyContracts";

async function fetchContracts(): Promise<AdminContract[]> {
  try {
    // Fetch from local admin API which connects to Supabase
    const res = await fetch(`http://localhost:3001/api/contracts`, { cache: "no-store" });
    if (!res.ok) {
      console.error('[Admin Exposures] Failed to fetch contracts from API');
      return [];
    }
    return (await res.json()) as AdminContract[];
  } catch (error) {
    console.error('[Admin Exposures] Error fetching contracts:', error);
    return [];
  }
}

const highlightCards = [
  {
    title: "Exposure Chart",
    body: "Detailed visualization of long/short positions would go here using Recharts or Chart.js.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-emerald-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-10" />
      </svg>
    ),
  },
  {
    title: "Regional Heatmap",
    body: "Map visualization showing concentration of risk by district.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    ),
  },
];

export default async function AdminExposuresPage() {
  const contracts = await fetchContracts();
  const runtimeContracts = contracts.length === 0 ? dummyContracts : contracts;
  return (
    <main className="overview-container">
      <Header title="Risk & Exposures" subtitle="Detailed breakdown of platform risk across crops and regions." />
      <section className="exposure-highlights">
        {highlightCards.map((card) => (
          <article key={card.title} className="exposure-card">
            <div className="exposure-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            <button type="button" className="ghost-link">
              View details →
            </button>
          </article>
        ))}
      </section>

      <section className="exposure-breakdown">
        <div>
          <h3>Exposure by Crop</h3>
          <p className="muted">Relative outstanding quantity per commodity.</p>
        </div>
        <CropChart contracts={runtimeContracts} />
      </section>
    </main>
  );
}
