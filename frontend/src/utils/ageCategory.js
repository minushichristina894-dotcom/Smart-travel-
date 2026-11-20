/** Three age categories — admin picks one; shown on customer pages too */
export const AGE_CATEGORIES = [
  { value: 'Kids', label: 'Kids', hint: 'Under 12 years' },
  { value: 'Adults', label: 'Adults', hint: '18 years and above' },
  { value: 'All Ages', label: 'All Ages', hint: 'Family friendly' },
];

export const DEFAULT_AGE_CATEGORY = 'All Ages';

export const normalizeAgeCategory = (value) => {
  const match = AGE_CATEGORIES.find((c) => c.value === value);
  return match ? match.value : DEFAULT_AGE_CATEGORY;
};

export const getAgeCategoryMeta = (value) => {
  const normalized = normalizeAgeCategory(value);
  return AGE_CATEGORIES.find((c) => c.value === normalized) || AGE_CATEGORIES[2];
};

export const ageBadgeClass = (value) => {
  const category = normalizeAgeCategory(value);
  if (category === 'Kids') return 'bg-sky-100 text-sky-800 border border-sky-200';
  if (category === 'Adults') return 'bg-violet-100 text-violet-800 border border-violet-200';
  return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
};
