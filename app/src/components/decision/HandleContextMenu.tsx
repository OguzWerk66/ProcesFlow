import { StopCircle, HelpCircle, Zap, Play, GitBranch } from 'lucide-react';
import type { DecisionNodeType, DecisionNode } from '../../types/decisionFlowchart';
import { DECISION_NODE_LABELS } from '../../types/decisionFlowchart';

interface HandleContextMenuProps {
  x: number;
  y: number;
  onSelectNodeType: (type: DecisionNodeType) => void;
  onSelectExistingNode: (nodeId: string) => void;
  onClose: () => void;
  sourceNodeType?: DecisionNodeType;
  handleType?: 'source' | 'ja' | 'nee';
  availableNodes?: DecisionNode[];
}

// Alleen de relevante vervolgstap opties: Beslissing, Actie, Einde
const NODE_TYPE_CONFIG: { type: DecisionNodeType; icon: React.ReactNode; color: string; bgHover: string }[] = [
  { type: 'decision', icon: <HelpCircle className="w-4 h-4" />, color: 'text-amber-400', bgHover: 'hover:bg-amber-900/30' },
  { type: 'action', icon: <Zap className="w-4 h-4" />, color: 'text-blue-400', bgHover: 'hover:bg-blue-900/30' },
  { type: 'end', icon: <StopCircle className="w-4 h-4" />, color: 'text-red-400', bgHover: 'hover:bg-red-900/30' },
];

function getNodeIcon(type: DecisionNodeType) {
  switch (type) {
    case 'start': return <Play className="w-4 h-4" />;
    case 'end': return <StopCircle className="w-4 h-4" />;
    case 'decision': return <HelpCircle className="w-4 h-4" />;
    case 'action': return <Zap className="w-4 h-4" />;
    case 'subprocess': return <GitBranch className="w-4 h-4" />;
    default: return <Zap className="w-4 h-4" />;
  }
}

function getNodeColor(type: DecisionNodeType) {
  switch (type) {
    case 'start': return 'text-green-400';
    case 'end': return 'text-red-400';
    case 'decision': return 'text-amber-400';
    case 'action': return 'text-blue-400';
    case 'subprocess': return 'text-purple-400';
    default: return 'text-gray-400';
  }
}

export default function HandleContextMenu({
  x,
  y,
  onSelectNodeType,
  onSelectExistingNode,
  onClose,
  sourceNodeType,
  handleType,
  availableNodes = []
}: HandleContextMenuProps) {
  // Filter opties gebaseerd op context - End nodes kunnen geen vervolgstappen hebben
  const availableTypes = sourceNodeType === 'end' ? [] : NODE_TYPE_CONFIG;

  return (
    <>
      {/* Backdrop om te sluiten bij klikken erbuiten */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Context menu */}
      <div
        className="fixed z-50 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-1 min-w-[280px] max-h-[400px] overflow-y-auto"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, 8px)'
        }}
      >
        <div className="px-3 py-2 border-b border-gray-700">
          <span className="text-xs font-medium text-gray-500">
            {handleType === 'ja' ? 'Ja → Verbinden met' : handleType === 'nee' ? 'Nee → Verbinden met' : 'Verbinden met'}
          </span>
        </div>

        {/* Sectie: Bestaande nodes */}
        {availableNodes.length > 0 && (
          <>
            <div className="px-3 py-1.5 bg-gray-800 border-b border-gray-700">
              <span className="text-xs font-medium text-gray-400">Bestaande stappen</span>
            </div>
            {availableNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => onSelectExistingNode(node.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-800 transition-colors"
              >
                <span className={getNodeColor(node.type)}>{getNodeIcon(node.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 font-medium truncate">{node.titel}</div>
                  <div className="text-xs text-gray-500 truncate">{DECISION_NODE_LABELS[node.type]}</div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* Sectie: Nieuwe nodes toevoegen */}
        {availableTypes.length > 0 && (
          <>
            <div className="px-3 py-1.5 bg-gray-800 border-b border-gray-700">
              <span className="text-xs font-medium text-gray-400">Nieuwe stap toevoegen</span>
            </div>
            {availableTypes.map(({ type, icon, color, bgHover }) => (
              <button
                key={type}
                onClick={() => onSelectNodeType(type)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm ${bgHover} transition-colors`}
              >
                <span className={color}>{icon}</span>
                <span className="text-gray-200 font-medium">{DECISION_NODE_LABELS[type]}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </>
  );
}
