// =============================================================================
// FILTER CONFIGURATIE TYPES
// Dynamische filter opties die door beheerders aangepast kunnen worden
// =============================================================================

export interface FilterOptie {
  id: string;           // Unieke identifier (bv. "sales", "bereiken")
  label: string;        // Weergavenaam (bv. "Sales", "Bereiken")
  beschrijving?: string;// Optionele beschrijving
  kleur?: string;       // Optionele kleur (hex)
  volgorde: number;     // Sorteervolgorde
  actief: boolean;      // Kan uitgeschakeld worden
}

export type FilterCategorieId = 'fases' | 'afdelingen' | 'klantreisStatussen' | 'procesFases';

export interface FilterCategorie {
  id: FilterCategorieId;
  naam: string;         // Weergavenaam
  beschrijving?: string;
  opties: FilterOptie[];
}

export interface FilterConfig {
  fases: FilterCategorie;
  afdelingen: FilterCategorie;
  klantreisStatussen: FilterCategorie;
  procesFases: FilterCategorie;
}

// Helper type om opties te krijgen als Record voor backwards compatibility
export type FilterOptiesRecord = Record<string, string>;

// Converteer FilterOptie[] naar Record<string, string> voor legacy code
export function optiesToRecord(opties: FilterOptie[]): FilterOptiesRecord {
  return opties
    .filter(o => o.actief)
    .sort((a, b) => a.volgorde - b.volgorde)
    .reduce((acc, optie) => {
      acc[optie.id] = optie.label;
      return acc;
    }, {} as FilterOptiesRecord);
}

// Converteer FilterOptie[] naar Record<string, string> voor kleuren
export function optiesToKleurenRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter(o => o.actief && o.kleur)
    .reduce((acc, optie) => {
      acc[optie.id] = optie.kleur!;
      return acc;
    }, {} as Record<string, string>);
}

// Converteer FilterOptie[] naar Record<string, string> voor beschrijvingen
export function optiesToBeschrijvingenRecord(opties: FilterOptie[]): Record<string, string> {
  return opties
    .filter(o => o.actief && o.beschrijving)
    .reduce((acc, optie) => {
      acc[optie.id] = optie.beschrijving!;
      return acc;
    }, {} as Record<string, string>);
}
