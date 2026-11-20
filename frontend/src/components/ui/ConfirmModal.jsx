import { createPortal } from 'react-dom';

/**
 * Standard confirmation dialog — rendered on document.body (not inside sidebar)
 */
const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}) => {
  if (!open) return null;

  const confirmStyles =
    type === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-primary-500 hover:bg-primary-600 text-white';

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden
      />

      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-[420px] overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-red-100' : 'bg-primary-100'}`}>
              <svg className={`w-5 h-5 ${type === 'danger' ? 'text-red-600' : 'text-primary-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 id="confirm-modal-title" className="font-display font-bold text-lg text-gray-900">
                {title}
              </h2>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 sm:flex-none sm:min-w-[120px] px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${confirmStyles}`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none sm:min-w-[120px] px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
