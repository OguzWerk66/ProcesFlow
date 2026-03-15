import type { Canvas, CanvasMetadata, ProcesNode, ProcesEdge } from '../types';
import { supabase } from './supabase';

function generateId(): string {
  return `canvas-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function getAllCanvasses(): Promise<Canvas[]> {
  const { data, error } = await supabase
    .from('canvassen')
    .select('*')
    .order('aanmaak_datum', { ascending: true });

  if (error) {
    console.error('Fout bij laden canvassen:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    naam: row.naam,
    beschrijving: row.beschrijving ?? undefined,
    aanmaakDatum: row.aanmaak_datum,
    laatstGewijzigd: row.laatst_gewijzigd,
    nodes: row.nodes as ProcesNode[],
    edges: row.edges as ProcesEdge[],
  }));
}

export async function getCanvasMetadataList(): Promise<CanvasMetadata[]> {
  const { data, error } = await supabase
    .from('canvassen')
    .select('id, naam, beschrijving, aanmaak_datum, laatst_gewijzigd, nodes, edges')
    .order('aanmaak_datum', { ascending: true });

  if (error) {
    console.error('Fout bij laden canvas metadata:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    naam: row.naam,
    beschrijving: row.beschrijving ?? undefined,
    aanmaakDatum: row.aanmaak_datum,
    laatstGewijzigd: row.laatst_gewijzigd,
    nodeCount: (row.nodes as unknown[]).length,
    edgeCount: (row.edges as unknown[]).length,
  }));
}

export async function getCanvas(id: string): Promise<Canvas | null> {
  const { data, error } = await supabase
    .from('canvassen')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    naam: data.naam,
    beschrijving: data.beschrijving ?? undefined,
    aanmaakDatum: data.aanmaak_datum,
    laatstGewijzigd: data.laatst_gewijzigd,
    nodes: data.nodes as ProcesNode[],
    edges: data.edges as ProcesEdge[],
    bronTekst: data.bron_tekst ?? undefined,
  };
}

export async function saveNewCanvas(
  naam: string,
  nodes: ProcesNode[],
  edges: ProcesEdge[],
  beschrijving?: string,
  bronTekst?: string
): Promise<Canvas> {
  const now = new Date().toISOString();
  const id = generateId();

  const { error } = await supabase.from('canvassen').insert({
    id,
    naam,
    beschrijving: beschrijving ?? null,
    aanmaak_datum: now,
    laatst_gewijzigd: now,
    nodes,
    edges,
    bron_tekst: bronTekst ?? null,
  });

  if (error) throw new Error(`Fout bij opslaan canvas: ${error.message}`);

  return { id, naam, beschrijving, aanmaakDatum: now, laatstGewijzigd: now, nodes, edges, bronTekst };
}

export async function updateCanvas(
  id: string,
  nodes: ProcesNode[],
  edges: ProcesEdge[],
  naam?: string,
  beschrijving?: string,
  bronTekst?: string
): Promise<Canvas | null> {
  const updates: Record<string, unknown> = {
    nodes,
    edges,
    laatst_gewijzigd: new Date().toISOString(),
  };
  if (naam !== undefined) updates.naam = naam;
  if (beschrijving !== undefined) updates.beschrijving = beschrijving;
  if (bronTekst !== undefined) updates.bron_tekst = bronTekst;

  const { data, error } = await supabase
    .from('canvassen')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    naam: data.naam,
    beschrijving: data.beschrijving ?? undefined,
    aanmaakDatum: data.aanmaak_datum,
    laatstGewijzigd: data.laatst_gewijzigd,
    nodes: data.nodes as ProcesNode[],
    edges: data.edges as ProcesEdge[],
    bronTekst: data.bron_tekst ?? undefined,
  };
}

export async function deleteCanvas(id: string): Promise<boolean> {
  const { error } = await supabase.from('canvassen').delete().eq('id', id);
  if (error) {
    console.error('Fout bij verwijderen canvas:', error);
    return false;
  }
  return true;
}

export async function canvasNameExists(naam: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('canvassen')
    .select('id')
    .ilike('naam', naam);

  if (excludeId) query = query.neq('id', excludeId);

  const { data } = await query;
  return (data?.length ?? 0) > 0;
}
