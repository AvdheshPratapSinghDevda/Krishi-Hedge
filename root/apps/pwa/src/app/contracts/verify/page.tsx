'use client';

import { useState } from 'react';
import { Shield, CheckCircle2, XCircle, Loader2, Download, ExternalLink, Copy, FileText } from 'lucide-react';

export default function ContractVerifyPage() {
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  /**
   * Compute SHA-256 hash client-side
   */
  async function computeSHA256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hex;
  }

  /**
   * Verify contract from IPFS
   */
  async function verifyContract() {
    if (!cid.trim()) {
      setError('Please enter an IPFS CID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Fetch contract from IPFS
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
      console.log('Fetching from:', ipfsUrl);
      
      const response = await fetch(ipfsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
      }

      const contractText = await response.text();
      const contractData = JSON.parse(contractText);

      // Compute SHA-256 of fetched content
      const computedHash = await computeSHA256(contractText);

      // Load stored metadata from GitHub/local
      // In production, fetch from your GitHub raw URL
      const metaResponse = await fetch('/last_contract_meta.json');
      let storedHash = '';
      let expectedCID = '';
      
      if (metaResponse.ok) {
        const metadata = await metaResponse.json();
        storedHash = metadata.hash;  // Field is 'hash' not 'sha256Hash'
        expectedCID = metadata.cid;   // Field is 'cid' not 'ipfsCID'
      }

      // If no metadata file, allow manual verification
      if (!storedHash) {
        storedHash = prompt('Paste stored SHA-256 hash from your records:') || '';
      }

      const verified = computedHash === storedHash;

      setResult({
        verified,
        computedHash,
        storedHash,
        contractData,
        cid,
        ipfsUrl,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify contract');
    } finally {
      setLoading(false);
    }
  }

  // Demo loader removed: verification now expects a real CID + hash saved by the admin.
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Contract Verification</h1>
          </div>
          <p className="text-sm text-gray-600">
            Verify the authenticity and integrity of forward contracts using IPFS + SHA-256
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* How it Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            How Verification Works
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
            <li>Enter the IPFS CID (Content Identifier) of the contract</li>
            <li>System fetches contract from distributed IPFS network</li>
            <li>Computes SHA-256 hash of the content</li>
            <li>Compares with stored hash from GitHub timestamp</li>
            <li>Shows ✅ VERIFIED if hashes match (contract unchanged)</li>
          </ol>
        </div>

        {/* Verification Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            IPFS CID (Content Identifier)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              placeholder="bafkreih..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <button
            onClick={verifyContract}
            disabled={loading}
            className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying Contract...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Verify Contract
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Verification Result */}
        {result && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div className={`rounded-lg p-6 ${
              result.verified 
                ? 'bg-green-50 border-2 border-green-500' 
                : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {result.verified ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-green-900">✅ CONTRACT VERIFIED</h3>
                      <p className="text-sm text-green-700">
                        This contract is authentic and has not been tampered with
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-10 h-10 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-red-900">❌ VERIFICATION FAILED</h3>
                      <p className="text-sm text-red-700">
                        Hash mismatch detected - contract may have been modified
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Hash Comparison */}
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Computed SHA-256 (from IPFS):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono break-all">
                      {result.computedHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.computedHash)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Stored SHA-256 (from GitHub):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono break-all">
                      {result.storedHash || 'Not found - manual verification required'}
                    </code>
                    {result.storedHash && (
                      <button
                        onClick={() => copyToClipboard(result.storedHash)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contract Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Farmer:</p>
                  <p className="font-bold">{result.contractData.farmer?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">FPO:</p>
                  <p className="font-bold">{result.contractData.fpo?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Commodity:</p>
                  <p className="font-bold">{result.contractData.commodity?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity:</p>
                  <p className="font-bold">{result.contractData.terms?.quantity || 'N/A'} quintals</p>
                </div>
                <div>
                  <p className="text-gray-500">Strike Price:</p>
                  <p className="font-bold">₹{result.contractData.terms?.strikePrice || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Value:</p>
                  <p className="font-bold">₹{result.contractData.terms?.totalValue?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-xs mb-2">Created:</p>
                <p className="text-sm font-mono">{result.timestamp}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <a
                href={result.ipfsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View on IPFS
              </a>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result.contractData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `contract_${result.contractData.id}.json`;
                  a.click();
                }}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-2 text-sm">Why IPFS + SHA-256?</h4>
          <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
            <li><strong>Immutable Storage:</strong> IPFS content cannot be changed once uploaded</li>
            <li><strong>Cryptographic Proof:</strong> SHA-256 hash proves content authenticity</li>
            <li><strong>Distributed:</strong> No single point of failure</li>
            <li><strong>Free & Permanent:</strong> No ongoing costs, content persists</li>
            <li><strong>Publicly Verifiable:</strong> Anyone can verify independently</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
