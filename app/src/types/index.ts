// =============================================================================
// TYPE DEFINITIES VOOR PROCESMODEL VASTGOED NEDERLAND
// =============================================================================

// Fase (voorheen Module) - de 4 hoofdfasen van de klantreis
export type Fase =
  | 'bereiken'
  | 'boeien'
  | 'binden'
  | 'behouden';

export type KlantreisStatus =
  | 'lead'
  | 'prospect'
  | 'aanvrager'
  | 'aanvrager-bestaand'
  | 'lid'
  | 'opzegger'
  | 'ex-lid';

export type Afdeling =
  | 'sales'
  | 'ledenadministratie'
  | 'legal'
  | 'finance'
  | 'marcom'
  | 'it'
  | 'deelnemingen'
  | 'bestuur';

// Onderverdeling van Deelnemingen
export type Deelneming = 'kolibri' | 'ovgp' | 'nivex';

export type Rol =
  | 'regiomanager'
  | 'sales-binnendienst'
  | 'ledenadministrateur'
  | 'senior-ledenadministrateur'
  | 'juridisch-adviseur'
  | 'compliance-officer'
  | 'financieel-medewerker'
  | 'credit-controller'
  | 'marketingmedewerker'
  | 'communicatieadviseur'
  | 'functioneel-beheerder'
  | 'applicatiebeheerder'
  | 'eventcoordinator'
  | 'opleidingscoordinator'
  | 'ambtelijk-secretaris'
  | 'gilderaad-voorzitter'
  | 'directeur'
  | 'bestuurslid';

export type ProcesFase =
  | 'leadgeneratie'
  | 'intake'
  | 'aanvraag'
  | 'beoordeling'
  | 'activatie'
  | 'onboarding'
  | 'lopend-lidmaatschap'
  | 'wijzigingen'
  | 'beeindiging';
export type NodeStatus = 'concept' | 'actief' | 'vervallen';
export type RaciType = 'R' | 'A' | 'C' | 'I';
export type EdgeType = 'standaard' | 'uitzondering' | 'escalatie' | 'terugkoppeling';

export interface RaciToewijzing {
  rol: Rol;
  afdeling: Afdeling;
  type: RaciType;
  toelichting?: string;
}

export interface VersieInfo {
  versie: string;
  eigenaar: Rol;
  eigenaarAfdeling: Afdeling;
  aanmaakDatum: string;
  laatstGewijzigd: string;
  status: NodeStatus;
  wijzigingsnotities?: string;
}

export interface ReglementReferentie {
  document: string;
  artikel: string;
  omschrijving: string;
  url?: string;
}

export interface Registratie {
  systeem: 'salesforce' | 'exact' | 'website' | 'pe-portaal' | 'sharepoint' | 'email';
  actie: string;
  veld?: string;
  verplicht: boolean;
}

export interface Uitzondering {
  id: string;
  conditie: string;
  actie: string;
  verantwoordelijke: Rol;
  escaleertNaar?: string;
}

export interface Handover {
  naarNode: string;
  conditie?: string;
  overdracht: string;
}

export interface Doorlooptijd {
  standaard: string;
  maximum: string;
  escalatieBij?: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface ProcesNode {
  id: string;
  titel: string;
  korteBeschrijving: string;
  fase: Fase;
  klantreisStatus: KlantreisStatus;
  procesFase: ProcesFase;
  primaireAfdeling: Afdeling;
  raci: RaciToewijzing[];
  trigger: string;
  inputs: string[];
  acties: string[];
  outputs: string[];
  doorlooptijd?: Doorlooptijd;
  handovers: Handover[];
  uitzonderingen: Uitzondering[];
  registraties: Registratie[];
  reglementReferenties: ReglementReferentie[];
  versie: VersieInfo;
  tags?: string[];
  notities?: string;
  position?: NodePosition;
}

export interface ProcesEdge {
  id: string;
  van: string;
  naar: string;
  label?: string;
  conditie?: string;
  type: EdgeType;
}

export interface Module {
  id: string;
  naam: string;
  beschrijving: string;
  actief: boolean;
  afhankelijkheden?: string[];
  versie: string;
}

export interface Swimlane {
  id: string;
  type: 'klantreis' | 'afdeling';
  label: string;
  volgorde: number;
  kleur?: string;
}

export interface FilterState {
  fases: string[];
  procesFases: string[];
  afdelingen: string[];
  klantreisStatussen: string[];
  zoekterm: string;
}

export interface User {
  id: string;
  email: string;
  naam: string;
  rol: 'viewer' | 'editor' | 'admin';
  afdeling?: Afdeling;
}

// Canvas - een opgeslagen procesmodel
export interface Canvas {
  id: string;
  naam: string;
  beschrijving?: string;
  aanmaakDatum: string;
  laatstGewijzigd: string;
  nodes: ProcesNode[];
  edges: ProcesEdge[];
}

// Metadata voor canvas lijst (zonder volledige data)
export interface CanvasMetadata {
  id: string;
  naam: string;
  beschrijving?: string;
  aanmaakDatum: string;
  laatstGewijzigd: string;
  nodeCount: number;
  edgeCount: number;
}

// Labels voor UI
export const FASE_LABELS: Record<Fase, string> = {
  'bereiken': 'Bereiken',
  'boeien': 'Boeien',
  'binden': 'Binden',
  'behouden': 'Behouden'
};

export const FASE_BESCHRIJVINGEN: Record<Fase, string> = {
  'bereiken': 'Marketing - nieuwe leden aantrekken',
  'boeien': 'Interesse wekken en vasthouden',
  'binden': 'Lidmaatschap activeren',
  'behouden': 'Campagnes, Webinars, Connect, Wijzigingen'
};

export const KLANTREIS_LABELS: Record<KlantreisStatus, string> = {
  'lead': 'Lead',
  'prospect': 'Prospect',
  'aanvrager': 'Aanvrager (nieuw)',
  'aanvrager-bestaand': 'Aanvrager (bestaand lid)',
  'lid': 'Lid',
  'opzegger': 'Opzegger',
  'ex-lid': 'Ex-lid'
};

export const AFDELING_LABELS: Record<Afdeling, string> = {
  'sales': 'Sales',
  'ledenadministratie': 'Ledenadministratie',
  'legal': 'Legal',
  'finance': 'Finance',
  'marcom': 'MarCom',
  'it': 'IT',
  'deelnemingen': 'Deelnemingen',
  'bestuur': 'Bestuur'
};

export const DEELNEMING_LABELS: Record<Deelneming, string> = {
  'kolibri': 'Kolibri',
  'ovgp': 'OVGP',
  'nivex': 'NIVEX'
};

export const PROCESFASE_LABELS: Record<ProcesFase, string> = {
  'leadgeneratie': 'Leadgeneratie',
  'intake': 'Intake',
  'aanvraag': 'Aanvraag',
  'beoordeling': 'Beoordeling',
  'activatie': 'Activatie',
  'onboarding': 'Onboarding',
  'lopend-lidmaatschap': 'Lopend lidmaatschap',
  'wijzigingen': 'Wijzigingen',
  'beeindiging': 'Beëindiging'
};

export const AFDELING_KLEUREN: Record<Afdeling, string> = {
  'sales': '#FFF3E0',
  'ledenadministratie': '#E8F5E9',
  'legal': '#FCE4EC',
  'finance': '#F3E5F5',
  'marcom': '#E0F7FA',
  'it': '#ECEFF1',
  'deelnemingen': '#EFEBE9',
  'bestuur': '#FFEBEE'
};

export const KLANTREIS_KLEUREN: Record<KlantreisStatus, string> = {
  'lead': '#E3F2FD',
  'prospect': '#BBDEFB',
  'aanvrager': '#90CAF9',
  'aanvrager-bestaand': '#64B5F6',
  'lid': '#4CAF50',
  'opzegger': '#FF9800',
  'ex-lid': '#9E9E9E'
};

export const FASE_KLEUREN: Record<Fase, string> = {
  'bereiken': '#E8F5E9',
  'boeien': '#FFF3E0',
  'binden': '#E3F2FD',
  'behouden': '#F3E5F5'
};
