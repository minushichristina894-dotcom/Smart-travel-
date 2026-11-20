/** Smart Travel Sri Lanka logo */
const AppLogo = ({
  size = 'md',
  variant = 'plain',
  className = '',
  alt = 'Smart Travel Sri Lanka',
}) => {
  const heights = {
    xs: 'h-7',
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-12',
  };

  const variants = {
    plain: '',
    soft: 'rounded-lg bg-white px-2 py-1 shadow-sm ring-1 ring-gray-100',
    hero: 'rounded-2xl bg-white px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/50',
  };

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`${heights[size] || heights.md} w-auto object-contain ${variants[variant] || ''} ${className}`}
    />
  );
};

export default AppLogo;
