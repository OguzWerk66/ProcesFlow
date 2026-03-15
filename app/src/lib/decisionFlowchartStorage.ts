import type {
  DecisionFlowchart,
  DecisionFlowchartMetadata,
  DecisionNode,
  DecisionEdge,
} from '../types/decisionFlowchart';
import { supabase } from './supabase';

function generateId(): string {
  return `decision-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function getAllFlowcharts(): Promise<DecisionFlowchart[]> {
  const { data, error } = await supabase
    .from('decision_flowcharts')
    .select('*')
    .order('aanmaak_datum', { ascending: true });

  if (error) {
    console.error('Fout bij laden decision flowcharts:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    naam: row.naam,
    beschrijving: row.beschrijving ?? undefined,
    aanmaakDatum: row.aanmaak_datum,
    laatstGewijzigd: row.laatst_gewijzigd,
    nodes: row.nodes as DecisionNode[],
    edges: row.edges as DecisionEdge[],
  }));
}

export async function getFlowchartMetadataList(): Promise<DecisionFlowchartMetadata[]> {
  const { data, error } = await supabase
    .from('decision_flowcharts')
    .select('id, naam, beschrijving, aanmaak_datum, laatst_gewijzigd, nodes, edges')
    .order('aanmaak_datum', { ascending: true });

  if (error) {
    console.error('Fout bij laden flowchart metadata:', error);
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

export async function getFlowchart(id: string): Promise<DecisionFlowchart | null> {
  const { data, error } = await supabase
    .from('decision_flowcharts')
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
    nodes: data.nodes as DecisionNode[],
    edges: data.edges as DecisionEdge[],
  };
}

export async function saveNewFlowchart(
  naam: string,
  nodes: DecisionNode[],
  edges: DecisionEdge[],
  beschrijving?: string
): Promise<DecisionFlowchart> {
  const now = new Date().toISOString();
  const id = generateId();

  const { error } = await supabase.from('decision_flowcharts').insert({
    id,
    naam,
    beschrijving: beschrijving ?? null,
    aanmaak_datum: now,
    laatst_gewijzigd: now,
    nodes,
    edges,
  });

  if (error) throw new Error(`Fout bij opslaan flowchart: ${error.message}`);

  return { id, naam, beschrijving, aanmaakDatum: now, laatstGewijzigd: now, nodes, edges };
}

export async function updateFlowchart(
  id: string,
  nodes: DecisionNode[],
  edges: DecisionEdge[],
  naam?: string,
  beschrijving?: string
): Promise<DecisionFlowchart | null> {
  const updates: Record<string, unknown> = {
    nodes,
    edges,
    laatst_gewijzigd: new Date().toISOString(),
  };
  if (naam !== undefined) updates.naam = naam;
  if (beschrijving !== undefined) updates.beschrijving = beschrijving;

  const { data, error } = await supabase
    .from('decision_flowcharts')
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
    nodes: data.nodes as DecisionNode[],
    edges: data.edges as DecisionEdge[],
  };
}

export async function deleteFlowchart(id: string): Promise<boolean> {
  const { error } = await supabase.from('decision_flowcharts').delete().eq('id', id);
  if (error) {
    console.error('Fout bij verwijderen flowchart:', error);
    return false;
  }
  return true;
}

export async function flowchartNameExists(naam: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('decision_flowcharts')
    .select('id')
    .ilike('naam', naam);

  if (excludeId) query = query.neq('id', excludeId);

  const { data } = await query;
  return (data?.length ?? 0) > 0;
}
