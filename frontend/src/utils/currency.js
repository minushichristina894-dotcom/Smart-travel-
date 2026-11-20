/**
 * Format amounts in Sri Lankan Rupees (LKR)
 */
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const CURRENCY_CODE = 'LKR';
export const CURRENCY_SYMBOL = 'Rs.';
