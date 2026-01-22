/**
 * Procesmodel Vastgoed Nederland - Data Index
 *
 * Dit bestand importeert alle data en exporteert het complete model.
 */

import type { ProcesModel, ProcesNode, ProcesEdge, RolWeergave } from '../types/process-model';

// Import JSON data
import modulesData from './modules.json';
import nodesLeadgeneratie from './nodes-leadgeneratie.json';
import nodesAanvraag from './nodes-aanvraag.json';
import nodesActivatie from './nodes-activatie.json';
import nodesLopend from './nodes-lopend.json';
import nodesContributie from './nodes-contributie.json';
import nodesGilde from './nodes-gilde.json';
import nodesBeeindiging from './nodes-beeindiging.json';
import nodesEscalaties from './nodes-escalaties.json';
import edgesData from './edges.json';
import rolweergaveData from './rolweergave.json';
import reglementMappingData from './reglement-mapping.json';

// Combineer alle nodes
const alleNodes: ProcesNode[] = [
  ...nodesLeadgeneratie.nodes,
  ...nodesAanvraag.nodes,
  ...nodesActivatie.nodes,
  ...nodesLopend.nodes,
  ...nodesContributie.nodes,
  ...nodesGilde.nodes,
  ...nodesBeeindiging.nodes,
  ...nodesEscalaties.nodes,
] as ProcesNode[];

// Export het complete model
export const procesModel: ProcesModel = {
  metadata: {
    naam: 'Vastgoed Nederland Member Lifecycle',
    versie: '1.0.0',
    laatstGewijzigd: '2025-01-15',
    eigenaar: 'Procesmanagement Vastgoed Nederland',
    beschrijving: 'Complete procesflow voor de member lifecycle van Vastgoed Nederland, inclusief leadgeneratie, aanvraag, activatie, lopend lidmaatschap, contributie, gilde-beheer, beëindiging en escalaties.'
  },
  modules: modulesData.modules,
  swimlanes: modulesData.swimlanes,
  nodes: alleNodes,
  edges: edgesData.edges as ProcesEdge[]
};

// Export rolweergaven
export const rolweergaven: RolWeergave[] = rolweergaveData.rolweergaven as RolWeergave[];

// Export reglement mapping
export const reglementMapping = reglementMappingData;

// Helper functies voor filtering
export function getNodesByFase(fase: string): ProcesNode[] {
  return alleNodes.filter(node => node.procesFase === fase);
}

export function getNodesByAfdeling(afdeling: string): ProcesNode[] {
  return alleNodes.filter(node => node.primaireAfdeling === afdeling);
}

export function getNodesByKlantreisStatus(status: string): ProcesNode[] {
  return alleNodes.filter(node => node.klantreisStatus === status);
}

export function getNodesByModule(moduleId: string): ProcesNode[] {
  return alleNodes.filter(node => node.module === moduleId);
}

export function getNodeById(id: string): ProcesNode | undefined {
  return alleNodes.find(node => node.id === id);
}

export function getEdgesFromNode(nodeId: string): ProcesEdge[] {
  return (edgesData.edges as ProcesEdge[]).filter(edge => edge.van === nodeId);
}

export function getEdgesToNode(nodeId: string): ProcesEdge[] {
  return (edgesData.edges as ProcesEdge[]).filter(edge => edge.naar === nodeId);
}

export function getReglementForNode(nodeId: string): { document: string; artikel: string }[] {
  return reglementMappingData.nodeNaarReglement[nodeId as keyof typeof reglementMappingData.nodeNaarReglement] || [];
}

export function getRolweergave(rol: string): RolWeergave | undefined {
  return rolweergaven.find(r => r.rol === rol);
}

// Statistieken
export function getModelStats() {
  return {
    aantalNodes: alleNodes.length,
    aantalEdges: edgesData.edges.length,
    aantalModules: modulesData.modules.length,
    aantalRollen: rolweergaven.length,
    nodesPerFase: Object.fromEntries(
      [...new Set(alleNodes.map(n => n.procesFase))].map(fase => [
        fase,
        alleNodes.filter(n => n.procesFase === fase).length
      ])
    ),
    nodesPerAfdeling: Object.fromEntries(
      [...new Set(alleNodes.map(n => n.primaireAfdeling))].map(afd => [
        afd,
        alleNodes.filter(n => n.primaireAfdeling === afd).length
      ])
    )
  };
}
