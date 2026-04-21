// ARIMA implementation with scenarios
export interface ARIMAResult {
  value: number;
  optimistic: number;
  pessimistic: number;
}

export function predictARIMA(data: number[], steps: number): ARIMAResult {
  if (data.length < 3) {
      const v = data[data.length - 1] || 0;
      return { value: v, optimistic: v, pessimistic: v };
  }

  // 1. Calculate first differences (d=1) to make the time series stationary
  const diff: number[] = [];
  for (let i = 1; i < data.length; i++) {
    diff.push(data[i] - data[i - 1]);
  }

  // 2. Calculate the mean of the differences (Drift / Constant)
  const meanDiff = diff.reduce((a, b) => a + b, 0) / diff.length;

  // 3. Estimate AR(1) coefficient (phi) for the differenced series
  let num = 0;
  let den = 0;
  for (let i = 1; i < diff.length; i++) {
    num += (diff[i] - meanDiff) * (diff[i - 1] - meanDiff);
    den += Math.pow(diff[i - 1] - meanDiff, 2);
  }
  const phi = den === 0 ? 0 : num / den;

  // Calculate standard error (RMSE) of residuals
  let sumSqResid = 0;
  for (let i = 1; i < diff.length; i++) {
    const expected = meanDiff + phi * (diff[i - 1] - meanDiff);
    sumSqResid += Math.pow(diff[i] - expected, 2);
  }
  const rmse = Math.sqrt(sumSqResid / Math.max(1, diff.length - 1));

  // 4. Forecast future values recursively
  let currentVal = data[data.length - 1];
  let currentDiff = diff[diff.length - 1];
  let marginAcc = 0;

  for (let i = 0; i < steps; i++) {
    currentDiff = meanDiff + phi * (currentDiff - meanDiff);
    currentVal = currentVal + currentDiff;
    marginAcc += rmse * 1.28; // ~80% confidence interval step assumption
  }

  return {
    value: Math.max(0, currentVal),
    optimistic: Math.max(0, currentVal - marginAcc), // Optimistic = lower cost
    pessimistic: Math.max(0, currentVal + marginAcc), // Pessimistic = higher cost
  };
}
