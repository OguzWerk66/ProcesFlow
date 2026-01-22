import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { DECISION_EDGE_KLEUREN } from '../../../types/decisionFlowchart';
import type { DecisionEdgeType } from '../../../types/decisionFlowchart';

export interface DecisionEdgeData extends Record<string, unknown> {
  label?: string;
  edgeType: DecisionEdgeType;
}

function DecisionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as DecisionEdgeData | undefined;
  const edgeType = edgeData?.edgeType || 'standaard';
  const label = edgeData?.label;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = DECISION_EDGE_KLEUREN[edgeType];
  const strokeWidth = selected ? 3 : 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
        }}
        markerEnd={`url(#arrow-${edgeType})`}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span
              className={`
                px-2 py-0.5 rounded text-xs font-semibold shadow-sm
                ${edgeType === 'ja' ? 'bg-green-100 text-green-700 border border-green-300' : ''}
                ${edgeType === 'nee' ? 'bg-red-100 text-red-700 border border-red-300' : ''}
                ${edgeType === 'standaard' ? 'bg-slate-100 text-slate-600 border border-slate-300' : ''}
              `}
            >
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Marker definities voor pijlpunten */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker
            id="arrow-ja"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={DECISION_EDGE_KLEUREN.ja} />
          </marker>
          <marker
            id="arrow-nee"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={DECISION_EDGE_KLEUREN.nee} />
          </marker>
          <marker
            id="arrow-standaard"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={DECISION_EDGE_KLEUREN.standaard} />
          </marker>
        </defs>
      </svg>
    </>
  );
}

export default memo(DecisionEdge);
