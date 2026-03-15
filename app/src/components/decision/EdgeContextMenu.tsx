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
        className="fixed z-50 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-1 min-w-[160px]"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, 8px)'
        }}
      >
        <div className="px-3 py-2 border-b border-gray-700">
          <span className="text-xs font-medium text-gray-500">
            Link opties
          </span>
        </div>

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-red-900/30 transition-colors"
        >
          <span className="text-red-400">
            <Trash2 size={16} />
          </span>
          <span className="text-gray-200 font-medium">Verwijderen</span>
        </button>
      </div>
    </>
  );
}