
export const yearlyPlan = (plan) => {
    const multiplier = Math.ceil(365 / plan.validityDays)
    const yearlyCost = multiplier * plan.price
    const yearlyData = plan.totalData ? multiplier * plan.totalData : null;
    const obj = typeof plan.toObject === 'function' ? plan.toObject() : plan;
    return {
        ...obj,
        yearlyCost,
        yearlyData,
        costPerGB: yearlyData > 0 
            ? Math.round((yearlyCost / yearlyData) * 100) / 100
            : null 
    }
}