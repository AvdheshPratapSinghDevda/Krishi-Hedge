import StatCard from "@/components/StatCard";
import CropList from "@/components/CropList";
import CropChart from "@/components/CropChart";
import ContractsListClient from "@/components/ContractsListClient";
import type { AdminContract } from "@/types";
import dummyContracts from "@/data/dummyContracts";

async function fetchContracts(): Promise<AdminContract[]> {
  try {
    // Fetch from local admin API which connects to Supabase
    const res = await fetch(`http://localhost:3001/api/contracts`, { cache: "no-store" });
    if (!res.ok) {
      console.error('[Admin Dashboard] Failed to fetch contracts from API');
      return [];
    }
    const data = (await res.json()) as AdminContract[];
    return data;
  } catch (error) {
    console.error('[Admin Dashboard] Error fetching contracts:', error);
    return [];
  }
}


export default async function AdminDashboardPage() {
  const contracts = await fetchContracts();
  const runtimeContracts = contracts.length === 0 ? dummyContracts : contracts;
  const total = runtimeContracts.length;
  const open = runtimeContracts.filter((c) => c.status === "CREATED").length;
  const matched = runtimeContracts.filter((c) => c.status === "MATCHED_WITH_BUYER_DEMO").length;

  const byCrop = runtimeContracts.reduce<Record<string, { count: number; quantity: number }>>((acc, c) => {
    const entry = acc[c.crop] || { count: 0, quantity: 0 };
    entry.count += 1;
    entry.quantity += c.quantity || 0;
    acc[c.crop] = entry;
    return acc;
  }, {});

  const statIcons = {
    file: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6" />
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
      </svg>
    ),
    users: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 20v-2a4 4 0 00-3-3.87" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  };

  return (
    <main className="overview-page-wrapper">
      <div className="overview-container">
        <div className="overview-hero">
          <h2>Overview</h2>
          <p>Compare smellformatts forworking and povscs for Krishi hedge.</p>
        </div>

        <section className="stats-grid">
          <StatCard label="Total Forwards" value={total} icon={statIcons.file} />
          <StatCard label="Open (Farmer Side)" value={open} icon={statIcons.user} accent="accent" />
          <StatCard label="Matched with Buyer (Demo)" value={matched} icon={statIcons.users} accent="accent" />
        </section>

        <section className="overview-panels">
          <CropList data={byCrop} />
          <CropChart contracts={runtimeContracts} />
          <div className="panel-card">
            <div className="panel-heading">Commentary (Demo)</div>
            <p className="commentary-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
            </p>
            <div className="commentary-bars">
              <span style={{ height: "30%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "100%" }} />
              <span style={{ height: "75%" }} />
            </div>
          </div>
        </section>

        <ContractsListClient contracts={runtimeContracts} />
      </div>
      </main>
  );
}

