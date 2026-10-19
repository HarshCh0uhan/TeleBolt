import { useState, useMemo } from "react";
import { ExternalLink, Gauge, MapPin, RadioTower, X } from "lucide-react";

const CARRIERS = [
  {
    id: "jio",
    name: "Jio",
    label: "Jio Mobile",
    url: "https://www.nperf.com/en/map/IN/-/1991548.Jio-Mobile/signal",
  },
  {
    id: "airtel",
    name: "Airtel",
    label: "Airtel Mobile",
    url: "https://www.nperf.com/en/map/IN/-/1991549.Airtel-Mobile/signal",
  },
  {
    id: "vi",
    name: "Vi",
    label: "Vi Mobile",
    url: "https://www.nperf.com/en/map/IN/-/1991528.Vi-Mobile/signal",
  },
  {
    id: "bsnl",
    name: "BSNL",
    label: "BSNL Mobile",
    url: "https://www.nperf.com/en/map/IN/-/1991543.BSNL-Mobile/signal",
  },
];

const SPEED_TEST_URL = "https://www.nperf.com/en/";

const NetworkCoverage = () => {
  const [carrierId, setCarrierId] = useState("jio");
  const [testOpen, setTestOpen] = useState(false);

  const carrier = useMemo(
    () => CARRIERS.find((item) => item.id === carrierId) || CARRIERS[0],
    [carrierId]
  );

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#58c28d]">
              Network coverage
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Check coverage near you</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Pick a carrier, zoom into your locality, and inspect signal strength.
              Coverage data is provided by nPerf's crowdsourced network map.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTestOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-3 text-sm font-semibold text-[#181818] transition hover:bg-[#6dd9a0]"
            >
              <Gauge className="h-4 w-4" />
              Run speed test
            </button>
            <a
              href={carrier.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
            >
              Open full map
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="min-w-0 space-y-4 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <RadioTower className="h-4 w-4 text-[#58c28d]" />
                Carrier
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CARRIERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCarrierId(item.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      carrierId === item.id
                        ? "border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea]"
                        : "border-white/10 bg-[#262626] text-zinc-400 hover:border-[#58c28d]/30 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#262626] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <MapPin className="h-4 w-4 text-[#58c28d]" />
                How to check
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Search for your city or area in the map, zoom in, and use nPerf's
                layer controls to focus on {carrier.label} coverage.
              </p>
            </div>
          </aside>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f]">
            <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{carrier.label} coverage map</p>
                <p className="text-xs text-zinc-500">Live map by nPerf</p>
              </div>
            </div>

            {/* Preload every carrier's iframe. Only the active one is visible,
                so switching carriers never remounts or refetches — no flash, no
                perceived page reload. */}
            <div className="relative">
              {CARRIERS.map((item) => (
                <iframe
                  key={item.id}
                  src={item.url}
                  title={`${item.label} coverage map`}
                  className={`h-[60vh] min-h-[420px] w-full bg-[#181818] sm:h-[72vh] sm:min-h-[540px] ${
                    carrierId === item.id ? "block" : "hidden"
                  }`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {testOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Network speed test</p>
                <p className="text-xs text-zinc-500">Powered by nPerf</p>
              </div>
              <button
                type="button"
                onClick={() => setTestOpen(false)}
                aria-label="Close speed test"
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-zinc-300 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe
              src={SPEED_TEST_URL}
              title="nPerf speed test"
              className="h-[70vh] w-full bg-[#181818]"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkCoverage;
