// Input validation & sanitization utilities for ZNPCV

export const LIMITS = {
  PAIR: 20,
  NOTES: 2000,
  PRICE: 20,       // string length for numeric inputs
  PERCENT: 6,
  LEVERAGE: 6,
  ACCOUNT: 12,
};

export const PRICE_RANGE = {
  MIN: 0.00001,
  MAX: 9999999,
};

export const RISK_RANGE = {
  MIN: 0.1,
  MAX: 20,
};

export const LEVERAGE_RANGE = {
  MIN: 1,
  MAX: 2000,
};

export const ACCOUNT_RANGE = {
  MIN: 1,
  MAX: 100000000,
};

/**
 * Strip HTML/script tags and dangerous patterns from free text.
 * Keeps plain text intact.
 */
export function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')           // remove HTML tags
    .replace(/javascript:/gi, '')       // remove js: URIs
    .replace(/on\w+\s*=/gi, '')         // remove event handlers
    .replace(/data:/gi, '')             // remove data: URIs
    .trim();
}

/**
 * Validate and normalize a free-text field (notes, pair, etc.)
 * Returns { value, error }
 */
export function validateText(value, maxLength, fieldName = 'Field') {
  const sanitized = sanitizeText(value);
  if (sanitized.length > maxLength) {
    return {
      value: sanitized.slice(0, maxLength),
      error: `${fieldName} darf maximal ${maxLength} Zeichen enthalten.`
    };
  }
  return { value: sanitized, error: null };
}

/**
 * Validate a numeric price/level field.
 * Returns { value, error }
 */
export function validatePrice(raw, fieldName = 'Preis') {
  if (raw === '' || raw === null || raw === undefined) return { value: '', error: null };
  const num = parseFloat(raw);
  if (isNaN(num)) return { value: '', error: `${fieldName} muss eine gültige Zahl sein.` };
  if (num < PRICE_RANGE.MIN) return { value: '', error: `${fieldName} muss größer als 0 sein.` };
  if (num > PRICE_RANGE.MAX) return { value: '', error: `${fieldName} ist zu groß.` };
  // Limit to 8 decimal places
  const normalized = parseFloat(num.toFixed(8)).toString();
  return { value: normalized, error: null };
}

/**
 * Validate risk percent input.
 */
export function validateRiskPercent(raw) {
  if (raw === '' || raw === null || raw === undefined) return { value: '', error: null };
  const num = parseFloat(raw);
  if (isNaN(num)) return { value: '', error: 'Risiko% muss eine Zahl sein.' };
  if (num < RISK_RANGE.MIN || num > RISK_RANGE.MAX) {
    return { value: '', error: `Risiko% muss zwischen ${RISK_RANGE.MIN} und ${RISK_RANGE.MAX} liegen.` };
  }
  return { value: raw, error: null };
}

/**
 * Validate leverage input.
 */
export function validateLeverage(raw) {
  if (raw === '' || raw === null || raw === undefined) return { value: '', error: null };
  const num = parseFloat(raw);
  if (isNaN(num) || !Number.isInteger(num)) return { value: '', error: 'Hebel muss eine ganze Zahl sein.' };
  if (num < LEVERAGE_RANGE.MIN || num > LEVERAGE_RANGE.MAX) {
    return { value: '', error: `Hebel muss zwischen ${LEVERAGE_RANGE.MIN} und ${LEVERAGE_RANGE.MAX} liegen.` };
  }
  return { value: raw, error: null };
}

/**
 * Validate account size.
 */
export function validateAccountSize(raw) {
  if (raw === '' || raw === null || raw === undefined) return { value: '', error: null };
  const num = parseFloat(raw);
  if (isNaN(num)) return { value: '', error: 'Kontogröße muss eine Zahl sein.' };
  if (num < ACCOUNT_RANGE.MIN || num > ACCOUNT_RANGE.MAX) {
    return { value: '', error: `Kontogröße muss zwischen ${ACCOUNT_RANGE.MIN} und ${ACCOUNT_RANGE.MAX} liegen.` };
  }
  return { value: raw, error: null };
}

/**
 * Sanitize a full formData object before saving.
 * Returns sanitized copy — never mutates original.
 */
export function sanitizeFormData(data) {
  return {
    ...data,
    notes: sanitizeText(data.notes || '').slice(0, LIMITS.NOTES),
    pair: sanitizeText(data.pair || '').slice(0, LIMITS.PAIR).toUpperCase(),
    entry_price: data.entry_price?.toString().slice(0, LIMITS.PRICE) || '',
    stop_loss: data.stop_loss?.toString().slice(0, LIMITS.PRICE) || '',
    take_profit: data.take_profit?.toString().slice(0, LIMITS.PRICE) || '',
    risk_percent: data.risk_percent?.toString().slice(0, LIMITS.PERCENT) || '',
    leverage: data.leverage?.toString().slice(0, LIMITS.LEVERAGE) || '',
    account_size: data.account_size?.toString().slice(0, LIMITS.ACCOUNT) || '',
  };
}