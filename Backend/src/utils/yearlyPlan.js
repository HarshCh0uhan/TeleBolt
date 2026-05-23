
export const yearlyPlan = (plan) => {
    const multiplier = Math.ceil(365 / plan.validityDays)
    const yearlyCost = multiplier * plan.price
    const yearlyData = multiplier * plan.totalData
    return {
        ...plan.toObject(),
        yearlyCost,
        yearlyData,
        costPerGB: yearlyData > 0 
            ? Math.round((yearlyCost / yearlyData) * 100) / 100
            : null 
    }
}