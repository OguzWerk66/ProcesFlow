import type { ProcesNode, ProcesEdge, Module, Fase, ProcesFase, KlantreisStatus } from '../types';

// Import JSON data met alias
import modulesData from '@data/modules.json';
import nodesLeadgeneratie from '@data/nodes-leadgeneratie.json';
import nodesAanvraag from '@data/nodes-aanvraag.json';
import nodesActivatie from '@data/nodes-activatie.json';
import nodesLopend from '@data/nodes-lopend.json';
import nodesContributie from '@data/nodes-contributie.json';
import nodesGilde from '@data/nodes-gilde.json';
import nodesBeeindiging from '@data/nodes-beeindiging.json';
import nodesEscalaties from '@data/nodes-escalaties.json';
import edgesData from '@data/edges.json';

// Mapping van procesfase naar fase
function bepaalFase(procesFase: string): Fase {
  switch (procesFase) {
    case 'leadgeneratie':
      return 'bereiken';
    case 'intake':
    case 'aanvraag':
    case 'beoordeling':
      return 'boeien';
    case 'activatie':
    case 'onboarding':
      return 'binden';
    case 'lopend-lidmaatschap':
    case 'wijzigingen':
    case 'beeindiging':
    case 'contributie':
    case 'gilde-beheer':
    case 'escalatie':
    default:
      return 'behouden';
  }
}

// Mapping van oude procesfases naar nieuwe
function mapProcesFase(procesFase: string): ProcesFase {
  // Oude fases die niet meer bestaan, mappen naar bestaande
  if (procesFase === 'contributie' || procesFase === 'gilde-beheer') {
    return 'lopend-lidmaatschap';
  }
  if (procesFase === 'escalatie') {
    return 'wijzigingen';
  }
  return procesFase as ProcesFase;
}

// Mapping van klantreis status
function mapKlantreisStatus(status: string): KlantreisStatus {
  // Extra-lid wordt omgezet naar aanvrager-bestaand
  if (status === 'extra-lid') {
    return 'aanvrager-bestaand';
  }
  return status as KlantreisStatus;
}

// Mapping van oude afdelingen naar nieuwe
function mapAfdeling(afdeling: string): string {
  // Events & Opleidingen wordt Deelnemingen
  if (afdeling === 'events-opleidingen') {
    return 'deelnemingen';
  }
  // Gilde-organisatie wordt ook gemapped naar deelnemingen (of een andere relevante afdeling)
  if (afdeling === 'gilde-organisatie') {
    return 'bestuur';
  }
  return afdeling;
}

// Transformeer oude node naar nieuwe structuur
function transformNode(oldNode: Record<string, unknown>): ProcesNode {
  const procesFase = mapProcesFase(oldNode.procesFase as string);
  const fase = bepaalFase(oldNode.procesFase as string);
  const klantreisStatus = mapKlantreisStatus(oldNode.klantreisStatus as string);
  const primaireAfdeling = mapAfdeling(oldNode.primaireAfdeling as string);

  return {
    id: oldNode.id as string,
    titel: oldNode.titel as string,
    korteBeschrijving: oldNode.korteBeschrijving as string,
    fase,
    klantreisStatus,
    procesFase,
    primaireAfdeling,
    raci: oldNode.raci || [],
    trigger: oldNode.trigger as string,
    inputs: oldNode.inputs || [],
    acties: oldNode.acties || [],
    outputs: oldNode.outputs || [],
    doorlooptijd: oldNode.doorlooptijd,
    handovers: oldNode.handovers || [],
    uitzonderingen: oldNode.uitzonderingen || [],
    registraties: oldNode.registraties || [],
    reglementReferenties: oldNode.reglementReferenties || [],
    versie: oldNode.versie,
    tags: oldNode.tags,
    notities: oldNode.notities,
  } as ProcesNode;
}

// Combineer alle nodes
export function loadNodes(): ProcesNode[] {
  const allNodes = [
    ...nodesLeadgeneratie.nodes,
    ...nodesAanvraag.nodes,
    ...nodesActivatie.nodes,
    ...nodesLopend.nodes,
    ...nodesContributie.nodes,
    ...nodesGilde.nodes,
    ...nodesBeeindiging.nodes,
    ...nodesEscalaties.nodes,
  ];

  return allNodes.map(node => transformNode(node as Record<string, unknown>));
}

export function loadEdges(): ProcesEdge[] {
  return edgesData.edges as ProcesEdge[];
}

export function loadModules(): Module[] {
  return modulesData.modules as Module[];
}

export function loadAllData() {
  return {
    nodes: loadNodes(),
    edges: loadEdges(),
    modules: loadModules(),
  };
}
