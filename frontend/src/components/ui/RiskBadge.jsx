const RiskBadge = ({ level }) => {
  const config = {
    safe: { label: 'Safe', dot: 'bg-green-500', class: 'bg-green-100 text-green-800 border-green-200' },
    moderate: { label: 'Moderate Risk', dot: 'bg-yellow-500', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    high: { label: 'High Risk', dot: 'bg-red-500', class: 'bg-red-100 text-red-800 border-red-200' },
  };

  const { label, dot, class: className } = config[level] || config.safe;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${className}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export default RiskBadge;
