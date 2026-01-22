import type {
  DecisionFlowchart,
  DecisionFlowchartMetadata,
  DecisionNode,
  DecisionEdge,
} from '../types/decisionFlowchart';

const STORAGE_KEY = 'procesflow-decision-flowcharts';

// Genereer unieke ID
function generateId(): string {
  return `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Haal alle flowcharts op uit localStorage
export function getAllFlowcharts(): DecisionFlowchart[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as DecisionFlowchart[];
    }
  } catch (error) {
    console.error('Fout bij laden decision flowcharts:', error);
  }
  return [];
}

// Haal metadata lijst op (voor archief weergave)
export function getFlowchartMetadataList(): DecisionFlowchartMetadata[] {
  const flowcharts = getAllFlowcharts();
  return flowcharts.map((fc) => ({
    id: fc.id,
    naam: fc.naam,
    beschrijving: fc.beschrijving,
    aanmaakDatum: fc.aanmaakDatum,
    laatstGewijzigd: fc.laatstGewijzigd,
    nodeCount: fc.nodes.length,
    edgeCount: fc.edges.length,
  }));
}

// Haal specifieke flowchart op
export function getFlowchart(id: string): DecisionFlowchart | null {
  const flowcharts = getAllFlowcharts();
  return flowcharts.find((fc) => fc.id === id) || null;
}

// Sla alle flowcharts op
function saveAllFlowcharts(flowcharts: DecisionFlowchart[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flowcharts));
  } catch (error) {
    console.error('Fout bij opslaan decision flowcharts:', error);
  }
}

// Sla nieuwe flowchart op
export function saveNewFlowchart(
  naam: string,
  nodes: DecisionNode[],
  edges: DecisionEdge[],
  beschrijving?: string
): DecisionFlowchart {
  const flowcharts = getAllFlowcharts();
  const now = new Date().toISOString();

  const newFlowchart: DecisionFlowchart = {
    id: generateId(),
    naam,
    beschrijving,
    aanmaakDatum: now,
    laatstGewijzigd: now,
    nodes,
    edges,
  };

  flowcharts.push(newFlowchart);
  saveAllFlowcharts(flowcharts);

  return newFlowchart;
}

// Update bestaande flowchart
export function updateFlowchart(
  id: string,
  nodes: DecisionNode[],
  edges: DecisionEdge[],
  naam?: string,
  beschrijving?: string
): DecisionFlowchart | null {
  const flowcharts = getAllFlowcharts();
  const index = flowcharts.findIndex((fc) => fc.id === id);

  if (index === -1) {
    return null;
  }

  const updated: DecisionFlowchart = {
    ...flowcharts[index],
    nodes,
    edges,
    laatstGewijzigd: new Date().toISOString(),
  };

  if (naam !== undefined) {
    updated.naam = naam;
  }
  if (beschrijving !== undefined) {
    updated.beschrijving = beschrijving;
  }

  flowcharts[index] = updated;
  saveAllFlowcharts(flowcharts);

  return updated;
}

// Verwijder flowchart
export function deleteFlowchart(id: string): boolean {
  const flowcharts = getAllFlowcharts();
  const filtered = flowcharts.filter((fc) => fc.id !== id);

  if (filtered.length === flowcharts.length) {
    return false;
  }

  saveAllFlowcharts(filtered);
  return true;
}

// Check of naam al bestaat
export function flowchartNameExists(naam: string, excludeId?: string): boolean {
  const flowcharts = getAllFlowcharts();
  return flowcharts.some(
    (fc) => fc.naam.toLowerCase() === naam.toLowerCase() && fc.id !== excludeId
  );
}
