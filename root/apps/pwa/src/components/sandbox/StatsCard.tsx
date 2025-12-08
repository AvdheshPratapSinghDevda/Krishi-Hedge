interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

export function StatsCard({ icon, label, value, color }: StatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <i className={`fa-solid ${icon} text-lg`}></i>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}