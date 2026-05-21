
export const yearlyPlan = (plan) => {
    const multiplier = Math.ceil(365 / plan.validityDays)
    return {
        ...plan.toObject(),
        yearlyCost: multiplier * plan.price,
        yearlyData: multiplier * plan.totalData
    }
}