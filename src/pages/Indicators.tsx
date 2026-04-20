import { useState } from "react";
import { mockEconomicData } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "cpi-ppi", label: "物價指數 (CPI/PPI)" },
  { id: "salary", label: "薪資漲幅" },
  { id: "gas", label: "油價漲幅" },
  { id: "electricity", label: "電價漲幅" },
  { id: "interest", label: "放款利率" },
];

export default function Indicators() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="flex-1 flex flex-col pt-4 bg-slate-50 animate-in fade-in duration-500 overflow-y-auto">
      <div className="px-6 mb-4">
        <h2 className="text-xl font-bold text-slate-800">總體經濟指標庫</h2>
      </div>
      
      <div className="mx-6 flex space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-px shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mx-6 bg-white p-4 rounded border border-slate-200 shadow-sm shrink-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart(activeTab)}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mx-6 mt-6 mb-6 bg-white rounded border border-slate-200 shadow-sm overflow-hidden shrink-0">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">年度</th>
              <th className="px-4 py-3 font-medium">CPI 指數</th>
              <th className="px-4 py-3 font-medium">PPI 指數</th>
              <th className="px-4 py-3 font-medium">平均薪資 (元)</th>
              <th className="px-4 py-3 font-medium">汽柴油均價 (公升)</th>
              <th className="px-4 py-3 font-medium">電價 (度)</th>
              <th className="px-4 py-3 font-medium">放款利率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockEconomicData.map((row) => (
              <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{row.year}</td>
                <td className="px-4 py-3 font-mono">{row.cpi}</td>
                <td className="px-4 py-3 font-mono">{row.ppi}</td>
                <td className="px-4 py-3 font-mono">{row.salary.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">{row.gasPrice}</td>
                <td className="px-4 py-3 font-mono">{row.electricity}</td>
                <td className="px-4 py-3 font-mono">{row.interestRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderChart(tabId: string) {
  switch (tabId) {
    case "cpi-ppi":
      return (
        <LineChart data={mockEconomicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="year" tick={{fill: '#888'}} />
          <YAxis domain={['auto', 'auto']} tick={{fill: '#888'}} />
          <Tooltip contentStyle={{ borderRadius: '8px' }} />
          <Legend />
          <Line type="monotone" dataKey="cpi" name="CPI" stroke="#2563eb" strokeWidth={2} />
          <Line type="monotone" dataKey="ppi" name="PPI" stroke="#16a34a" strokeWidth={2} />
        </LineChart>
      );
    case "salary":
      return (
        <LineChart data={mockEconomicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="year" tick={{fill: '#888'}} />
          <YAxis domain={['auto', 'auto']} tick={{fill: '#888'}} />
          <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => `${Number(value).toLocaleString()} 元`} />
          <Legend />
          <Line type="monotone" dataKey="salary" name="平均薪資" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      );
    case "gas":
      return (
        <LineChart data={mockEconomicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="year" tick={{fill: '#888'}} />
          <YAxis domain={['auto', 'auto']} tick={{fill: '#888'}} />
          <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => `${value} 元/公升`} />
          <Legend />
          <Line type="monotone" dataKey="gasPrice" name="汽柴油均價" stroke="#dc2626" strokeWidth={2} />
        </LineChart>
      );
    case "electricity":
      return (
        <LineChart data={mockEconomicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="year" tick={{fill: '#888'}} />
          <YAxis domain={['auto', 'auto']} tick={{fill: '#888'}} />
          <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => `${value} 元/度`} />
          <Legend />
          <Line type="monotone" dataKey="electricity" name="電價" stroke="#9333ea" strokeWidth={2} />
        </LineChart>
      );
    case "interest":
      return (
        <LineChart data={mockEconomicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="year" tick={{fill: '#888'}} />
          <YAxis domain={['auto', 'auto']} tick={{fill: '#888'}} />
          <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => `${value}%`} />
          <Legend />
          <Line type="monotone" dataKey="interestRate" name="銀行放款利率" stroke="#0891b2" strokeWidth={2} />
        </LineChart>
      );
    default:
      return null;
  }
}
