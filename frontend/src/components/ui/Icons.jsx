/** Simple SVG icons — clean line style, no emoji */

const iconClass = (className = '') => `w-5 h-5 shrink-0 ${className}`;

export const IconUser = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const IconLock = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export const IconMapPin = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const IconThermometer = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v12.5A4.5 4.5 0 1015 11V3a3 3 0 00-6 0z" />
  </svg>
);

export const IconRain = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004.5 4 5.5 5.5 0 009-1.5M7 19l-1 2m4-2l-1 2m4-2l-1 2M5 12a7 7 0 0114 0" />
  </svg>
);

export const IconWind = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
  </svg>
);

export const IconHumidity = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4 6 6 8.5 6 12a6 6 0 11-12 0c0-3.5 2-6 6-12z" />
  </svg>
);

export const IconShieldCheck = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export const IconShieldAlert = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export const IconShieldX = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const IconCloudSun = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const IconHome = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const IconCalendar = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const IconClipboard = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export const IconUsers = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const IconSettings = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const IconGlobe = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const IconMail = ({ className }) => (
  <svg className={iconClass(className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

/** Risk report large icon by level */
export const RiskReportIcon = ({ level, className = 'w-16 h-16' }) => {
  const styles = {
    safe: { Icon: IconShieldCheck, bg: 'bg-green-100 text-green-600' },
    moderate: { Icon: IconShieldAlert, bg: 'bg-yellow-100 text-yellow-600' },
    high: { Icon: IconShieldX, bg: 'bg-red-100 text-red-600' },
  };
  const { Icon, bg } = styles[level] || styles.safe;
  return (
    <div className={`inline-flex items-center justify-center rounded-2xl p-4 ${bg}`}>
      <Icon className={className} />
    </div>
  );
};

const weatherIcons = {
  Temperature: IconThermometer,
  Rainfall: IconRain,
  'Wind Speed': IconWind,
  Humidity: IconHumidity,
};

export const WeatherStatIcon = ({ label, className }) => {
  const Icon = weatherIcons[label] || IconCloudSun;
  return <Icon className={className || 'w-6 h-6 text-primary-500'} />;
};
