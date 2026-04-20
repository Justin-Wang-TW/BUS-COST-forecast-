import { ARIMAResult } from "./arima";

export function predictSLR(data: number[], steps: number): ARIMAResult {
  const n = data.length;
  if (n < 2) {
     const v = data[n - 1] || 0;
     return { value: v, optimistic: v, pessimistic: v };
  }
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let sumSqResid = 0;
  for(let i=0; i<n; i++) {
     const expected = intercept + slope * i;
     sumSqResid += Math.pow(data[i] - expected, 2);
  }
  const se = Math.sqrt(sumSqResid / Math.max(1, n - 2));

  const forecastVal = intercept + slope * (n + steps - 1);
  const margin = se * 1.28 * Math.sqrt(steps);

  return {
    value: Math.max(0, forecastVal),
    optimistic: Math.max(0, forecastVal - margin),
    pessimistic: Math.max(0, forecastVal + margin)
  };
}

export function predictETS(data: number[], steps: number): ARIMAResult {
  const n = data.length;
  if (n < 3) return predictSLR(data, steps);
  
  const alpha = 0.5;
  const beta = 0.3;
  
  let level = data[0];
  let trend = data[1] - data[0];
  
  let sumSqResid = 0;
  
  for (let i = 1; i < n; i++) {
     const prevLevel = level;
     const expected = level + trend;
     level = alpha * data[i] + (1 - alpha) * (level + trend);
     trend = beta * (level - prevLevel) + (1 - beta) * trend;
     
     sumSqResid += Math.pow(data[i] - expected, 2);
  }
  
  const se = Math.sqrt(sumSqResid / Math.max(1, n - 2));
  const forecastVal = level + steps * trend;
  const margin = se * 1.28 * Math.sqrt(steps);
  
  return {
    value: Math.max(0, forecastVal),
    optimistic: Math.max(0, forecastVal - margin),
    pessimistic: Math.max(0, forecastVal + margin)
  };
}
