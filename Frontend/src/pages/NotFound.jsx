import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-[calc(100dvh-7.5rem)] items-center justify-center bg-[#181818] px-4 py-12 text-white lg:min-h-[calc(100dvh-4rem)]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-[#58c28d]/30 bg-[#58c28d]/10 text-[#58c28d]">
          <Compass className="h-8 w-8" />
        </div>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-[#58c28d]">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#58c28d] px-6 text-sm font-semibold text-[#181818] transition hover:brightness-110"
          >
            <Home className="h-4 w-4" />
            Browse plans
          </Link>
          <Link
            to="/coverage"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-[#262626] px-6 text-sm font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
          >
            Check coverage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
