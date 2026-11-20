import { forwardRef } from 'react';

/**
 * FormField — semantic field classes for viva-friendly styling
 */
export const FormField = ({ label, required, error, children, className = '' }) => (
  <div className={`booking-form-field-group ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Input = forwardRef(({ fieldClass = 'booking-form-field', className = '', ...props }, ref) => (
  <input ref={ref} className={`${fieldClass} ${className}`} {...props} />
));

Input.displayName = 'Input';

export const Select = forwardRef(({ fieldClass = 'booking-form-field', className = '', children, ...props }, ref) => (
  <select ref={ref} className={`${fieldClass} ${className}`} {...props}>
    {children}
  </select>
));

Select.displayName = 'Select';

export const TextArea = forwardRef(({ fieldClass = 'booking-form-field', className = '', ...props }, ref) => (
  <textarea ref={ref} className={`${fieldClass} ${className}`} {...props} />
));

TextArea.displayName = 'TextArea';

export default FormField;
