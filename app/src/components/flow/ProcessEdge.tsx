import { memo, useState, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Position,
  useReactFlow,
} from '@xyflow/react';
import { Trash2, Edit3 } from 'lucide-react';
import type { EdgeType } from '../../types';
import { useStore } from '../../store/useStore';

export interface ProcessEdgeData extends Record<string, unknown> {
  label?: string;
  conditie?: string;
  type: EdgeType;
  [key: string]: unknown;
}

interface ProcessEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: ProcessEdgeData;
  selected?: boolean;
}

function ProcessEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: ProcessEdgeProps) {
  const { setEdges } = useReactFlow();
  const deleteEdgeFromStore = useStore((state) => state.deleteEdge);
  const setSelectedEdge = useStore((state) => state.setSelectedEdge);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeType = data?.type || 'standaard';

  const strokeColor =
    edgeType === 'escalatie'
      ? '#ef4444'
      : edgeType === 'uitzondering'
      ? '#f59e0b'
      : edgeType === 'terugkoppeling'
      ? '#8b5cf6'
      : '#64748b';

  const strokeDasharray =
    edgeType === 'terugkoppeling' ? '5,5' : undefined;

  // Sluit menu wanneer er buiten geklikt wordt
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Sluit menu wanneer edge niet meer geselecteerd is
  useEffect(() => {
    if (!selected) {
      setShowMenu(false);
    }
  }, [selected]);

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteEdgeFromStore(id);
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
    setShowMenu(false);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedEdge(id);
    setShowMenu(false);
  };

  const handleEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#3b82f6' : strokeColor,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray,
        }}
      />
      <EdgeLabelRenderer>
        {/* Klikbare zone in het midden van de edge */}
        <div
          className="absolute nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          ref={menuRef}
        >
          {/* Kleine indicator punt - altijd zichtbaar */}
          <button
            onClick={handleEdgeClick}
            className={`w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition-all ${
              showMenu || selected
                ? 'bg-blue-500 scale-125'
                : 'bg-slate-400 hover:bg-slate-500 hover:scale-110'
            }`}
            title="Klik voor opties"
          />

          {/* Menu - alleen zichtbaar na klikken */}
          {showMenu && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[140px] z-50">
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
              >
                <Edit3 size={14} />
                Bewerken
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                Verwijderen
              </button>
            </div>
          )}
        </div>

        {/* Label onder de indicator */}
        {data?.label && (
          <div
            className="absolute px-2 py-1 bg-white rounded shadow-sm border border-slate-200 text-[10px] text-slate-600 pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + 20}px)`,
            }}
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ProcessEdge);
