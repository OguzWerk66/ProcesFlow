import { create } from 'zustand';
import { useMemo } from 'react';
import type { FilterConfig, FilterCategorie, FilterOptie, FilterCategorieId } from '../types/filterConfig';
import * as filterConfigStorage from '../lib/filterConfigStorage';

interface FilterConfigState {
  // Data
  config: FilterConfig;
  isLoaded: boolean;

  // Actions
  loadConfig: () => void;
  updateCategorie: (categorie: FilterCategorie) => void;
  addOptie: (categorieId: FilterCategorieId, optie: FilterOptie) => void;
  updateOptie: (categorieId: FilterCategorieId, optieId: string, updates: Partial<FilterOptie>) => void;
  deleteOptie: (categorieId: FilterCategorieId, optieId: string) => void;
  reorderOpties: (categorieId: FilterCategorieId, optieIds: string[]) => void;
  resetConfig: () => void;

  // Selectors
  getCategorie: (categorieId: FilterCategorieId) => FilterCategorie;
  getOptiesRecord: (categorieId: FilterCategorieId) => Record<string, string>;
  getKleurenRecord: (categorieId: FilterCategorieId) => Record<string, string>;
  getBeschrijvingenRecord: (categorieId: FilterCategorieId) => Record<string, string>;
}

export const useFilterConfigStore = create<FilterConfigState>((set, get) => ({
  config: filterConfigStorage.getFilterConfig(),
  isLoaded: false,

  loadConfig: () => {
    const config = filterConfigStorage.getFilterConfig();
    set({ config, isLoaded: true });
  },

  updateCategorie: (categorie) => {
    filterConfigStorage.updateFilterCategorie(categorie);
    set({ config: filterConfigStorage.getFilterConfig() });
  },

  addOptie: (categorieId, optie) => {
    filterConfigStorage.addFilterOptie(categorieId, optie);
    set({ config: filterConfigStorage.getFilterConfig() });
  },

  updateOptie: (categorieId, optieId, updates) => {
    filterConfigStorage.updateFilterOptie(categorieId, optieId, updates);
    set({ config: filterConfigStorage.getFilterConfig() });
  },

  deleteOptie: (categorieId, optieId) => {
    filterConfigStorage.deleteFilterOptie(categorieId, optieId);
    set({ config: filterConfigStorage.getFilterConfig() });
  },

  reorderOpties: (categorieId, optieIds) => {
    filterConfigStorage.reorderFilterOpties(categorieId, optieIds);
    set({ config: filterConfigStorage.getFilterConfig() });
  },

  resetConfig: () => {
    filterConfigStorage.resetFilterConfig();
    set({ config: filterConfigStorage.getFilterConfig() });
  },

  getCategorie: (categorieId) => {
    return get().config[categorieId];
  },

  getOptiesRecord: (categorieId) => {
    const categorie = get().config[categorieId];
    return categorie.opties
      .filter(o => o.actief)
      .sort((a, b) => a.volgorde - b.volgorde)
      .reduce((acc, optie) => {
        acc[optie.id] = optie.label;
        return acc;
      }, {} as Record<string, string>);
  },

  getKleurenRecord: (categorieId) => {
    const categorie = get().config[categorieId];
    return categorie.opties
      .filter(o => o.actief && o.kleur)
      .reduce((acc, optie) => {
        acc[optie.id] = optie.kleur!;
        return acc;
      }, {} as Record<string, string>);
  },

  getBeschrijvingenRecord: (categorieId) => {
    const categorie = get().config[categorieId];
    return categorie.opties
      .filter(o => o.actief && o.beschrijving)
      .reduce((acc, optie) => {
        acc[optie.id] = optie.beschrijving!;
        return acc;
      }, {} as Record<string, string>);
  },
}));

// Helper functie om record te maken van opties
function createOptiesRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter(o => o.actief)
    .sort((a, b) => a.volgorde - b.volgorde)
    .reduce((acc, optie) => {
      acc[optie.id] = optie.label;
      return acc;
    }, {} as Record<string, string>);
}

function createKleurenRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter(o => o.actief && o.kleur)
    .reduce((acc, optie) => {
      acc[optie.id] = optie.kleur!;
      return acc;
    }, {} as Record<string, string>);
}

function createBeschrijvingenRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter(o => o.actief && o.beschrijving)
    .reduce((acc, optie) => {
      acc[optie.id] = optie.beschrijving!;
      return acc;
    }, {} as Record<string, string>);
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
