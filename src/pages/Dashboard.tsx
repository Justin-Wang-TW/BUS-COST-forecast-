import { mockEconomicData, getForecastMultipliers } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const cpiGrowth = getForecastMultipliers("cpi", 5).value - 1;
  const salaryGrowth = getForecastMultipliers("salary", 5).value - 1;
  const gasGrowth = getForecastMultipliers("gasPrice", 5).value - 1;
  const electricityGrowth = getForecastMultipliers("electricity", 5).value - 1;
  
  return (
    <div className="flex-1 flex flex-col pt-4 bg-slate-50 animate-in fade-in duration-500">
      <div className="px-6 mb-4 flex justify-between items-end">
        <h2 className="text-xl font-bold text-slate-800">系統儀表板</h2>
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          推估基礎：近 10 年歷史巨集經濟數據
        </div>
      </div>
      
      <section className="mx-6 p-4 grid grid-cols-4 gap-4 bg-white border border-slate-200 rounded shadow-sm mb-6">
        <StatCard title="未來5年 CPI 推估漲幅" value={`+${(cpiGrowth * 100).toFixed(2)}%`} className="border-r border-slate-100 text-orange-600" />
        <StatCard title="未來5年 薪資推估漲幅" value={`+${(salaryGrowth * 100).toFixed(2)}%`} className="border-r border-slate-100 text-blue-600" />
        <StatCard title="未來5年 油價推估漲幅" value={`+${(gasGrowth * 100).toFixed(2)}%`} className="border-r border-slate-100 text-slate-700" />
        <StatCard title="未來5年 電價推估漲幅" value={`+${(electricityGrowth * 100).toFixed(2)}%`} className="text-slate-700" />
      </section>

      <div className="mx-6 bg-white p-4 rounded border border-slate-200 shadow-sm flex-1 mb-6 flex flex-col">
        <div className="mb-4 flex justify-between items-center border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold text-slate-700">近十年物價指數趨勢 (CPI vs PPI)</h3>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold">基期 2016=100</span>
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockEconomicData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Line type="monotone" name="CPI" dataKey="cpi" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
              <Line type="monotone" name="PPI" dataKey="ppi" stroke="#16a34a" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, className }: { title: string; value: string; className?: string }) {
  return (
    <div className={`px-2 text-center text-xs font-medium text-slate-500 ${className || ''}`}>
      {title}<br/>
      <span className="text-lg font-bold font-mono">{value}</span>
    </div>
  );
}
