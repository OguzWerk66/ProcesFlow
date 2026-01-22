import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Filter, X, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useFilterConfigStore } from '../../store/useFilterConfigStore';
import type { FilterCategorieId } from '../../types/filterConfig';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  selectedCount?: number;
}

function CollapsibleSection({ title, children, defaultOpen = false, selectedCount = 0 }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2 border-b border-slate-100 pb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 px-1 hover:bg-slate-50 rounded transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </span>
        </div>
        {selectedCount > 0 && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
            {selectedCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="pl-2 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

interface DynamicCheckboxFilterProps {
  categorieId: FilterCategorieId;
  selected: string[];
  onChange: (values: string[]) => void;
}

function DynamicCheckboxFilter({
  categorieId,
  selected,
  onChange,
}: DynamicCheckboxFilterProps) {
  const categorie = useFilterConfigStore((state) => state.config[categorieId]);
  const sortedOpties = [...categorie.opties]
    .filter(o => o.actief)
    .sort((a, b) => a.volgorde - b.volgorde);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-0.5">
      {sortedOpties.map((optie) => (
        <label
          key={optie.id}
          className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded"
        >
          <input
            type="checkbox"
            checked={selected.includes(optie.id)}
            onChange={() => handleToggle(optie.id)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="text-[13px]">{optie.label}</span>
        </label>
      ))}
    </div>
  );
}

// Speciaal component voor Fase filter met kleuren en beschrijvingen
function FaseFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const faseCategorie = useFilterConfigStore((state) => state.config.fases);
  const sortedOpties = [...faseCategorie.opties]
    .filter(o => o.actief)
    .sort((a, b) => a.volgorde - b.volgorde);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1">
      {sortedOpties.map((optie) => (
        <label
          key={optie.id}
          className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 px-2 py-2 rounded"
          style={{
            backgroundColor: selected.includes(optie.id) ? optie.kleur : undefined,
          }}
        >
          <input
            type="checkbox"
            checked={selected.includes(optie.id)}
            onChange={() => handleToggle(optie.id)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 mt-0.5"
          />
          <div className="flex-1">
            <div className="font-medium text-[13px]">{optie.label}</div>
            {optie.beschrijving && (
              <div className="text-[11px] text-slate-500">{optie.beschrijving}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

export default function Sidebar() {
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const filters = useStore((state) => state.filters);
  const setFilters = useStore((state) => state.setFilters);
  const resetFilters = useStore((state) => state.resetFilters);

  const hasActiveFilters =
    filters.fases.length > 0 ||
    filters.procesFases.length > 0 ||
    filters.afdelingen.length > 0 ||
    filters.klantreisStatussen.length > 0 ||
    filters.zoekterm !== '';

  const totalActiveFilters =
    filters.fases.length +
    filters.procesFases.length +
    filters.afdelingen.length +
    filters.klantreisStatussen.length;

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="absolute left-4 top-20 z-10 bg-white p-2 rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
        title="Filters openen"
      >
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </button>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Filters</h2>
          {totalActiveFilters > 0 && (
            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">
              {totalActiveFilters}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
            >
              Reset
            </button>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-slate-100 rounded"
            title="Filters sluiten"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Zoekbalk */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Zoeken..."
              value={filters.zoekterm}
              onChange={(e) => setFilters({ zoekterm: e.target.value })}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {filters.zoekterm && (
              <button
                onClick={() => setFilters({ zoekterm: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Fase - bovenaan omdat het de hoofdfase aanduidt */}
        <CollapsibleSection
          title="Fase"
          defaultOpen={true}
          selectedCount={filters.fases.length}
        >
          <FaseFilter
            selected={filters.fases}
            onChange={(values) => setFilters({ fases: values })}
          />
        </CollapsibleSection>

        {/* Klantreis Status */}
        <CollapsibleSection
          title="Klantreis"
          selectedCount={filters.klantreisStatussen.length}
        >
          <DynamicCheckboxFilter
            categorieId="klantreisStatussen"
            selected={filters.klantreisStatussen}
            onChange={(values) => setFilters({ klantreisStatussen: values })}
          />
        </CollapsibleSection>

        {/* Procesfase */}
        <CollapsibleSection
          title="Procesfase"
          selectedCount={filters.procesFases.length}
        >
          <DynamicCheckboxFilter
            categorieId="procesFases"
            selected={filters.procesFases}
            onChange={(values) => setFilters({ procesFases: values })}
          />
        </CollapsibleSection>

        {/* Afdeling */}
        <CollapsibleSection
          title="Afdeling"
          selectedCount={filters.afdelingen.length}
        >
          <DynamicCheckboxFilter
            categorieId="afdelingen"
            selected={filters.afdelingen}
            onChange={(values) => setFilters({ afdelingen: values })}
          />
        </CollapsibleSection>
      </div>
    </aside>
  );
}
