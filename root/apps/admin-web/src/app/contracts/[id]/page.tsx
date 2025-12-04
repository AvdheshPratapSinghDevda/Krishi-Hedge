import Link from "next/link";

interface AdminContractDetail {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  strikePrice: number;
  deliveryWindow: string;
  status: string;
  createdAt: string;
  pdfUrl?: string;
  anchorTxHash?: string;
  anchorExplorerUrl?: string;
}

async function fetchContract(id: string): Promise<AdminContractDetail | null> {
  try {
    // Fetch from local admin API which connects to Supabase
    const res = await fetch(`http://localhost:3001/api/contracts`, { cache: "no-store" });
    if (!res.ok) {
      console.error('[Admin Contract Detail] Failed to fetch contracts from API');
      return null;
    }
    const contracts = (await res.json()) as AdminContractDetail[];
    return contracts.find(c => c.id === id) || null;
  } catch (error) {
    console.error('[Admin Contract Detail] Error fetching contract:', error);
    return null;
  }
}

interface PageProps {
  params: { id: string };
}

export default async function AdminContractDetailPage({ params }: PageProps) {
  const contract = await fetchContract(params.id);

  if (!contract) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl bg-zinc-50 px-4 pb-10 pt-6 text-sm">
        <header className="mb-4 flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700"
          >
            Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">Contract</h1>
        </header>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
          <p className="text-zinc-700">Contract not found.</p>
        </div>
      </main>
    );
  }

  const createdAt = new Date(contract.createdAt).toLocaleString();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl bg-zinc-50 px-4 pb-10 pt-6 text-sm">
      <header className="mb-4 flex items-center gap-2">
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700"
        >
          Back
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">Contract {contract.id}</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Summary</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {contract.crop} · {contract.quantity} {contract.unit}
            </p>
            <p className="mt-1 text-xs text-zinc-700">
              Strike price: ₹{contract.strikePrice} / {contract.unit}
            </p>
            <p className="mt-0.5 text-xs text-zinc-700">Window: {contract.deliveryWindow}</p>
            <p className="mt-0.5 text-xs text-zinc-700">Status: {contract.status}</p>
            <p className="mt-0.5 text-[11px] text-zinc-500">Created at {createdAt}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-700 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Links</p>
            <div className="mt-2 space-y-2">
              <Link
                href={`http://localhost:3000/contracts/${contract.id}`}
                target="_blank"
                className="block text-sm text-green-700 underline hover:text-green-800"
              >
                Open farmer view in PWA
              </Link>
              {contract.pdfUrl && (
                <Link
                  href={contract.pdfUrl}
                  target="_blank"
                  className="block text-sm text-green-700 underline hover:text-green-800"
                >
                  Open PDF
                </Link>
              )}
              {contract.anchorExplorerUrl && (
                <Link
                  href={contract.anchorExplorerUrl}
                  target="_blank"
                  className="block text-sm text-green-700 underline hover:text-green-800"
                >
                  View blockchain explorer
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-700 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Raw payload (debug)</p>
          <pre className="mt-2 max-h-80 overflow-auto rounded bg-zinc-900 p-3 text-[10px] text-zinc-100">
            {JSON.stringify(contract, null, 2)}
          </pre>
        </div>
      </section>
    </main>
  );
}

