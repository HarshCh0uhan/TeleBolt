// BSNL sells plans per circle. TeleBolt is committed to the Madhya Pradesh
// circle on purpose — the code default in `Backend/src/services/planSources/bsnl.source.js`
// is Madhya Pradesh, and this label tells the user which circle's prices they
// are looking at. If that choice ever changes, update both places.
export const BSNL_CIRCLE_LABEL = "Madhya Pradesh";
export const BSNL_CIRCLE_NOTE_SHORT = `MP pricing`;
export const BSNL_CIRCLE_NOTE_LONG = `BSNL prices shown for the ${BSNL_CIRCLE_LABEL} circle. Other circles may vary.`;
