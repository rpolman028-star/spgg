import React, { useState } from 'react';
import { Utensils, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import { DailyMenuData, MenuItem } from '../types';

interface MenuCompositionProps {
  data: DailyMenuData;
  selectedItem?: MenuItem | null;
  onSelectItem?: (item: MenuItem | null) => void;
}

export const MenuComposition: React.FC<MenuCompositionProps> = ({
  data,
  selectedItem,
  onSelectItem,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (item: MenuItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      if (onSelectItem) onSelectItem(null);
    } else {
      setExpandedId(item.id);
      if (onSelectItem) onSelectItem(item);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 md:p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
          <Utensils className="w-4 h-4 stroke-[2.4]" />
        </div>
        <div>
          <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
            DAFTAR KOMPOSISI MENU
          </h3>
          <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Komponen makanan bergizi seimbang hari ini
          </p>
        </div>
      </div>

      {/* List of 5 items */}
      <div className="space-y-2">
        {data.menuItems.map((item) => {
          const isExpanded = expandedId === item.id || selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 dark:bg-emerald-950/40 shadow-2xs'
                  : 'border-slate-100 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggleExpand(item)}
                className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Number Badge with light green circular border */}
                  <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {item.id}
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {item.portionGrams}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-emerald-100/80 dark:border-emerald-900/60 text-xs animate-in fade-in duration-150">
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs leading-relaxed mb-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-emerald-800 dark:text-emerald-300 font-medium">
                      <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Kategori: {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
                      Takaran: {item.portionGrams} (~{item.caloriesApprox} Kcal)
                    </span>
                    {item.allergens && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md text-amber-800 dark:text-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Info: {item.allergens}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
