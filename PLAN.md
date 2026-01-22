# Plan: Dynamische Filter Configuratie met Beheerdersdashboard

## Overzicht
De filters in de linkerzijbalk (Fase, Klantreis, Procesfase, Afdeling) worden nu dynamisch gemaakt. Een beheerder kan deze waarden toevoegen, wijzigen en verwijderen via een beheerdersdashboard.

## Huidige Situatie
- Filters zijn hardcoded als TypeScript types in `types/index.ts`
- Labels en kleuren zijn hardcoded in dezelfde file als `Record<Type, string>`
- De Sidebar leest deze constante waarden direct

## Nieuwe Architectuur

### 1. Nieuw Datamodel: FilterConfiguratie
Elke filter categorie wordt opgeslagen als configureerbare data:

```typescript
interface FilterOptie {
  id: string;           // Unieke identifier (bv. "sales", "bereiken")
  label: string;        // Weergavenaam (bv. "Sales", "Bereiken")
  beschrijving?: string;// Optionele beschrijving
  kleur?: string;       // Optionele kleur (hex)
  volgorde: number;     // Sorteervolgorde
  actief: boolean;      // Kan uitgeschakeld worden
}

interface FilterCategorie {
  id: string;           // "fases" | "afdelingen" | "klantreisStatussen" | "procesFases"
  naam: string;         // Weergavenaam
  opties: FilterOptie[];
}
```

### 2. Bestanden die aangemaakt/gewijzigd worden

#### Nieuwe bestanden:
- `app/src/types/filterConfig.ts` - Types voor configuratie
- `app/src/lib/filterConfigStorage.ts` - localStorage opslag (zoals canvasStorage)
- `app/src/lib/defaultFilterConfig.ts` - Standaardwaarden gebaseerd op huidige data
- `app/src/store/useFilterConfigStore.ts` - Aparte Zustand store voor configuratie
- `app/src/components/admin/AdminDashboard.tsx` - Beheerdersdashboard
- `app/src/components/admin/FilterCategorieEditor.tsx` - Editor per categorie
- `app/src/components/admin/FilterOptieDialog.tsx` - Dialog voor toevoegen/bewerken optie

#### Gewijzigde bestanden:
- `app/src/components/layout/Sidebar.tsx` - Leest nu van store i.p.v. constanten
- `app/src/components/layout/Header.tsx` - Knop naar Admin dashboard (voor admins)
- `app/src/App.tsx` - Route/dialog naar Admin dashboard
- `app/src/types/index.ts` - Behoud types maar maak ze dynamisch compatible

### 3. Dataopslag
- localStorage key: `procesflow-filter-config`
- Bij eerste keer laden: initialiseer met defaultFilterConfig (huidige waarden)
- Admin wijzigingen worden direct opgeslagen

### 4. Beheerdersdashboard UI
- Toegankelijk via tandwiel-icoon in Header (alleen voor rol=admin)
- Toont alle 4 filter categorieën als kaarten
- Per categorie:
  - Lijst van opties met drag-and-drop volgorde
  - Toevoegen knop
  - Per optie: bewerken, verwijderen, activeren/deactiveren
- Waarschuwing bij verwijderen als optie in gebruik is bij nodes

### 5. Validatie
- Kan geen optie verwijderen die nog gekoppeld is aan nodes (of waarschuwing tonen)
- ID moet uniek blijven binnen categorie
- Label is verplicht

## Implementatie Stappen

1. **Types en Interfaces** - Definieer FilterOptie, FilterCategorie interfaces
2. **Default Config** - Migreer huidige hardcoded waarden naar defaultFilterConfig
3. **Storage** - Implementeer localStorage functies
4. **Store** - Zustand store voor filter configuratie
5. **Admin Dashboard** - Hoofdscherm met categorieën
6. **Categorie Editor** - CRUD voor opties per categorie
7. **Optie Dialog** - Formulier voor toevoegen/bewerken
8. **Sidebar Update** - Lees van store, niet van constanten
9. **Header Update** - Admin knop toevoegen
10. **App Update** - Admin dashboard integreren

## Niet in scope (voor nu)
- Rollen beheer
- Kleurenpicker (tekstveld volstaat)
- Import/Export configuratie
- Meerdere talen
