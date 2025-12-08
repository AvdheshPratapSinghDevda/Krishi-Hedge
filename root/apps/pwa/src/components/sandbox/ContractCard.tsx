import { SandboxContract } from '@/lib/sandbox/types';

interface ContractCardProps {
  contract: SandboxContract;
  onClick: () => void;
  showBadge?: boolean;
}

export function ContractCard({ contract, onClick, showBadge = true }: ContractCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{contract.commodity}</h3>
          <p className="text-sm text-gray-500">{contract.quantity} {contract.unit}</p>
        </div>
        {showBadge && (
          <span className={`text-xs font-bold px-2 py-1 rounded ${statusColors[contract.status]}`}>
            {contract.status.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">Contract Price</p>
          <p className="text-xl font-bold text-purple-600">₹{contract.contractPrice.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Total Value</p>
          <p className="text-lg font-bold text-gray-800">₹{(contract.contractPrice * contract.quantity).toLocaleString()}</p>
        </div>
      </div>

      {contract.aiReasoning && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <i className="fa-solid fa-robot text-purple-600 mt-0.5"></i>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 mb-1">AI Feedback</p>
              <p className="text-xs text-gray-600">{contract.aiReasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}