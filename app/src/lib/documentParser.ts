import type { ProcesNode, ProcesEdge } from '../types';

export interface ParseResult {
  nodes: ProcesNode[];
  edges: ProcesEdge[];
}

export async function parseProcessDocument(documentText: string): Promise<ParseResult> {
  let response: Response;

  try {
    response = await fetch(
      'https://sqtuoxbrliepgzxmlmol.supabase.co/functions/v1/parse-process',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_NrcHPuIk_4VvAaUIV-ZaTQ_MIiRmzRz',
        },
        body: JSON.stringify({ documentText }),
      }
    );
  } catch (networkErr) {
    const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
    throw new Error(`Netwerkfout: ${msg}. Controleer je internetverbinding.`);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error ?? `HTTP ${response.status}`);
  }

  const result = await response.json() as ParseResult;

  if (!Array.isArray(result.nodes) || !Array.isArray(result.edges)) {
    throw new Error('Ongeldig antwoord van de server');
  }

  return result;
}
