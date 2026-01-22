import type { Canvas, CanvasMetadata, ProcesNode, ProcesEdge } from '../types';

const STORAGE_KEY = 'procesflow-canvasses';

// Genereer unieke ID
function generateId(): string {
  return `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Haal alle canvassen op uit localStorage
export function getAllCanvasses(): Canvas[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Canvas[];
  } catch (error) {
    console.error('Fout bij laden canvassen:', error);
    return [];
  }
}

// Haal alleen metadata op (voor archief lijst)
export function getCanvasMetadataList(): CanvasMetadata[] {
  const canvasses = getAllCanvasses();
  return canvasses.map((canvas) => ({
    id: canvas.id,
    naam: canvas.naam,
    beschrijving: canvas.beschrijving,
    aanmaakDatum: canvas.aanmaakDatum,
    laatstGewijzigd: canvas.laatstGewijzigd,
    nodeCount: canvas.nodes.length,
    edgeCount: canvas.edges.length,
  }));
}

// Haal een specifiek canvas op
export function getCanvas(id: string): Canvas | null {
  const canvasses = getAllCanvasses();
  return canvasses.find((c) => c.id === id) || null;
}

// Sla een nieuw canvas op
export function saveNewCanvas(
  naam: string,
  nodes: ProcesNode[],
  edges: ProcesEdge[],
  beschrijving?: string
): Canvas {
  const now = new Date().toISOString();
  const newCanvas: Canvas = {
    id: generateId(),
    naam,
    beschrijving,
    aanmaakDatum: now,
    laatstGewijzigd: now,
    nodes,
    edges,
  };

  const canvasses = getAllCanvasses();
  canvasses.push(newCanvas);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(canvasses));

  return newCanvas;
}

// Update een bestaand canvas
export function updateCanvas(
  id: string,
  nodes: ProcesNode[],
  edges: ProcesEdge[],
  naam?: string,
  beschrijving?: string
): Canvas | null {
  const canvasses = getAllCanvasses();
  const index = canvasses.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updatedCanvas: Canvas = {
    ...canvasses[index],
    nodes,
    edges,
    laatstGewijzigd: new Date().toISOString(),
  };

  if (naam !== undefined) {
    updatedCanvas.naam = naam;
  }
  if (beschrijving !== undefined) {
    updatedCanvas.beschrijving = beschrijving;
  }

  canvasses[index] = updatedCanvas;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(canvasses));

  return updatedCanvas;
}

// Verwijder een canvas
export function deleteCanvas(id: string): boolean {
  const canvasses = getAllCanvasses();
  const filtered = canvasses.filter((c) => c.id !== id);

  if (filtered.length === canvasses.length) {
    return false; // Canvas niet gevonden
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Check of een canvas naam al bestaat
export function canvasNameExists(naam: string, excludeId?: string): boolean {
  const canvasses = getAllCanvasses();
  return canvasses.some(
    (c) => c.naam.toLowerCase() === naam.toLowerCase() && c.id !== excludeId
  );
}
