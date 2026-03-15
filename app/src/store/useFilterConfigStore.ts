import { create } from 'zustand';
import { useMemo } from 'react';
import type { FilterConfig, FilterCategorie, FilterOptie, FilterCategorieId } from '../types/filterConfig';
import * as filterConfigStorage from '../lib/filterConfigStorage';
import { defaultFilterConfig } from '../lib/defaultFilterConfig';

interface FilterConfigState {
  // Data
  config: FilterConfig;
  isLoaded: boolean;

  // Actions (async)
  loadConfig: () => Promise<void>;
  updateCategorie: (categorie: FilterCategorie) => Promise<void>;
  addOptie: (categorieId: FilterCategorieId, optie: FilterOptie) => Promise<void>;
  updateOptie: (categorieId: FilterCategorieId, optieId: string, updates: Partial<FilterOptie>) => Promise<void>;
  deleteOptie: (categorieId: FilterCategorieId, optieId: string) => Promise<void>;
  reorderOpties: (categorieId: FilterCategorieId, optieIds: string[]) => Promise<void>;
  resetConfig: () => Promise<void>;

  // Selectors
  getCategorie: (categorieId: FilterCategorieId) => FilterCategorie;
  getOptiesRecord: (categorieId: FilterCategorieId) => Record<string, string>;
  getKleurenRecord: (categorieId: FilterCategorieId) => Record<string, string>;
  getBeschrijvingenRecord: (categorieId: FilterCategorieId) => Record<string, string>;
}

export const useFilterConfigStore = create<FilterConfigState>((set, get) => ({
  config: defaultFilterConfig,
  isLoaded: false,

  loadConfig: async () => {
    const config = await filterConfigStorage.getFilterConfig();
    set({ config, isLoaded: true });
  },

  updateCategorie: async (categorie) => {
    await filterConfigStorage.updateFilterCategorie(categorie);
    const config = await filterConfigStorage.getFilterConfig();
    set({ config });
  },

  addOptie: async (categorieId, optie) => {
    await filterConfigStorage.addFilterOptie(categorieId, optie);
    const config = await filterConfigStorage.getFilterConfig();
    set({ config });
  },

  updateOptie: async (categorieId, optieId, updates) => {
    await filterConfigStorage.updateFilterOptie(categorieId, optieId, updates);
    const config = await filterConfigStorage.getFilterConfig();
    set({ config });
  },

  deleteOptie: async (categorieId, optieId) => {
    await filterConfigStorage.deleteFilterOptie(categorieId, optieId);
    const config = await filterConfigStorage.getFilterConfig();
    set({ config });
  },

  reorderOpties: async (categorieId, optieIds) => {
    await filterConfigStorage.reorderFilterOpties(categorieId, optieIds);
    const config = await filterConfigStorage.getFilterConfig();
    set({ config });
  },

  resetConfig: async () => {
    await filterConfigStorage.resetFilterConfig();
    const config = await filterConfigStorage.getFilterConfig();
    set({ config });
  },

  getCategorie: (categorieId) => get().config[categorieId],

  getOptiesRecord: (categorieId) => {
    const categorie = get().config[categorieId];
    return categorie.opties
      .filter((o) => o.actief)
      .sort((a, b) => a.volgorde - b.volgorde)
      .reduce((acc, optie) => { acc[optie.id] = optie.label; return acc; }, {} as Record<string, string>);
  },

  getKleurenRecord: (categorieId) => {
    const categorie = get().config[categorieId];
    return categorie.opties
      .filter((o) => o.actief && o.kleur)
      .reduce((acc, optie) => { acc[optie.id] = optie.kleur!; return acc; }, {} as Record<string, string>);
  },

  getBeschrijvingenRecord: (categorieId) => {
    const categorie = get().config[categorieId];
    return categorie.opties
      .filter((o) => o.actief && o.beschrijving)
      .reduce((acc, optie) => { acc[optie.id] = optie.beschrijving!; return acc; }, {} as Record<string, string>);
  },
}));

// Helper functies
function createOptiesRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter((o) => o.actief)
    .sort((a, b) => a.volgorde - b.volgorde)
    .reduce((acc, optie) => { acc[optie.id] = optie.label; return acc; }, {} as Record<string, string>);
}

function createKleurenRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter((o) => o.actief && o.kleur)
    .reduce((acc, optie) => { acc[optie.id] = optie.kleur!; return acc; }, {} as Record<string, string>);
}

function createBeschrijvingenRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter((o) => o.actief && o.beschrijving)
    .reduce((acc, optie) => { acc[optie.id] = optie.beschrijving!; return acc; }, {} as Record<string, string>);
}

// Selector hooks met useMemo voor stabiele referenties
export function useFaseLabels() {
  const opties = useFilterConfigStore((state) => state.config.fases.opties);
  return useMemo(() => createOptiesRecord(opties), [opties]);
}

export function useFaseKleuren() {
  const opties = useFilterConfigStore((state) => state.config.fases.opties);
  return useMemo(() => createKleurenRecord(opties), [opties]);
}

export function useFaseBeschrijvingen() {
  const opties = useFilterConfigStore((state) => state.config.fases.opties);
  return useMemo(() => createBeschrijvingenRecord(opties), [opties]);
}

export function useAfdelingLabels() {
  const opties = useFilterConfigStore((state) => state.config.afdelingen.opties);
  return useMemo(() => createOptiesRecord(opties), [opties]);
}

export function useAfdelingKleuren() {
  const opties = useFilterConfigStore((state) => state.config.afdelingen.opties);
  return useMemo(() => createKleurenRecord(opties), [opties]);
}

export function useKlantreisLabels() {
  const opties = useFilterConfigStore((state) => state.config.klantreisStatussen.opties);
  return useMemo(() => createOptiesRecord(opties), [opties]);
}

export function useKlantreisKleuren() {
  const opties = useFilterConfigStore((state) => state.config.klantreisStatussen.opties);
  return useMemo(() => createKleurenRecord(opties), [opties]);
}

export function useProcesFaseLabels() {
  const opties = useFilterConfigStore((state) => state.config.procesFases.opties);
  return useMemo(() => createOptiesRecord(opties), [opties]);
}
