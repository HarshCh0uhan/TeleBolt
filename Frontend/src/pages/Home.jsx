import { useState } from "react";

import Navbar from "../components/Navbar";
import FilterSidebar from "../components/FilterSidebar";
import PlanCard from "../components/PlanCard";
import CompareBar from "../components/CompareBar";
import PlanTracker from "../components/PlanTracker";
import mockPlans from "../data/mockPlans";

const Home = () => {
  const [showTracker, setShowTracker] = useState(false);

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="
            max-h-[90vh]
            w-full
            overflow-y-auto
            rounded-3xl
            border
            border-white/10
            bg-[#1f1f1f]
            shadow-2xl
            scrollbar-thin
            scrollbar-track-[#1f1f1f]
            scrollbar-thumb-[#58c28d]/40
            hover:scrollbar-thumb-[#58c28d]/60
          ">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* everything else stays exactly same */}

        <div className="flex gap-6">
          <FilterSidebar />

          <main className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {mockPlans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onTrack={() => setShowTracker(true)}
                />
              ))}
            </div>
          </main>
        </div>
      </div>

      <CompareBar />

      {showTracker && (
        <PlanTracker />
      )}
      </div>
    </div>
  );
};

export default Home;