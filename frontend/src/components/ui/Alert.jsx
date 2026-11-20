const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border-l-4 border ${styles[type]} animate-fade-in`}>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      )}
    </div>
  );
};

export default Alert;
