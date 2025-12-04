import ContractsListClient from "@/components/ContractsListClient";
import Header from "@/components/Header";
import type { AdminContract } from "@/types";
import dummyContracts from "@/data/dummyContracts";

async function fetchContracts(): Promise<AdminContract[]> {
  try {
    // Fetch from local admin API which connects to Supabase
    const res = await fetch(`http://localhost:3001/api/contracts`, { cache: "no-store" });
    if (!res.ok) {
      console.error('[Admin Contracts] Failed to fetch contracts from API');
      return [];
    }
    return (await res.json()) as AdminContract[];
  } catch (error) {
    console.error('[Admin Contracts] Error fetching contracts:', error);
    return [];
  }
}

export default async function ContractsListPage() {
  const contracts = await fetchContracts();
  const runtimeContracts = contracts.length === 0 ? dummyContracts : contracts;
  return (
    <main className="overview-container">
      <Header title="Contracts" subtitle="Manage and audit all farmer forward contracts." />

      <ContractsListClient contracts={runtimeContracts} showTabs />
    </main>
  );
}
