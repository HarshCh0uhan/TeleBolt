import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import FilterSidebar from "../components/FilterSidebar";
import PlanCard from "../components/PlanCard";
import PlanTracker from "../components/PlanTracker";
import { getPlans } from "../api/plans.api";

const Home = () => {
  const [showTracker, setShowTracker] = useState(false);
  const [plans, setPlans] = useState([])
  const [filters, setFilters] = useState({
    operators: [],
    category: "",
    dailyData: 0,
    minValidity: 1,
    maxValidity: 365,
    minData: 1,
    maxData: 500,
    ottApps: [],
    minPrice: 99,
    maxPrice: 3000,
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

    if (filters.operators.length > 0) params.operator = filters.operators.join(',')
    
    if (filters.minPrice > 99) params.minPrice = filters.minPrice.toString()
    if (filters.maxPrice < 3000) params.maxPrice = filters.maxPrice.toString()
    
    if (filters.minData > 1) params.minData = filters.minData.toString()
    if (filters.maxData < 500) params.maxData = filters.maxData.toString()
    
    if (filters.dailyData > 0) params.dailyData = filters.dailyData.toString()
    
    if (filters.minValidity > 1) params.minValidity = filters.minValidity
    if (filters.maxValidity < 365) params.maxValidity = filters.maxValidity

    if(filters.category !== '')params.category = filters.category

    if (filters.ottApps.length > 0) params.ottApps = filters.ottApps.join(',')

    fetchPlans(params)
  }

  const handleClear = () => {
    setFilters({ operators: [], minPrice: 99, maxPrice: 3000, minData: 1, maxData:500, dailyData: 0, minValidity: 1, maxValidity: 365, category: "", ottApps: [] })
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