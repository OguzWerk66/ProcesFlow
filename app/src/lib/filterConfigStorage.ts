import type { FilterConfig, FilterCategorie, FilterOptie, FilterCategorieId } from '../types/filterConfig';
import { defaultFilterConfig } from './defaultFilterConfig';
import { supabase } from './supabase';

const CONFIG_ID = 'default';

export async function getFilterConfig(): Promise<FilterConfig> {
  const { data, error } = await supabase
    .from('filter_config')
    .select('config')
    .eq('id', CONFIG_ID)
    .single();

  if (error || !data) return defaultFilterConfig;
  return data.config as FilterConfig;
}

export async function saveFilterConfig(config: FilterConfig): Promise<void> {
  const { error } = await supabase
    .from('filter_config')
    .upsert({ id: CONFIG_ID, config }, { onConflict: 'id' });

  if (error) console.error('Fout bij opslaan filter configuratie:', error);
}

export async function getFilterCategorie(categorieId: FilterCategorieId): Promise<FilterCategorie> {
  const config = await getFilterConfig();
  return config[categorieId];
}

export async function updateFilterCategorie(categorie: FilterCategorie): Promise<void> {
  const config = await getFilterConfig();
  config[categorie.id] = categorie;
  await saveFilterConfig(config);
}

export async function addFilterOptie(categorieId: FilterCategorieId, optie: FilterOptie): Promise<void> {
  const config = await getFilterConfig();
  const categorie = config[categorieId];

  if (categorie.opties.some((o) => o.id === optie.id)) {
    throw new Error(`Optie met ID "${optie.id}" bestaat al`);
  }

  categorie.opties.push(optie);
  await saveFilterConfig(config);
}

export async function updateFilterOptie(
  categorieId: FilterCategorieId,
  optieId: string,
  updates: Partial<FilterOptie>
): Promise<void> {
  const config = await getFilterConfig();
  const categorie = config[categorieId];
  const optieIndex = categorie.opties.findIndex((o) => o.id === optieId);

  if (optieIndex === -1) throw new Error(`Optie met ID "${optieId}" niet gevonden`);

  if (updates.id && updates.id !== optieId) {
    if (categorie.opties.some((o) => o.id === updates.id)) {
      throw new Error(`Optie met ID "${updates.id}" bestaat al`);
    }
  }

  categorie.opties[optieIndex] = { ...categorie.opties[optieIndex], ...updates };
  await saveFilterConfig(config);
}

export async function deleteFilterOptie(categorieId: FilterCategorieId, optieId: string): Promise<void> {
  const config = await getFilterConfig();
  const categorie = config[categorieId];
  categorie.opties = categorie.opties.filter((o) => o.id !== optieId);
  await saveFilterConfig(config);
}

export async function reorderFilterOpties(categorieId: FilterCategorieId, optieIds: string[]): Promise<void> {
  const config = await getFilterConfig();
  const categorie = config[categorieId];

  const newOpties = optieIds
    .map((id, index) => {
      const optie = categorie.opties.find((o) => o.id === id);
      return optie ? { ...optie, volgorde: index + 1 } : null;
    })
    .filter((o): o is FilterOptie => o !== null);

  categorie.opties = newOpties;
  await saveFilterConfig(config);
}

export async function resetFilterConfig(): Promise<void> {
  await saveFilterConfig(defaultFilterConfig);
}

export function isOptieInGebruik(
  categorieId: FilterCategorieId,
  optieId: string,
  nodes: Array<{ fase?: string; primaireAfdeling?: string; klantreisStatus?: string; procesFase?: string }>
): boolean {
  switch (categorieId) {
    case 'fases': return nodes.some((n) => n.fase === optieId);
    case 'afdelingen': return nodes.some((n) => n.primaireAfdeling === optieId);
    case 'klantreisStatussen': return nodes.some((n) => n.klantreisStatus === optieId);
    case 'procesFases': return nodes.some((n) => n.procesFase === optieId);
    default: return false;
  }
}
