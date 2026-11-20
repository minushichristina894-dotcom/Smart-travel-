/** Shows live data indicator with source and timestamp */
const LiveBadge = ({ source, fetchedAt, className = '' }) => {
  const formattedTime = fetchedAt
    ? new Date(fetchedAt).toLocaleString('en-LK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Just now';

  return (
    <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <span className="flex items-center gap-1.5 bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-semibold">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Live
      </span>
      {source && <span className="text-gray-500">{source}</span>}
      <span className="text-gray-400">· Updated {formattedTime}</span>
    </div>
  );
};

export default LiveBadge;
