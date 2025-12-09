'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";

export default function ContractDetailPage() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useParams();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string | undefined;
    if (!id) return;

    async function load() {
      try {
        const res = await fetch(`/api/contracts/${id}`);
        if (!res.ok) {
          console.error('Failed to load contract detail', await res.text());
          setContract(null);
        } else {
          const data = await res.json();
          setContract(data);
        }
      } catch (err) {
        console.error('Error loading contract detail', err);
        setContract(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">{t('contracts.detail.loading')}</div>;
  if (!contract) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">{t('contracts.detail.notFound')}</div>;

  async function handleDelete() {
    if (!confirm(t('contracts.detail.cancelConfirm'))) return;
    
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/contracts');
      } else {
        alert(t('contracts.detail.deleteFailed'));
      }
    } catch (e) {
      console.error(e);
      alert(t('contracts.detail.deleteError'));
    }
  }

  const txHash: string | undefined = contract.anchorTxHash || contract.anchor_tx_hash;
  const explorerUrl: string | undefined = contract.anchorExplorerUrl || contract.anchor_explorer_url;
  const pdfUrl: string | undefined = contract.pdfUrl || contract.pdf_url;
  const documentHash: string | undefined = contract.documentHash || contract.document_hash;
  const ipfsCid: string | undefined = contract.ipfsCid || contract.ipfs_cid;
  const isAnchored: boolean = Boolean(txHash && documentHash);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className={`p-3 text-center text-xs font-bold border-b ${contract.status === 'CREATED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
        {contract.status === 'CREATED' ? (
          <span><i className="fa-solid fa-spinner fa-spin mr-1"></i> {t('contracts.detail.statusWaiting')}</span>
        ) : (
          <span><i className="fa-solid fa-check mr-1"></i> {t('contracts.detail.statusMatched')}</span>
        )}
      </div>

      <div className="bg-white p-4 shadow-sm flex items-center gap-4 mb-4">
        <button onClick={() => router.push('/contracts')} className="text-gray-600"><i className="fa-solid fa-arrow-left"></i></button>
        <h2 className="font-bold text-lg">Contract #{contract.id.slice(-6)}</h2>
      </div>

      <div className="p-4 space-y-4">
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 bg-green-100 w-24 h-24 rounded-full flex items-end justify-center pb-4 rotate-45">
            <i className="fa-solid fa-shield-halved text-green-600 text-xl"></i>
          </div>
          
          <div className="grid grid-cols-2 gap-y-4 text-sm mb-4">
            <div>
              <span className="block text-xs text-gray-400 uppercase">{t('contracts.detail.cropLabel')}</span>
              <span className="font-bold text-gray-800">{contract.crop}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase">{t('contracts.detail.quantityLabel')}</span>
              <span className="font-bold text-gray-800">{contract.quantity} {contract.unit}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase">{t('contracts.detail.strikePriceLabel')}</span>
              <span className="font-bold text-gray-800">₹{contract.strikePrice}/{contract.unit}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase">{t('contracts.detail.expiryLabel')}</span>
              <span className="font-bold text-gray-800">{contract.deliveryWindow}</span>
            </div>
          </div>

          {/* Contract PDF Download - Prominent Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {ipfsCid || pdfUrl ? (
              <button
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md hover:from-red-600 hover:to-red-700 transition"
                onClick={() => {
                  if (ipfsCid) {
                    window.open(`https://ipfs.io/ipfs/${ipfsCid}`, '_blank');
                  } else if (pdfUrl) {
                    window.open(pdfUrl, '_blank');
                  }
                }}
              >
                <i className="fa-solid fa-file-pdf text-lg"></i>
                <span>Download Contract PDF</span>
                <i className="fa-solid fa-download"></i>
              </button>
            ) : (
              <div className="w-full bg-amber-50 border-2 border-amber-200 text-amber-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                <i className="fa-solid fa-clock animate-pulse"></i>
                <span>Contract PDF is being generated...</span>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">
              <i className="fa-solid fa-shield-halved text-green-600 mr-1"></i>
              Blockchain-verified and immutably stored on IPFS
            </p>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider">
              <i className="fa-solid fa-link"></i> {t('contracts.detail.blockchainTitle')}
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
              isAnchored ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'
            }`}>
              {isAnchored ? (
                <>
                  <i className="fa-solid fa-check"></i>
                  <span>Anchored</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-clock"></i>
                  <span>Pending anchor</span>
                </>
              )}
            </span>
          </div>

          <div className="mb-1 text-gray-500">{t('contracts.detail.txHashLabel')}</div>
          <div className="break-all text-white bg-gray-800 p-2 rounded mb-3">
            {txHash || 'Not anchored yet'}
          </div>

          <div className="mb-1 text-gray-500 mt-2">{t('contracts.detail.docHashLabel')}</div>
          <div className="break-all text-gray-200 bg-gray-800 p-2 rounded mb-3 border border-gray-700">
            {documentHash || t('contracts.detail.docHashPlaceholder')}
          </div>

          {ipfsCid && (
            <div className="mb-3 text-[11px] text-blue-200 flex items-center gap-2">
              <i className="fa-solid fa-database"></i>
              <button
                className="underline underline-offset-2 hover:text-white"
                onClick={() => window.open(`https://ipfs.io/ipfs/${ipfsCid}`, '_blank')}
              >
                View contract JSON on IPFS
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <button
              className="flex-1 border border-gray-600 text-gray-300 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!explorerUrl}
              onClick={() => {
                if (explorerUrl) window.open(explorerUrl, '_blank');
              }}
            >
              {t('contracts.detail.viewOnExplorer')} <i className="fa-solid fa-external-link-alt ml-1"></i>
            </button>
            <button
              className="flex-1 border border-dashed border-gray-700 text-gray-400 py-2 rounded hover:bg-gray-800 text-[11px]"
              onClick={() => window.open('/contracts/verify', '_blank')}
            >
              Advanced IPFS verification
            </button>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 flex gap-3">
          {contract.status === 'CREATED' && (
            <button 
              onClick={handleDelete}
              className="flex-1 bg-red-100 text-red-600 font-bold py-3 rounded-lg"
            >
              {t('contracts.detail.cancelOrder')}
            </button>
          )}
          <button className="flex-1 bg-gray-200 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed">
            {t('contracts.detail.markSettled')}
          </button>
        </div>
      </div>
    </div>
  );
}
