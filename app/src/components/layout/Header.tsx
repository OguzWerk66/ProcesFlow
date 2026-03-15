import { Network, User, Settings, HelpCircle, Plus, Link, Save, FolderOpen, FilePlus, GitBranch, Play, HelpCircle as Question, Cog, StopCircle, FileInput, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useDecisionFlowchartStore } from '../../store/useDecisionFlowchartStore';
import type { DecisionNodeType } from '../../types/decisionFlowchart';

type ActiveView = 'procesflow' | 'decision';

interface HeaderProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  // ProcesFlow handlers
  onAddNode?: () => void;
  onAddEdge?: () => void;
  onSaveCanvas?: () => void;
  onOpenArchive?: () => void;
  onNewCanvas?: () => void;
  onImportDocument?: () => void;
  onOpenAdmin?: () => void;
  // Decision Flowchart handlers
  onAddDecisionNode?: (type?: DecisionNodeType) => void;
  onAddDecisionEdge?: () => void;
  onSaveDecisionFlowchart?: () => void;
  onOpenDecisionArchive?: () => void;
  onNewDecisionFlowchart?: () => void;
}

export default function Header({
  activeView,
  onViewChange,
  onAddNode,
  onAddEdge,
  onSaveCanvas,
  onOpenArchive,
  onNewCanvas,
  onImportDocument,
  onOpenAdmin,
  onAddDecisionNode,
  onAddDecisionEdge,
  onSaveDecisionFlowchart,
  onOpenDecisionArchive,
  onNewDecisionFlowchart,
}: HeaderProps) {
  const user = useStore((state) => state.user);
  const isEditMode = useStore((state) => state.isEditMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const activeCanvasName = useStore((state) => state.activeCanvasName);
  const undo = useStore((state) => state.undo);
  const canUndo = useStore((state) => state.canUndo);
  const activeFlowchartName = useDecisionFlowchartStore((state) => state.activeFlowchartName);
  const canEdit = user?.rol === 'editor' || user?.rol === 'admin';
  const isAdmin = user?.rol === 'admin';

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-700 px-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-6 h-6 text-blue-500" />
          <h1 className="font-semibold text-lg text-gray-100">
            ProcesFlow
          </h1>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
          Vastgoed Nederland
        </span>

        {/* Tab Navigation */}
        <div className="flex items-center ml-4 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onViewChange('procesflow')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              activeView === 'procesflow'
                ? 'bg-gray-700 text-blue-400 shadow-sm font-medium'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ProcesFlow
          </button>
          <button
            onClick={() => onViewChange('decision')}
            className={`px-3 py-1 text-sm rounded-md transition-all flex items-center gap-1.5 ${
              activeView === 'decision'
                ? 'bg-gray-700 text-purple-400 shadow-sm font-medium'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Decision Flowchart
          </button>
        </div>

        {/* Active document name */}
        {activeView === 'procesflow' && activeCanvasName && (
          <span className="text-sm text-blue-400 font-medium ml-2">
            - {activeCanvasName}
          </span>
        )}
        {activeView === 'decision' && activeFlowchartName && (
          <span className="text-sm text-purple-400 font-medium ml-2">
            - {activeFlowchartName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* ProcesFlow toolbar */}
        {activeView === 'procesflow' && canEdit && (
          <>
            <button
              onClick={onAddNode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Nieuwe processtap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Processtap</span>
            </button>
            <button
              onClick={onAddEdge}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Nieuwe link"
            >
              <Link className="w-4 h-4" />
              <span className="hidden sm:inline">Link</span>
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Ongedaan maken (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Ongedaan</span>
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button
              onClick={onNewCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              title="Nieuw canvas"
            >
              <FilePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nieuw</span>
            </button>
            <button
              onClick={onSaveCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Canvas opslaan"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Opslaan</span>
            </button>
            <button
              onClick={onOpenArchive}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              title="Archief openen"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Archief</span>
            </button>
            <button
              onClick={onImportDocument}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              title="Proces importeren uit document"
            >
              <FileInput className="w-4 h-4" />
              <span className="hidden sm:inline">Importeren</span>
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button
              onClick={toggleEditMode}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isEditMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {isEditMode ? 'Bewerken' : 'Bekijken'}
            </button>
          </>
        )}

        {/* Decision Flowchart toolbar */}
        {activeView === 'decision' && canEdit && (
          <>
            {/* Node type buttons */}
            <button
              onClick={() => onAddDecisionNode?.('start')}
              className="flex items-center gap-1 px-2 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Start toevoegen"
            >
              <Play className="w-4 h-4" />
              <span className="hidden lg:inline">Start</span>
            </button>
            <button
              onClick={() => onAddDecisionNode?.('decision')}
              className="flex items-center gap-1 px-2 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              title="Beslissing toevoegen"
            >
              <Question className="w-4 h-4" />
              <span className="hidden lg:inline">Beslissing</span>
            </button>
            <button
              onClick={() => onAddDecisionNode?.('action')}
              className="flex items-center gap-1 px-2 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Actie toevoegen"
            >
              <Cog className="w-4 h-4" />
              <span className="hidden lg:inline">Actie</span>
            </button>
            <button
              onClick={() => onAddDecisionNode?.('end')}
              className="flex items-center gap-1 px-2 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Einde toevoegen"
            >
              <StopCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Einde</span>
            </button>
            <button
              onClick={onAddDecisionEdge}
              className="flex items-center gap-1.5 px-2 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Verbinding toevoegen"
            >
              <Link className="w-4 h-4" />
              <span className="hidden lg:inline">Verbinding</span>
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button
              onClick={onNewDecisionFlowchart}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              title="Nieuw flowchart"
            >
              <FilePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nieuw</span>
            </button>
            <button
              onClick={onSaveDecisionFlowchart}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Flowchart opslaan"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Opslaan</span>
            </button>
            <button
              onClick={onOpenDecisionArchive}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              title="Archief openen"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Archief</span>
            </button>
          </>
        )}

        <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg" title="Help">
          <HelpCircle className="w-5 h-5" />
        </button>

        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg"
            title="Beheerdersdashboard"
          >
            <Settings className="w-5 h-5 text-blue-500" />
          </button>
        )}

        {!isAdmin && (
          <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg" title="Instellingen">
            <Settings className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-gray-700 ml-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-300" />
          </div>
          {user ? (
            <div className="text-sm">
              <div className="font-medium text-gray-100">{user.naam}</div>
              <div className="text-xs text-gray-400">{user.rol}</div>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Gast</span>
          )}
        </div>
      </div>
    </header>
  );
}
