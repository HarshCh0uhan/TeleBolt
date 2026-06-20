import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import FilterSidebar from "../components/FilterSidebar";
import PlanCard from "../components/PlanCard";
import CompareBar from "../components/CompareBar";
import PlanTracker from "../components/PlanTracker";
import mockPlans from "../data/mockPlans";
import { getPlans } from "../api/plans.api";

const Home = () => {
  const [showTracker, setShowTracker] = useState(false);
  const [plans, setPlans] = useState([])
  const [filters, setFilters] = useState({
    operators: [],
    maxPrice: 3000,
    minDailyData: 0,
  })

  const fetchPlans = async (activeFilters = {}) => {
    const {data} = await getPlans(activeFilters) 
  
    setPlans(data.plans);
  }  

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleFiltersChange = (key, value) => {
    setFilters(prev => ({...prev, [key]: value}))
  }

  const handleApply = () => {
    const params = {}

    if (filters.operators.length > 0) {
      params.operator = filters.operators.join(',')
    }
    
    if (filters.maxPrice < 3000) {
      params.maxPrice = filters.maxPrice.toString()
    }
    
    if (filters.minDailyData > 0) {
      params.dailyData = filters.minDailyData.toString()
    }

    fetchPlans(params)
  }

  const handleClear = () => {
    setFilters({ operators: [], maxPrice: 3000, minDailyData: 0 })
    fetchPlans();
  }

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="
            max-h-screen
            w-full
            overflow-y-auto
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
          <FilterSidebar 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApply={handleApply}
          onClear={handleClear} />

          <main className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
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

      {/* <CompareBar /> */}

      {showTracker && (
        <PlanTracker />
      )}
      </div>
    </div>
  );
};

export default Home;