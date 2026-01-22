import type { FilterConfig, FilterCategorie, FilterOptie, FilterCategorieId } from '../types/filterConfig';
import { defaultFilterConfig } from './defaultFilterConfig';

const STORAGE_KEY = 'procesflow-filter-config';

// Haal de volledige filter configuratie op uit localStorage
export function getFilterConfig(): FilterConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as FilterConfig;
    }
  } catch (error) {
    console.error('Fout bij laden filter configuratie:', error);
  }
  return defaultFilterConfig;
}

// Sla de volledige filter configuratie op in localStorage
export function saveFilterConfig(config: FilterConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Fout bij opslaan filter configuratie:', error);
  }
}

// Haal een specifieke categorie op
export function getFilterCategorie(categorieId: FilterCategorieId): FilterCategorie {
  const config = getFilterConfig();
  return config[categorieId];
}

// Update een specifieke categorie
export function updateFilterCategorie(categorie: FilterCategorie): void {
  const config = getFilterConfig();
  config[categorie.id] = categorie;
  saveFilterConfig(config);
}

// Voeg een nieuwe optie toe aan een categorie
export function addFilterOptie(categorieId: FilterCategorieId, optie: FilterOptie): void {
  const config = getFilterConfig();
  const categorie = config[categorieId];

  // Controleer of ID al bestaat
  if (categorie.opties.some(o => o.id === optie.id)) {
    throw new Error(`Optie met ID "${optie.id}" bestaat al`);
  }

  categorie.opties.push(optie);
  saveFilterConfig(config);
}

// Update een bestaande optie
export function updateFilterOptie(
  categorieId: FilterCategorieId,
  optieId: string,
  updates: Partial<FilterOptie>
): void {
  const config = getFilterConfig();
  const categorie = config[categorieId];
  const optieIndex = categorie.opties.findIndex(o => o.id === optieId);

  if (optieIndex === -1) {
    throw new Error(`Optie met ID "${optieId}" niet gevonden`);
  }

  // Als de ID wijzigt, controleer of nieuwe ID al bestaat
  if (updates.id && updates.id !== optieId) {
    if (categorie.opties.some(o => o.id === updates.id)) {
      throw new Error(`Optie met ID "${updates.id}" bestaat al`);
    }
  }

  categorie.opties[optieIndex] = { ...categorie.opties[optieIndex], ...updates };
  saveFilterConfig(config);
}

// Verwijder een optie
export function deleteFilterOptie(categorieId: FilterCategorieId, optieId: string): void {
  const config = getFilterConfig();
  const categorie = config[categorieId];

  categorie.opties = categorie.opties.filter(o => o.id !== optieId);
  saveFilterConfig(config);
}

// Herorden opties (wijzig volgorde)
export function reorderFilterOpties(categorieId: FilterCategorieId, optieIds: string[]): void {
  const config = getFilterConfig();
  const categorie = config[categorieId];

  // Sorteer opties volgens nieuwe volgorde
  const newOpties = optieIds
    .map((id, index) => {
      const optie = categorie.opties.find(o => o.id === id);
      if (optie) {
        return { ...optie, volgorde: index + 1 };
      }
      return null;
    })
    .filter((o): o is FilterOptie => o !== null);

  categorie.opties = newOpties;
  saveFilterConfig(config);
}

// Reset naar standaard configuratie
export function resetFilterConfig(): void {
  saveFilterConfig(defaultFilterConfig);
}

// Controleer of een optie in gebruik is door nodes
export function isOptieInGebruik(
  categorieId: FilterCategorieId,
  optieId: string,
  nodes: Array<{ fase?: string; primaireAfdeling?: string; klantreisStatus?: string; procesFase?: string }>
): boolean {
  switch (categorieId) {
    case 'fases':
      return nodes.some(n => n.fase === optieId);
    case 'afdelingen':
      return nodes.some(n => n.primaireAfdeling === optieId);
    case 'klantreisStatussen':
      return nodes.some(n => n.klantreisStatus === optieId);
    case 'procesFases':
      return nodes.some(n => n.procesFase === optieId);
    default:
      return false;
  }
}
