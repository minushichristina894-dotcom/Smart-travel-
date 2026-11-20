const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className={`${sizes[size]} border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-primary-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
