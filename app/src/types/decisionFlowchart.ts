// =============================================================================
// DECISION FLOWCHART TYPE DEFINITIES
// Ja/Nee beslissingsdiagrammen met afdeling-indicatie
// =============================================================================

import type { NodePosition } from './index';

// Node types in een decision flowchart
export type DecisionNodeType = 'start' | 'end' | 'decision' | 'action' | 'subprocess';

// Edge types voor ja/nee verbindingen
export type DecisionEdgeType = 'ja' | 'nee' | 'standaard';

// Een node in de decision flowchart
export interface DecisionNode {
  id: string;
  type: DecisionNodeType;
  titel: string;
  beschrijving?: string;
  afdeling?: string;           // Verantwoordelijke afdeling (voor kleur)
  fase?: string;               // Optionele fase voor groepering
  position?: NodePosition;     // Opgeslagen positie op canvas

  // Specifiek voor 'decision' type
  vraag?: string;              // De ja/nee vraag

  // Specifiek voor 'subprocess' type (toekomstige koppeling)
  linkedProcessId?: string;    // Koppeling naar ProcesNode
  linkedFlowchartId?: string;  // Koppeling naar andere Decision Flowchart
}

// Een edge/verbinding in de decision flowchart
export interface DecisionEdge {
  id: string;
  van: string;                 // Source node ID
  naar: string;                // Target node ID
  label?: string;              // 'Ja', 'Nee', of custom tekst
  type: DecisionEdgeType;
}

// Een volledige decision flowchart
export interface DecisionFlowchart {
  id: string;
  naam: string;
  beschrijving?: string;
  aanmaakDatum: string;
  laatstGewijzigd: string;
  nodes: DecisionNode[];
  edges: DecisionEdge[];

  // Toekomstige koppeling aan proces
  linkedProcessId?: string;
}

// Metadata voor archief weergave (zonder volledige data)
export interface DecisionFlowchartMetadata {
  id: string;
  naam: string;
  beschrijving?: string;
  aanmaakDatum: string;
  laatstGewijzigd: string;
  nodeCount: number;
  edgeCount: number;
}

// Kleuren voor node types
export const DECISION_NODE_KLEUREN: Record<DecisionNodeType, string> = {
  'start': '#4CAF50',      // Groen
  'end': '#f44336',        // Rood
  'decision': '#FFC107',   // Geel/Amber
  'action': '#2196F3',     // Blauw (wordt overschreven door afdeling kleur)
  'subprocess': '#9C27B0', // Paars
};

// Kleuren voor edge types
export const DECISION_EDGE_KLEUREN: Record<DecisionEdgeType, string> = {
  'ja': '#4CAF50',         // Groen
  'nee': '#f44336',        // Rood
  'standaard': '#64748b',  // Grijs
};

// Labels voor node types
export const DECISION_NODE_LABELS: Record<DecisionNodeType, string> = {
  'start': 'Start',
  'end': 'Einde',
  'decision': 'Beslissing',
  'action': 'Actie',
  'subprocess': 'Subprocess',
};

// Labels voor edge types
export const DECISION_EDGE_LABELS: Record<DecisionEdgeType, string> = {
  'ja': 'Ja',
  'nee': 'Nee',
  'standaard': '',
};
