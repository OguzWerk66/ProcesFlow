import { Trash2 } from 'lucide-react';

interface EdgeContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}

export default function EdgeContextMenu({ x, y, onDelete, onClose }: EdgeContextMenuProps) {
  return (
    <>
      {/* Backdrop om te sluiten bij klikken erbuiten */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Context menu */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[160px]"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, 8px)'
        }}
      >
        <div className="px-3 py-2 border-b border-slate-100">
          <span className="text-xs font-medium text-slate-500">
            Link opties
          </span>
        </div>

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-red-50 transition-colors"
        >
          <span className="text-red-600">
            <Trash2 size={16} />
          </span>
          <span className="text-slate-700 font-medium">Verwijderen</span>
        </button>
      </div>
    </>
  );
}