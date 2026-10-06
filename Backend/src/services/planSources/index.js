import { VI_SOURCE, fetchViPlans } from "./vi.source.js";
import { BSNL_SOURCE, fetchBsnlPlans } from "./bsnl.source.js";
import { JIO_SOURCE, fetchJioPlans } from "./jio.source.js";

const BSNL_AUTO_ENABLED =
    process.env.BSNL_SYNC_MODE === "auto" ||
    (process.env.NODE_ENV !== "production" && process.env.BSNL_SYNC_MODE !== "manual");

// Registry of every plan source the sync service can run.
const SOURCES = {
    [VI_SOURCE]: {
        name: VI_SOURCE,
        operator: "VI",
        label: "Vi (myvi.in prepaid catalogue)",
        fetch: fetchViPlans,
    },
    [JIO_SOURCE]: {
        name: JIO_SOURCE,
        operator: "Jio",
        label: "Jio (mdmdata recharge API)",
        fetch: fetchJioPlans,
    },
    [BSNL_SOURCE]: {
        name: BSNL_SOURCE,
        operator: "BSNL",
        label: "BSNL (myBSNL recharge API)",
        fetch: fetchBsnlPlans,
        defaultEnabled: BSNL_AUTO_ENABLED,
        note: BSNL_AUTO_ENABLED
            ? ""
            : "Manual by default on production because BSNL often blocks datacenter hosts. Run scripts/plan-sync-run.mjs bsnl-sync from a reachable connection.",
    },
};

export const DEFAULT_SOURCES = [VI_SOURCE, JIO_SOURCE, ...(BSNL_AUTO_ENABLED ? [BSNL_SOURCE] : [])];

export const getPlanSource = (name) => SOURCES[name] || null;

export const listPlanSources = () =>
    Object.values(SOURCES).map(({ name, operator, label, defaultEnabled = true, note = "" }) => ({
        name,
        operator,
        label,
        defaultEnabled,
        note,
    }));

export { VI_SOURCE, JIO_SOURCE, BSNL_SOURCE };
