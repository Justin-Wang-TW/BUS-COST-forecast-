import { useState, useMemo, useEffect } from "react";
import { getForecastMultipliers, ModelType } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, Legend } from "recharts";
import { auth, db, signInWithGoogle, signOut } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { Save, Folder, CheckSquare, BarChart2, Trash2, X } from "lucide-react";

type Industry = "bus_diesel" | "bus_ev" | "taxi";

interface CostMapping {
  id: string;
  label: string;
  indicator: "cpi" | "ppi" | "salary" | "gasPrice" | "electricity" | "interestRate" | "cpi_electricity" | "cpi_interest" | "none";
}

const BUS_DIESEL_ITEMS: CostMapping[] = [
  { id: "item_1", label: "1. 燃料", indicator: "gasPrice" },
  { id: "item_2", label: "2. 輪胎", indicator: "cpi" },
  { id: "item_3", label: "3. 車輛折舊", indicator: "cpi" },
  { id: "item_4", label: "4. 行車員工", indicator: "salary" },
  { id: "item_5", label: "5. 修車員工", indicator: "salary" },
  { id: "item_6", label: "6. 業務員工", indicator: "salary" },
  { id: "item_7", label: "7. 管理員工", indicator: "salary" },
  { id: "item_8", label: "8. 附屬油料", indicator: "gasPrice" },
  { id: "item_9", label: "9. 修車材料", indicator: "cpi" },
  { id: "item_10", label: "10. 行車附支", indicator: "cpi" },
  { id: "item_11", label: "11. 修車附支", indicator: "cpi" },
  { id: "item_12", label: "12. 業務費用", indicator: "cpi" },
  { id: "item_13", label: "13. 設備折舊", indicator: "cpi" },
  { id: "item_14", label: "14. 管理費用", indicator: "cpi_electricity" },
  { id: "item_15", label: "15. 稅捐費用", indicator: "cpi" },
  { id: "item_16", label: "16. 財務費用", indicator: "interestRate" },
  { id: "item_17", label: "17. 場站租金", indicator: "cpi" },
  { id: "item_18", label: "18. 通行費", indicator: "cpi" },
];

const BUS_EV_ITEMS: CostMapping[] = [
  { id: "item_1", label: "1. 燃料", indicator: "electricity" },
  { id: "item_2", label: "2. 輪胎", indicator: "cpi" },
  { id: "item_3", label: "3. 車輛折舊", indicator: "cpi" },
  { id: "item_4", label: "4. 行車員工", indicator: "salary" },
  { id: "item_5", label: "5. 修車員工", indicator: "salary" },
  { id: "item_6", label: "6. 業務員工", indicator: "salary" },
  { id: "item_7", label: "7. 管理員工", indicator: "salary" },
  { id: "item_8", label: "8. 附屬油料", indicator: "gasPrice" },
  { id: "item_9", label: "9. 修車材料", indicator: "cpi" },
  { id: "item_10", label: "10. 行車附支", indicator: "cpi" },
  { id: "item_11", label: "11. 修車附支", indicator: "cpi" },
  { id: "item_12", label: "12. 業務費用", indicator: "cpi" },
  { id: "item_13", label: "13. 設備折舊", indicator: "cpi" },
  { id: "item_14", label: "14. 管理費用", indicator: "cpi_electricity" },
  { id: "item_15", label: "15. 稅捐費用", indicator: "cpi" },
  { id: "item_16", label: "16. 財務費用", indicator: "interestRate" },
  { id: "item_17", label: "17. 場站租金", indicator: "cpi" },
  { id: "item_18", label: "18. 通行費", indicator: "cpi" },
];

const TAXI_ITEMS: CostMapping[] = [
  { id: "taxi_1", label: "1. 燃油與電能", indicator: "gasPrice" },
  { id: "taxi_2", label: "2. 附屬油料", indicator: "gasPrice" },
  { id: "taxi_3", label: "3. 車輛折舊", indicator: "cpi" },
  { id: "taxi_4", label: "4. 輪胎", indicator: "cpi" },
  { id: "taxi_5", label: "5. 維修費用", indicator: "cpi" },
  { id: "taxi_6", label: "6. 駕駛員薪資與福利", indicator: "salary" },
  { id: "taxi_7", label: "7. 行車附支", indicator: "cpi" },
  { id: "taxi_8", label: "8. 管理及財務費", indicator: "cpi_interest" },
  { id: "taxi_9", label: "9. 規費與稅捐", indicator: "none" },
  { id: "taxi_10", label: "10. 車輛保險費", indicator: "cpi" },
  { id: "taxi_11", label: "11. 計費器", indicator: "cpi" },
  { id: "taxi_12", label: "12. 雜項", indicator: "cpi" },
];

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#9333ea', '#0891b2', '#db2777', '#ea580c', '#4f46e5', '#059669', '#be123c', '#d97706', '#7e22ce', '#3b82f6', '#22c55e', '#ef4444', '#f97316', '#a855f7'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const validPayload = payload.filter((p: any) => p.value > 0).sort((a: any, b: any) => b.value - a.value);
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-lg rounded-lg text-xs max-h-[220px] overflow-y-auto min-w-[200px] scrollbar-thin">
        <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1 sticky top-0 bg-white/95 backdrop-blur-sm z-10">{label}</p>
        <div className="space-y-1">
          {validPayload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600 truncate max-w-[120px]">{entry.name}</span>
              </div>
              <span className="font-mono font-medium text-slate-800 shrink-0">${Math.round(entry.value).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800 sticky bottom-0 bg-white/95 backdrop-blur-sm z-10">
          <span>總計</span>
          <span className="font-mono">${Math.round(validPayload.reduce((sum: number, p: any) => sum + p.value, 0)).toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export interface CostProfile {
  id: string;
  name: string;
  industry: string;
  baseYear: number;
  costs: Record<string, number>;
  createdAt: number;
}

export default function Projection() {
  const [industry, setIndustry] = useState<Industry>("bus_diesel");
  const [modelType, setModelType] = useState<ModelType>("ARIMA");
  const [baseYear, setBaseYear] = useState(2023);
  const [targetYears, setTargetYears] = useState(5);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [hasCalculated, setHasCalculated] = useState(false);
  
  const [profiles, setProfiles] = useState<CostProfile[]>([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  // Fetch Saved Profiles (Scenarios)
  useEffect(() => {
    if (!user) {
      setProfiles([]);
      return;
    }
    const q = query(collection(db, "users", user.uid, "profiles"), where("industry", "==", industry));
    const unsub = onSnapshot(q, (snap) => {
      const list: CostProfile[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as CostProfile);
      });
      setProfiles(list.sort((a,b) => b.createdAt - a.createdAt));
      setSelectedProfileIds(prev => prev.filter(id => list.some(p => p.id === id)));
    });
    return unsub;
  }, [user, industry]);

  // Load costs for specific industry whenever it changes, from Firebase or LocalStorage
  useEffect(() => {
    const fetchCosts = async () => {
      if (user) {
        setIsSyncing(true);
        try {
          const docRef = doc(db, 'users', user.uid, 'costs', industry);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().costs) {
             setCosts(docSnap.data().costs);
          } else {
             const saved = localStorage.getItem(`projection_costs_${industry}`);
             setCosts(saved ? JSON.parse(saved) : {});
          }
        } catch (e) {
          console.error("Firebase read error", e);
        }
        setIsSyncing(false);
      } else {
        const saved = localStorage.getItem(`projection_costs_${industry}`);
        setCosts(saved ? JSON.parse(saved) : {});
      }
      setHasCalculated(false);
    };
    
    fetchCosts();
  }, [industry, user]);

  // Save costs to local storage AND Firebase whenever they change
  useEffect(() => {
    try {
      if (Object.keys(costs).length > 0) {
        localStorage.setItem(`projection_costs_${industry}`, JSON.stringify(costs));
        
        if (user) {
          const syncTimeout = setTimeout(async () => {
             setIsSyncing(true);
             try {
                const docRef = doc(db, 'users', user.uid, 'costs', industry);
                await setDoc(docRef, {
                   userId: user.uid,
                   industry: industry,
                   costs: costs,
                   updatedAt: serverTimestamp()
                });
             } catch(e) {
                console.error("Firebase write error", e);
             }
             setIsSyncing(false);
          }, 1500);
          return () => clearTimeout(syncTimeout);
        }
      }
    } catch (e) {
      console.warn("Failed to save costs", e);
    }
  }, [costs, industry, user]);

  const getEffectiveMultiplier = useMemo(() => {
    return (indicator: CostMapping["indicator"], steps: number) => {
      switch (indicator) {
        case "cpi": return getForecastMultipliers("cpi", steps, modelType);
        case "ppi": return getForecastMultipliers("ppi", steps, modelType);
        case "salary": return getForecastMultipliers("salary", steps, modelType);
        case "gasPrice": return getForecastMultipliers("gasPrice", steps, modelType);
        case "electricity": return getForecastMultipliers("electricity", steps, modelType);
        case "interestRate": return getForecastMultipliers("interestRate", steps, modelType);
        case "cpi_electricity": {
           const cpi = getForecastMultipliers("cpi", steps, modelType);
           const elec = getForecastMultipliers("electricity", steps, modelType);
           return { value: (cpi.value+elec.value)/2, optimistic: (cpi.optimistic+elec.optimistic)/2, pessimistic: (cpi.pessimistic+elec.pessimistic)/2 };
        }
        case "cpi_interest": {
           const cpi = getForecastMultipliers("cpi", steps, modelType);
           const interest = getForecastMultipliers("interestRate", steps, modelType);
           return { value: (cpi.value+interest.value)/2, optimistic: (cpi.optimistic+interest.optimistic)/2, pessimistic: (cpi.pessimistic+interest.pessimistic)/2 };
        }
        default: return { value: 1, optimistic: 1, pessimistic: 1 };
      }
    };
  }, [modelType]);

  const handleCostChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setCosts(prev => ({ ...prev, [id]: value === '' ? 0 : (isNaN(num) ? 0 : num) }));
  };

  const activeItems = industry === "taxi" 
    ? TAXI_ITEMS 
    : industry === "bus_ev" 
      ? BUS_EV_ITEMS 
      : BUS_DIESEL_ITEMS;

  const handleSaveProfile = async () => {
    if (!user) return alert("請先登入才能儲存試算檔");
    if (!newProfileName.trim()) return alert("請輸入設定檔名稱");
    
    setIsSavingProfile(true);
    try {
      await addDoc(collection(db, "users", user.uid, "profiles"), {
        userId: user.uid,
        name: newProfileName.trim(),
        industry,
        baseYear,
        costs,
        createdAt: Date.now()
      });
      setNewProfileName("");
    } catch (e) {
      console.error(e);
      alert("儲存失敗");
    }
    setIsSavingProfile(false);
  };

  const handleDeleteProfile = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "profiles", id));
    } catch (e) {
       console.error(e);
    }
  };

  const calculateProjection = () => {
    setHasCalculated(true);
  };

  const results = useMemo(() => {
    let totalBase = 0;
    let totalOpt = 0;
    let totalNeu = 0;
    let totalPes = 0;
    
    const details = activeItems.map(item => {
      const baseCost = costs[item.id] || 0;
      const mults = getEffectiveMultiplier(item.indicator, targetYears);
      
      const futureOpt = baseCost * mults.optimistic;
      const futureNeu = baseCost * mults.value;
      const futurePes = baseCost * mults.pessimistic;
      
      totalBase += baseCost;
      totalOpt += futureOpt;
      totalNeu += futureNeu;
      totalPes += futurePes;

      return {
        ...item,
        baseCost,
        mults,
        futureOpt,
        futureNeu,
        futurePes,
      };
    });

    return { totalBase, totalOpt, totalNeu, totalPes, details };
  }, [costs, activeItems, targetYears, getEffectiveMultiplier]);

  const barChartData = useMemo(() => {
    if (!hasCalculated || results.totalBase === 0) return [];
    
    const pvData: any = { name: `${baseYear} (現況)` };
    const fvOptData: any = { name: `${baseYear + targetYears} (樂觀)` };
    const fvNeuData: any = { name: `${baseYear + targetYears} (基準)` };
    const fvPesData: any = { name: `${baseYear + targetYears} (悲觀)` };

    results.details.forEach(item => {
      pvData[item.label] = item.baseCost;
      fvOptData[item.label] = item.futureOpt;
      fvNeuData[item.label] = item.futureNeu;
      fvPesData[item.label] = item.futurePes;
    });

    return [pvData, fvOptData, fvNeuData, fvPesData];
  }, [hasCalculated, results, baseYear, targetYears]);

  const comparisonChartData = useMemo(() => {
    if (selectedProfileIds.length === 0) return [];
    const selectedProfiles = profiles.filter(p => selectedProfileIds.includes(p.id));
    
    return activeItems.map(item => {
      const row: any = { name: item.label.replace(/^\d+\.\s*/, '') };
      selectedProfiles.forEach(p => {
        row[p.name] = p.costs[item.id] || 0;
      });
      return row;
    });
  }, [selectedProfileIds, profiles, activeItems]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-300">
      <section className="p-4 flex flex-wrap lg:grid lg:grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 bg-white border-b border-slate-200 shrink-0">
        <div className="border-r border-slate-100 pr-4 text-center text-xs font-medium text-slate-500">
          選擇產業別<br/>
          <div className="flex bg-slate-100 p-1 rounded-md mt-1 mx-auto w-full gap-1 min-w-[200px] max-w-[280px]">
            <button
              onClick={() => { setIndustry("bus_diesel"); }}
              className={cn("flex-1 py-1 px-1 text-[10px] whitespace-nowrap font-medium rounded transition-colors", industry === "bus_diesel" ? "bg-white shadow-sm border border-slate-200 text-slate-800" : "text-slate-500 hover:text-slate-700")}
            >
              客運(柴油)
            </button>
            <button
              onClick={() => { setIndustry("bus_ev"); }}
              className={cn("flex-1 py-1 px-1 text-[10px] whitespace-nowrap font-medium rounded transition-colors", industry === "bus_ev" ? "bg-white shadow-sm border border-slate-200 text-slate-800" : "text-slate-500 hover:text-slate-700")}
            >
              客運(電動)
            </button>
            <button
              onClick={() => { setIndustry("taxi"); }}
              className={cn("flex-1 py-1 px-1 text-[10px] whitespace-nowrap font-medium rounded transition-colors", industry === "taxi" ? "bg-white shadow-sm border border-slate-200 text-slate-800" : "text-slate-500 hover:text-slate-700")}
            >
              計程車
            </button>
          </div>
        </div>
        <div className="border-r border-slate-100 px-2 text-center text-xs font-medium text-slate-500 flex flex-col justify-center">
          基礎年度 (PV)<br/>
          <input type="number" value={baseYear} onChange={e => setBaseYear(parseInt(e.target.value) || 2023)} className="text-lg font-bold text-slate-800 bg-transparent text-center border-0 p-0 focus:ring-0 w-full" />
        </div>
        <div className="border-r border-slate-100 px-2 text-center text-xs font-medium text-slate-500 flex flex-col justify-center">
          預測年限 (n)<br/>
          <input type="number" value={targetYears} onChange={e => setTargetYears(parseInt(e.target.value) || 5)} className="text-lg font-bold text-blue-600 bg-transparent text-center border-0 p-0 focus:ring-0 w-full" />
        </div>
        <div className="px-2 text-center text-xs font-medium text-slate-500 flex flex-col justify-center">
          預測模型<br/>
          <span className="text-lg font-bold text-blue-500 font-serif italic">{modelType === "ARIMA" ? "ARIMA(1,1,0)" : modelType === "SLR" ? "Linear Regression" : "Exponential Smoothing"}</span>
        </div>
        <div className="border-l border-slate-100 pl-4 text-center text-xs font-medium text-slate-500 flex flex-col items-center justify-center min-w-[90px]">
          {user ? (
             <div className="text-right flex flex-col items-end">
               <span className="truncate block w-24 text-[9px] text-slate-600 mb-1" title={user.email || ""}>{user.email?.split('@')[0]}</span>
               <div className="flex items-center gap-2">
                 <span className={cn("inline-block w-2.5 h-2.5 rounded-full", isSyncing ? "bg-yellow-400 animate-pulse" : "bg-green-500")}></span>
                 <button onClick={signOut} className="text-[10px] text-slate-400 hover:text-red-500 font-bold px-1 rounded hover:bg-red-50 transition-colors">登出</button>
               </div>
               <span className="text-[8px] text-slate-400 mt-1">{isSyncing ? "同步中..." : "雲端已同步"}</span>
             </div>
          ) : (
             <button onClick={signInWithGoogle} className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded font-bold hover:bg-blue-700 transition flex items-center shadow-sm">
               Google 登入
             </button>
          )}
        </div>
      </section>

      <div className="p-4 bg-white shrink-0 border-b border-slate-200 shadow-sm z-10 hidden md:block">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-sm font-bold text-slate-700">{targetYears} 年預測趨勢 (雙年度影響評估)</h3>
          <div className="flex bg-slate-100 p-1 rounded-md text-[10px] font-medium border border-slate-200">
            <button onClick={() => { setModelType("ARIMA"); setHasCalculated(false); }} className={cn("px-3 py-1 rounded transition-colors", modelType === "ARIMA" ? "bg-white shadow-sm text-slate-800 font-bold" : "text-slate-500 hover:text-slate-700")}>ARIMA</button>
            <button onClick={() => { setModelType("SLR"); setHasCalculated(false); }} className={cn("px-3 py-1 rounded transition-colors", modelType === "SLR" ? "bg-white shadow-sm text-slate-800 font-bold" : "text-slate-500 hover:text-slate-700")}>線性迴歸 (SLR)</button>
            <button onClick={() => { setModelType("ETS"); setHasCalculated(false); }} className={cn("px-3 py-1 rounded transition-colors", modelType === "ETS" ? "bg-white shadow-sm text-slate-800 font-bold" : "text-slate-500 hover:text-slate-700")}>指數平滑 (ETS)</button>
          </div>
        </div>
        <div className="h-[240px] w-full relative flex items-center justify-center">
            {hasCalculated && results.totalBase > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => '$' + Math.round(val).toLocaleString()} width={70} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  {results.details.map((item, index) => (
                    <Bar key={item.id} dataKey={item.label} stackId="a" fill={COLORS[index % COLORS.length]} maxBarSize={120} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full opacity-30">
                <BarChart width={240} height={180} data={[{ name: 'PV', value: 100 }, { name: 'FV', value: 120 }]}>
                  <Bar dataKey="value" fill="#cbd5e1" stackId="a" maxBarSize={60} />
                </BarChart>
                <span className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Pending Data</span>
              </div>
            )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden bg-slate-50">
        <div className="md:col-span-8 border-r border-slate-200 flex flex-col overflow-hidden bg-white">
          <div className="p-4 bg-slate-50 flex justify-between items-center shrink-0 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700">
              {industry === "bus_diesel" ? "汽車客運 (柴油車) 18 項" : industry === "bus_ev" ? "汽車客運 (電動車) 18 項" : "計程車客運 12 項"}成本明細輸入
            </h3>
            <div className="flex items-center gap-2">
              <input 
                 type="text" 
                 placeholder="設定檔名稱 (ex: 台中市-2023)" 
                 value={newProfileName}
                 onChange={e => setNewProfileName(e.target.value)}
                 className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-500 max-w-[150px]"
                 disabled={!user}
              />
              <button 
                 onClick={handleSaveProfile}
                 disabled={!user || isSavingProfile}
                 className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded flex items-center gap-1 font-bold disabled:opacity-50 transition-colors"
                 title={user ? "儲存為雲端設定檔" : "請先登入"}
              >
                <Save className="w-3 h-3" />
                <span>儲存</span>
              </button>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 content-start">
              {activeItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs p-1.5 bg-white border border-slate-200 rounded hover:border-blue-400 transition-colors">
                  <span className="text-slate-600 truncate mr-2" title={item.label}>{item.label}</span>
                  <div className="flex items-center focus-within:ring-1 focus-within:ring-blue-500 rounded">
                    <span className="text-slate-400 font-mono scale-90">$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={costs[item.id] || ''}
                      onChange={e => handleCostChange(item.id, e.target.value)}
                      className="w-24 text-right font-mono font-bold text-slate-800 bg-transparent border-0 p-0 py-0.5 focus:ring-0 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col overflow-hidden bg-slate-50 p-4">
          <div className="bg-slate-900 rounded-lg p-5 h-full text-white flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-700 pb-2 block mb-4">預測摘要報告</span>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">基礎總成本 (PV)</span>
                  <span className="font-mono text-sm">${Math.round(results.totalBase).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">預測 {baseYear + targetYears} 總成本 (基準)</span>
                  <span className="font-mono text-xl font-bold text-orange-400">
                    ${hasCalculated ? Math.round(results.totalNeu).toLocaleString() : "---"}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">推估區間 (樂觀 ~ 悲觀)</span>
                  <span className="font-mono text-xs text-slate-300">
                    {hasCalculated ? `$${Math.round(results.totalOpt).toLocaleString()} ~ $${Math.round(results.totalPes).toLocaleString()}` : "---"}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">成本漲幅區間 (%)</span>
                  <span className="font-mono text-green-400 text-xs">
                    {hasCalculated && results.totalBase > 0 ? `+${(((results.totalOpt / results.totalBase) - 1) * 100).toFixed(1)}% ~ +${(((results.totalPes / results.totalBase) - 1) * 100).toFixed(1)}%` : "0.0%"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex-1 overflow-auto -mx-2 max-h-48 mb-4 scrollbar-thin">
              <table className="w-full text-left text-[10px] whitespace-nowrap">
                <thead className="text-slate-500 sticky top-0 bg-slate-900 border-b border-slate-700 z-10">
                  <tr>
                    <th className="px-2 py-1 font-normal max-w-[80px]">成本項目</th>
                    <th className="px-2 py-1 font-normal text-right">基準推估</th>
                    <th className="px-2 py-1 font-normal text-right">區間 (樂觀~悲觀)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {results.details.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800">
                      <td className="px-2 py-1 truncate max-w-[80px]" title={item.label}>{item.label.replace(/^\d+\.\s*/, '')}</td>
                      <td className="px-2 py-1 text-right font-mono text-orange-300">${Math.round(item.futureNeu).toLocaleString()}</td>
                      <td className="px-2 py-1 text-right font-mono text-slate-400 text-[9px]">
                        ${Math.round(item.futureOpt).toLocaleString()} ~ ${Math.round(item.futurePes).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={calculateProjection} 
              className="mt-auto w-full py-3 bg-white text-slate-900 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-lg shrink-0"
            >
              EXECUTE / 執行推算
            </button>
          </div>
        </div>
      </div>
      
      {/* 儲存設定檔比較區 */}
      {user && (
        <div className="border-t border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Folder className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-700">雲端設定檔載入與比較 ({profiles.length})</h3>
          </div>
          <div className="flex flex-col md:flex-row h-[300px]">
            <div className="w-full md:w-64 border-r border-slate-100 p-2 overflow-y-auto bg-slate-50">
              {profiles.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">無設定檔。請在上方面板儲存。</div>
              ) : (
                <div className="space-y-1">
                  {profiles.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-200 rounded text-xs transition-colors bg-white border border-slate-100">
                      <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                        <input 
                          type="checkbox" 
                          checked={selectedProfileIds.includes(p.id)}
                          onChange={(e) => {
                             if (e.target.checked) setSelectedProfileIds(prev => [...prev, p.id]);
                             else setSelectedProfileIds(prev => prev.filter(id => id !== p.id));
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate text-slate-700 font-medium" title={p.name}>{p.name}</span>
                      </label>
                      <div className="flex items-center gap-1 ml-2">
                         <button 
                            onClick={() => { setCosts(p.costs); setBaseYear(p.baseYear); }} 
                            className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 px-2 py-0.5 rounded transition-colors"
                            title="載入數值至主表單"
                         >載入</button>
                         <button 
                            onClick={() => handleDeleteProfile(p.id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                         ><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 p-4 flex items-center justify-center bg-white">
               {selectedProfileIds.length === 0 ? (
                  <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                    <BarChart2 className="w-8 h-8 opacity-20" />
                    請勾選左側的設定檔，以生成視覺化比較圖
                  </div>
               ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => '$' + Math.round(val).toLocaleString()} axisLine={false} tickLine={false} width={60} />
                      <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} cursor={{ fill: '#f8fafc' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {profiles.filter(p => selectedProfileIds.includes(p.id)).map((p, i) => (
                        <Bar key={p.id} dataKey={p.name} fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
