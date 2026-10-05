import { VI_SOURCE, fetchViPlans } from "./vi.source.js";
import { BSNL_SOURCE, fetchBsnlPlans } from "./bsnl.source.js";

// Registry of every plan source the sync service can run.
const SOURCES = {
    [VI_SOURCE]: {
        name: VI_SOURCE,
        operator: "VI",
        label: "Vi (myvi.in prepaid catalogue)",
        fetch: fetchViPlans,
    },
    [BSNL_SOURCE]: {
        name: BSNL_SOURCE,
        operator: "BSNL",
        label: "BSNL (myBSNL recharge API)",
        fetch: fetchBsnlPlans,
    },
};

export const DEFAULT_SOURCES = [VI_SOURCE, BSNL_SOURCE];

export const getPlanSource = (name) => SOURCES[name] || null;

export const listPlanSources = () =>
    Object.values(SOURCES).map(({ name, operator, label }) => ({ name, operator, label }));

export { VI_SOURCE, BSNL_SOURCE };
