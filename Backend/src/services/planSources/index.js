import { VI_SOURCE, fetchViPlans } from "./vi.source.js";
import { BSNL_SOURCE, fetchBsnlPlans } from "./bsnl.source.js";
import { JIO_SOURCE, fetchJioPlans } from "./jio.source.js";
import { AIRTEL_SOURCE, fetchAirtelPlans } from "./airtel.source.js";

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
    },
    [AIRTEL_SOURCE]: {
        name: AIRTEL_SOURCE,
        operator: "Airtel",
        label: "Airtel (Bajaj Finserv recharge tables)",
        fetch: fetchAirtelPlans,
    },
};

export const DEFAULT_SOURCES = [VI_SOURCE, JIO_SOURCE, BSNL_SOURCE, AIRTEL_SOURCE];

export const getPlanSource = (name) => SOURCES[name] || null;

export const listPlanSources = () =>
    Object.values(SOURCES).map(({ name, operator, label }) => ({ name, operator, label }));

export { VI_SOURCE, JIO_SOURCE, BSNL_SOURCE, AIRTEL_SOURCE };
