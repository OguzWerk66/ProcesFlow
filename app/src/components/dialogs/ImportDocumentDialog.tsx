import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { parseProcessDocument, type ParseResult } from '../../lib/documentParser';

interface ImportDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (result: ParseResult, documentText: string) => void;
}

type Step = 'input' | 'loading' | 'preview' | 'error';

export function ImportDocumentDialog({ isOpen, onClose, onImport }: ImportDocumentDialogProps) {
  const [step, setStep] = useState<Step>('input');
  const [documentText, setDocumentText] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocumentText(ev.target?.result as string ?? '');
    };
    reader.readAsText(file, 'utf-8');
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleProcess = async () => {
    if (!documentText.trim()) return;

    setStep('loading');
    setErrorMessage('');

    try {
      const parsed = await parseProcessDocument(documentText);
      setResult(parsed);
      setStep('preview');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Onbekende fout');
      setStep('error');
    }
  };

  const handleImport = () => {
    if (result) {
      onImport(result, documentText);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('input');
    setDocumentText('');
    setResult(null);
    setErrorMessage('');
    onClose();
  };

  const handleRetry = () => {
    setStep('input');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/40 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Proces importeren uit document</h2>
              <p className="text-sm text-gray-500">Claude AI parseert het document en maakt processtappen</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP: input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Tekstbestand uploaden (.txt)
                </button>
                <span className="text-sm text-gray-500">of plak tekst hieronder</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="Plak hier de tekst die het proces beschrijft...

Bijvoorbeeld:
1. Ontvangst aanvraag – De ledenadministratie ontvangt het aanvraagformulier van de prospect.
2. Controle volledigheid – Controleer of alle vereiste documenten aanwezig zijn.
3. Beoordeling – Legal beoordeelt de aanvraag op basis van criteria.
4. Beslissing – Bij goedkeuring stuurt sales een welkomstmail.
5. Activatie – IT activeert het account en de ledenadministratie registreert in Salesforce."
                className="w-full h-64 p-4 text-sm font-mono bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex items-start gap-2 p-3 bg-amber-950/50 border border-amber-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300">
                  Voor PDF of Word documenten: kopieer de tekst handmatig en plak die hierboven.
                  Hoe gedetailleerder de beschrijving, hoe beter het resultaat.
                </p>
              </div>
            </div>
          )}

          {/* STEP: loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-100">Claude analyseert het document...</p>
                <p className="text-sm text-gray-500 mt-1">Dit kan 10–30 seconden duren</p>
              </div>
            </div>
          )}

          {/* STEP: preview */}
          {step === 'preview' && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-950/50 border border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="font-medium text-green-300">Document succesvol verwerkt</p>
                  <p className="text-sm text-green-400">
                    {result.nodes.length} processtap{result.nodes.length !== 1 ? 'pen' : ''} en{' '}
                    {result.edges.length} verbinding{result.edges.length !== 1 ? 'en' : ''} gevonden
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Gevonden processtappen</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.nodes.map((node, i) => (
                    <div key={node.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                      <span className="text-xs font-mono text-gray-500 pt-0.5 w-20 shrink-0">{node.id}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">{node.titel}</p>
                        <p className="text-xs text-gray-500 truncate">{node.korteBeschrijving}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="text-xs px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded">{node.fase}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-purple-900/60 text-purple-300 rounded">{node.primaireAfdeling}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">{node.procesFase}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 shrink-0">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.edges.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Verbindingen</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.edges.map((edge) => (
                      <div key={edge.id} className="flex items-center gap-2 text-xs text-gray-400 px-3 py-1.5 bg-gray-800 rounded">
                        <span className="font-mono">{edge.van}</span>
                        <span className="text-gray-500">→</span>
                        <span className="font-mono">{edge.naar}</span>
                        {edge.label && <span className="text-gray-500">({edge.label})</span>}
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${
                          edge.type === 'escalatie' ? 'bg-red-900/60 text-red-300' :
                          edge.type === 'uitzondering' ? 'bg-amber-900/60 text-amber-300' :
                          edge.type === 'terugkoppeling' ? 'bg-purple-900/60 text-purple-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>{edge.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-950/50 border border-blue-800 rounded-lg">
                <p className="text-xs text-blue-300">
                  Na het importeren kun je alle stappen bewerken via het detailpaneel.
                  Sla het canvas op om de wijzigingen te bewaren.
                </p>
              </div>
            </div>
          )}

          {/* STEP: error */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg w-full">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="font-medium text-red-300">Verwerking mislukt</p>
                </div>
                <p className="text-sm text-red-300 font-mono">{errorMessage}</p>
              </div>
              {errorMessage.includes('ANTHROPIC_API_KEY') && (
                <div className="p-3 bg-amber-950/50 border border-amber-800 rounded-lg w-full">
                  <p className="text-xs text-amber-300">
                    <strong>Instelling vereist:</strong> Voeg je Anthropic API-sleutel toe als Supabase secret:{' '}
                    <code className="bg-amber-900/40 px-1 rounded">ANTHROPIC_API_KEY</code>.
                    Ga naar Supabase Dashboard → Edge Functions → Secrets.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-700 bg-gray-900 rounded-b-xl">
          <button
            onClick={step === 'error' ? handleRetry : handleClose}
            className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            {step === 'error' ? 'Opnieuw proberen' : 'Annuleren'}
          </button>

          <div className="flex gap-3">
            {step === 'preview' && (
              <button
                onClick={handleRetry}
                className="px-4 py-2 text-gray-400 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors text-sm"
              >
                Andere tekst invoeren
              </button>
            )}
            {step === 'input' && (
              <button
                onClick={handleProcess}
                disabled={!documentText.trim()}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Verwerken met AI
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={handleImport}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Laden in canvas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
