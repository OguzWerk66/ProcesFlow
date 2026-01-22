/**
 * Type definities voor het Vastgoed Nederland Procesmodel
 * Versie: 1.0.0
 */

// =============================================================================
// ENUMERATIES
// =============================================================================

/** Klantreisstatus - de hoofdfasen van het lidmaatschap */
export type KlantreisStatus =
  | 'lead'
  | 'prospect'
  | 'aanvrager'
  | 'lid'
  | 'opzegger'
  | 'ex-lid';

/** Afdelingen binnen Vastgoed Nederland */
export type Afdeling =
  | 'sales'
  | 'ledenadministratie'
  | 'legal'
  | 'finance'
  | 'marcom'
  | 'it'
  | 'events-opleidingen'
  | 'gilde-organisatie'
  | 'bestuur';

/** Specifieke rollen per afdeling */
export type Rol =
  // Sales
  | 'regiomanager'
  | 'sales-binnendienst'
  // Ledenadministratie
  | 'ledenadministrateur'
  | 'senior-ledenadministrateur'
  // Legal
  | 'juridisch-adviseur'
  | 'compliance-officer'
  // Finance
  | 'financieel-medewerker'
  | 'credit-controller'
  // MarCom
  | 'marketingmedewerker'
  | 'communicatieadviseur'
  // IT
  | 'functioneel-beheerder'
  | 'applicatiebeheerder'
  // Events/Opleidingen
  | 'eventcoordinator'
  | 'opleidingscoordinator'
  // Gilde-organisatie
  | 'ambtelijk-secretaris'
  | 'gilderaad-voorzitter'
  // Bestuur
  | 'directeur'
  | 'bestuurslid';

/** Procesfases voor filtering */
export type ProcesFase =
  | 'leadgeneratie'
  | 'intake'
  | 'aanvraag'
  | 'beoordeling'
  | 'activatie'
  | 'onboarding'
  | 'lopend-lidmaatschap'
  | 'contributie'
  | 'gilde-beheer'
  | 'wijzigingen'
  | 'beeindiging'
  | 'escalatie';

/** Type casus voor filtering */
export type CasusType =
  | 'standaard'
  | 'uitzondering'
  | 'escalatie';

/** Status van een node (versiebeheer) */
export type NodeStatus =
  | 'concept'
  | 'actief'
  | 'vervallen';

/** RACI-rollen */
export type RaciType = 'R' | 'A' | 'C' | 'I';

// =============================================================================
// INTERFACES
// =============================================================================

/** RACI-toewijzing per rol */
export interface RaciToewijzing {
  rol: Rol;
  afdeling: Afdeling;
  type: RaciType;
  toelichting?: string;
}

/** Versiebeheer metadata */
export interface VersieInfo {
  versie: string;
  eigenaar: Rol;
  eigenaarAfdeling: Afdeling;
  aanmaakDatum: string;      // ISO 8601
  laatstGewijzigd: string;   // ISO 8601
  status: NodeStatus;
  wijzigingsnotities?: string;
}

/** Referentie naar reglement/statuut */
export interface ReglementReferentie {
  document: string;          // bijv. "Statuten", "Huishoudelijk Reglement"
  artikel: string;           // bijv. "Art. 5 lid 2"
  omschrijving: string;
  url?: string;              // link naar document
}

/** Registratie in een systeem */
export interface Registratie {
  systeem: 'salesforce' | 'exact' | 'website' | 'pe-portaal' | 'sharepoint' | 'email';
  actie: string;             // wat moet er geregistreerd worden
  veld?: string;             // specifiek veld indien van toepassing
  verplicht: boolean;
}

/** Uitzonderingssituatie / decision point */
export interface Uitzondering {
  id: string;
  conditie: string;          // wanneer treedt dit op
  actie: string;             // wat moet er gebeuren
  verantwoordelijke: Rol;
  escaleertNaar?: string;    // node ID waar naar geëscaleerd wordt
}

/** Handover naar volgende stap */
export interface Handover {
  naarNode: string;          // node ID
  conditie?: string;         // optionele conditie wanneer deze route geldt
  overdracht: string;        // wat wordt er overgedragen
}

/** SLA/doorlooptijd indicatie */
export interface Doorlooptijd {
  standaard: string;         // bijv. "2 werkdagen"
  maximum: string;           // bijv. "5 werkdagen"
  escalatieBij?: string;     // wanneer escaleren
}

/** Hoofdstructuur van een procesnode */
export interface ProcesNode {
  // Identificatie
  id: string;
  titel: string;
  korteBeschrijving: string;

  // Classificatie (voor filtering)
  klantreisStatus: KlantreisStatus;
  procesFase: ProcesFase;
  casusType: CasusType;

  // Eigenaarschap
  primaireAfdeling: Afdeling;
  raci: RaciToewijzing[];

  // Procesinhoud
  trigger: string;           // wat start deze stap
  inputs: string[];          // wat is nodig om te beginnen
  acties: string[];          // wat moet er gebeuren
  outputs: string[];         // wat levert deze stap op
  doorlooptijd?: Doorlooptijd;

  // Vervolg
  handovers: Handover[];

  // Uitzonderingen
  uitzonderingen: Uitzondering[];

  // Registraties
  registraties: Registratie[];

  // Regels
  reglementReferenties: ReglementReferentie[];

  // Versiebeheer
  versie: VersieInfo;

  // Module (voor aan/uit schakelen)
  module: string;            // bijv. "basis", "gilde-makelaars", "gilde-taxateurs"

  // Extra metadata
  tags?: string[];
  notities?: string;
}

/** Verbinding tussen nodes */
export interface ProcesEdge {
  id: string;
  van: string;               // node ID
  naar: string;              // node ID
  label?: string;            // beschrijving van de transitie
  conditie?: string;         // voorwaarde voor deze route
  type: 'standaard' | 'uitzondering' | 'escalatie' | 'terugkoppeling';
}

/** Swimlane definitie */
export interface Swimlane {
  id: string;
  type: 'klantreis' | 'afdeling';
  label: string;
  volgorde: number;
  kleur?: string;
}

/** Module definitie voor aan/uit schakelen */
export interface Module {
  id: string;
  naam: string;
  beschrijving: string;
  actief: boolean;
  afhankelijkheden?: string[];  // andere module IDs
  versie: string;
}

/** Filter configuratie */
export interface FilterConfiguratie {
  procesFases?: ProcesFase[];
  afdelingen?: Afdeling[];
  rollen?: Rol[];
  casusTypes?: CasusType[];
  modules?: string[];
  klantreisStatussen?: KlantreisStatus[];
}

/** Compleet procesmodel */
export interface ProcesModel {
  metadata: {
    naam: string;
    versie: string;
    laatstGewijzigd: string;
    eigenaar: string;
    beschrijving: string;
  };
  modules: Module[];
  swimlanes: Swimlane[];
  nodes: ProcesNode[];
  edges: ProcesEdge[];
}

/** Rolweergave - taken per rol */
export interface RolWeergave {
  rol: Rol;
  afdeling: Afdeling;
  taken: {
    nodeId: string;
    nodeTitel: string;
    raciType: RaciType;
    procesFase: ProcesFase;
    triggers: string[];
    acties: string[];
    handovers: string[];
    escalaties: string[];
  }[];
}
