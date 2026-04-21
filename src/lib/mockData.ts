import { predictARIMA, ARIMAResult } from "./arima";
import { predictSLR, predictETS } from "./forecasting";

export type ModelType = "ARIMA" | "SLR" | "ETS";

export interface EconomicIndicator {
  year: number;
  cpi: number; // 消費者物價指數 (Consumer Price Index)
  ppi: number; // 生產者物價指數 (Producer Price Index)
  salary: number; // 薪資平均 (NTD)
  gasPrice: number; // 汽柴油均價 (NTD)
  electricity: number; // 電價 (NTD/度)
  interestRate: number; // 銀行平均放款利率 (%)
}

export const mockEconomicData: EconomicIndicator[] = [
  { year: 2014, cpi: 95.8, ppi: 98.5, salary: 45000, gasPrice: 33.5, electricity: 2.8, interestRate: 2.2 },
  { year: 2015, cpi: 95.5, ppi: 90.2, salary: 46000, gasPrice: 24.5, electricity: 2.7, interestRate: 2.0 },
  { year: 2016, cpi: 96.8, ppi: 88.0, salary: 46500, gasPrice: 23.0, electricity: 2.5, interestRate: 1.8 },
  { year: 2017, cpi: 97.4, ppi: 89.2, salary: 48000, gasPrice: 25.1, electricity: 2.5, interestRate: 1.6 },
  { year: 2018, cpi: 98.7, ppi: 91.5, salary: 50000, gasPrice: 28.2, electricity: 2.6, interestRate: 1.5 },
  { year: 2019, cpi: 99.2, ppi: 89.8, salary: 51200, gasPrice: 27.5, electricity: 2.6, interestRate: 1.4 },
  { year: 2020, cpi: 99.0, ppi: 85.0, salary: 52000, gasPrice: 22.1, electricity: 2.5, interestRate: 1.2 },
  { year: 2021, cpi: 100.9, ppi: 93.6, salary: 54000, gasPrice: 26.8, electricity: 2.5, interestRate: 1.1 },
  { year: 2022, cpi: 103.9, ppi: 105.2, salary: 57000, gasPrice: 30.2, electricity: 2.8, interestRate: 1.4 },
  { year: 2023, cpi: 106.5, ppi: 104.8, salary: 59000, gasPrice: 30.5, electricity: 3.1, interestRate: 2.0 },
  { year: 2024, cpi: 108.5, ppi: 103.5, salary: 61000, gasPrice: 29.8, electricity: 3.45, interestRate: 2.1 },
  { year: 2025, cpi: 110.2, ppi: 104.5, salary: 63500, gasPrice: 31.0, electricity: 3.8, interestRate: 2.2 },
];

export const calculateCAGR = (startValue: number, endValue: number, years: number) => {
  if (years <= 0 || startValue <= 0) return 0;
  return Math.pow(endValue / startValue, 1 / years) - 1;
};

// Calculate 5-year CAGR (using 2020 to 2025)
export const get5YearCAGR = () => {
    const startObj = mockEconomicData.find(d => d.year === 2020)!;
    const endObj = mockEconomicData.find(d => d.year === 2025)!;
    const years = 5;
    
    return {
        cpi: calculateCAGR(startObj.cpi, endObj.cpi, years),
        ppi: calculateCAGR(startObj.ppi, endObj.ppi, years),
        salary: calculateCAGR(startObj.salary, endObj.salary, years),
        gasPrice: calculateCAGR(startObj.gasPrice, endObj.gasPrice, years),
        electricity: calculateCAGR(startObj.electricity, endObj.electricity, years),
        interestRate: calculateCAGR(startObj.interestRate, endObj.interestRate, years),
    }
}

// Calculate predicted growth multiplier using selected model
export const getForecastMultipliers = (key: keyof EconomicIndicator, steps: number, model: ModelType = "ARIMA"): ARIMAResult => {
    if (key === 'year') return { value: 1, optimistic: 1, pessimistic: 1 };
    const series = mockEconomicData.map(d => Number(d[key]));
    const currentVal = series[series.length - 1];
    if (currentVal === 0) return { value: 1, optimistic: 1, pessimistic: 1 };

    let predicted;
    if (model === "SLR") {
        predicted = predictSLR(series, steps);
    } else if (model === "ETS") {
        predicted = predictETS(series, steps);
    } else {
        predicted = predictARIMA(series, steps);
    }
    
    return {
        value: predicted.value / currentVal,
        optimistic: predicted.optimistic / currentVal,
        pessimistic: predicted.pessimistic / currentVal
    };
};
