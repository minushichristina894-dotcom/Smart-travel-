import { ageBadgeClass, getAgeCategoryMeta } from '../../utils/ageCategory';

const AgeCategoryBadge = ({ category, size = 'sm', showHint = false }) => {
  const meta = getAgeCategoryMeta(category);

  const sizeClass = size === 'lg'
    ? 'text-sm px-3 py-1.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex flex-col items-start ${showHint ? 'gap-0.5' : ''}`}>
      <span className={`inline-block font-semibold rounded-full ${sizeClass} ${ageBadgeClass(meta.value)}`}>
        {meta.label}
      </span>
      {showHint && (
        <span className="text-xs text-gray-500">{meta.hint}</span>
      )}
    </span>
  );
};

export default AgeCategoryBadge;
