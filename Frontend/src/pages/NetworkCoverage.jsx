import { useMemo, useState } from "react";
import { ExternalLink, MapPin, RadioTower, RotateCw, Signal } from "lucide-react";

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

const NETWORKS = ["5G", "4G", "3G", "2G"];

const NetworkCoverage = () => {
  const [carrierId, setCarrierId] = useState("jio");
  const [network, setNetwork] = useState("5G");
  const [mapKey, setMapKey] = useState(0);

  const carrier = useMemo(
    () => CARRIERS.find((item) => item.id === carrierId) || CARRIERS[0],
    [carrierId]
  );

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#58c28d]">
              Network coverage
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Check coverage near you</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Select a carrier, search your city or area inside the map, and inspect available
              mobile coverage. Coverage data is provided by nPerf's crowdsourced network map.
            </p>
          </div>

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

        <section className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5">
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
                    onClick={() => {
                      setCarrierId(item.id);
                      setMapKey((key) => key + 1);
                    }}
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

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Signal className="h-4 w-4 text-[#58c28d]" />
                Network
              </div>
              <div className="grid grid-cols-4 gap-2">
                {NETWORKS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNetwork(item)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      network === item
                        ? "border-[#58c28d]/40 bg-[#58c28d]/15 text-[#dff6ea]"
                        : "border-white/10 bg-[#262626] text-zinc-400 hover:border-[#58c28d]/30 hover:text-white"
                    }`}
                  >
                    {item}
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
                Use the map search/zoom controls to find your locality. Then use nPerf's map layer
                controls to focus on {network} coverage for {carrier.label}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMapKey((key) => key + 1)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
            >
              <RotateCw className="h-4 w-4" />
              Reload map
            </button>
          </aside>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f]">
            <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{carrier.label} coverage map</p>
                <p className="text-xs text-zinc-500">Selected focus: {network}</p>
              </div>
              <p className="text-xs text-zinc-500">Live external map by nPerf</p>
            </div>
            <iframe
              key={`${carrier.id}-${mapKey}`}
              src={carrier.url}
              title={`${carrier.label} coverage map`}
              className="h-[72vh] min-h-[540px] w-full bg-[#181818]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default NetworkCoverage;
