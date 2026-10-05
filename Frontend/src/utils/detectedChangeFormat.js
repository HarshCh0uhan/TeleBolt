// Presentation helpers for detected-change proposals.

export const FIELD_LABELS = {
  Price: 'Price',
  ValidityDays: 'Validity',
  DailyData: 'Daily data',
  TotalData: 'Total data',
  Sms: 'SMS',
  NewPlan: 'New plan',
};

export const SOURCE_LABELS = {
  'vi-sync': 'Vi sync',
  'bsnl-sync': 'BSNL sync',
  manual: 'Manual',
};

export const formatFieldValue = (field, value) => {
  if (value === null || value === undefined) return '—';
  if (field === 'Price') return `₹${value}`;
  if (field === 'ValidityDays') return `${value} days`;
  if (field === 'DailyData' || field === 'TotalData') return `${value} GB`;
  if (field === 'Sms') return `${value}/day`;
  return String(value);
};
