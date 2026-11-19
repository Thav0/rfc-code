import { Bell, BellRing, Check, Edit3, Star, Trash2, X } from 'lucide-react';
import type { TFunction } from 'i18next';

import { cn } from '../../../../lib/utils';
import type { Project } from '../../../../types/app';
import type { MCPServerStatus } from '../../types/types';
import { PROJECT_COLORS } from '../../utils/project-colors';
import { getPathBasename, getTaskIndicatorStatus } from '../../utils/utils';

import CodegraphIndicator from './CodegraphIndicator';
import TaskIndicator from './TaskIndicator';

type SidebarProjectMenuRowProps = {
  project: Project;
  isSelected: boolean;
  isStarred: boolean;
  isNotifyEnabled: boolean;
  isDeleting: boolean;
  isEditing: boolean;
  editingName: string;
  editingColor: string | null;
  tasksEnabled: boolean;
  mcpServerStatus: MCPServerStatus;
  onEditingNameChange: (value: string) => void;
  onEditingColorChange: (value: string | null) => void;
  onSelect: (project: Project) => void;
  onToggleStar: (projectId: string) => void;
  onToggleNotify: (projectId: string) => void;
  onStartEditing: (project: Project) => void;
  onCancelEditing: () => void;
  onSaveName: (projectId: string) => void;
  onDelete: (project: Project) => void;
  t: TFunction;
};

const SWATCH_CLASS =
  'h-4 w-4 flex-shrink-0 rounded-full transition-shadow duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const SELECTED_SWATCH_CLASS = 'ring-2 ring-foreground ring-offset-1 ring-offset-card';

const ICON_BUTTON_CLASS =
  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-ctl transition-colors duration-150 ease-out hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function SidebarProjectMenuRow({
  project,
  isSelected,
  isStarred,
  isNotifyEnabled,
  isDeleting,
  isEditing,
  editingName,
  editingColor,
  tasksEnabled,
  mcpServerStatus,
  onEditingNameChange,
  onEditingColorChange,
  onSelect,
  onToggleStar,
  onToggleNotify,
  onStartEditing,
  onCancelEditing,
  onSaveName,
  onDelete,
  t,
}: SidebarProjectMenuRowProps) {
  const sessionCount = Number(project.sessionMeta?.total ?? project.sessions?.length ?? 0);

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5 px-1.5 py-1">
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={editingName}
            onChange={(event) => onEditingNameChange(event.target.value)}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === 'Enter') {
                onSaveName(project.projectId);
              }
              if (event.key === 'Escape') {
                onCancelEditing();
              }
            }}
            className="min-w-0 flex-1 rounded-ctl border border-border bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t('projects.projectNamePlaceholder')}
            autoFocus
          />
          <button
            className={ICON_BUTTON_CLASS}
            onClick={() => onSaveName(project.projectId)}
            title={t('tooltips.save')}
            aria-label={t('tooltips.save')}
          >
            <Check className="h-3 w-3 text-success" />
          </button>
          <button
            className={ICON_BUTTON_CLASS}
            onClick={onCancelEditing}
            title={t('tooltips.cancel')}
            aria-label={t('tooltips.cancel')}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 px-0.5">
          <button
            type="button"
            className={cn(SWATCH_CLASS, 'border border-dashed border-muted-foreground/60', editingColor === null && SELECTED_SWATCH_CLASS)}
            onClick={() => onEditingColorChange(null)}
            title={t('projects.noColor')}
            aria-label={t('projects.noColor')}
            aria-pressed={editingColor === null}
          />
          {PROJECT_COLORS.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              className={cn(SWATCH_CLASS, editingColor === swatch.value && SELECTED_SWATCH_CLASS)}
              style={{ backgroundColor: swatch.value }}
              onClick={() => onEditingColorChange(swatch.value)}
              title={t(`projects.colors.${swatch.key}`)}
              aria-label={t(`projects.colors.${swatch.key}`)}
              aria-pressed={editingColor === swatch.value}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group/project flex items-center gap-1 rounded-ctl px-1 transition-colors duration-150 ease-out hover:bg-[var(--hover)]',
        isSelected && 'bg-[var(--accent-tint)]',
        isDeleting && 'pointer-events-none opacity-50',
      )}
    >
      <button
        className={ICON_BUTTON_CLASS}
        onClick={() => onToggleStar(project.projectId)}
        title={isStarred ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
        aria-label={isStarred ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
        aria-pressed={isStarred}
      >
        <Star className={cn('h-3 w-3', isStarred ? 'fill-current text-warning' : 'text-faint')} />
      </button>

      <button
        className={ICON_BUTTON_CLASS}
        onClick={() => onToggleNotify(project.projectId)}
        title={isNotifyEnabled ? t('tooltips.disableProjectNotifications') : t('tooltips.enableProjectNotifications')}
        aria-label={isNotifyEnabled ? t('tooltips.disableProjectNotifications') : t('tooltips.enableProjectNotifications')}
        aria-pressed={isNotifyEnabled}
      >
        {isNotifyEnabled ? (
          <BellRing className="h-3 w-3 text-primary" />
        ) : (
          <Bell className="h-3 w-3 text-faint" />
        )}
      </button>

      <button
        // The row's menu item proper — the star/rename/delete buttons beside it
        // are secondary actions on the same project, not separate menu entries.
        role="menuitem"
        className="flex min-w-0 flex-1 flex-col items-start py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSelect(project)}
        aria-current={isSelected ? 'true' : undefined}
        // The display name may be a rename or a package.json name, so hovering
        // shows the repo folder name the project really points at.
        title={getPathBasename(project.fullPath)}
      >
        <span className="flex w-full min-w-0 items-center gap-1.5">
          {project.color && (
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-xs font-medium leading-5 text-foreground">{project.displayName}</span>
          {tasksEnabled && (
            <TaskIndicator status={getTaskIndicatorStatus(project, mcpServerStatus)} size="xs" className="flex-shrink-0" />
          )}
          <CodegraphIndicator project={project} className="flex-shrink-0" />
          <span className="flex-shrink-0 font-mono text-[10px] tracking-wide text-faint">{sessionCount}</span>
        </span>
      </button>

      {/* Rename stays visible so it can be found without hovering; delete is
          destructive, so it only appears on hover or keyboard focus. */}
      <button
        className={ICON_BUTTON_CLASS}
        onClick={() => onStartEditing(project)}
        title={t('tooltips.renameProject')}
        aria-label={t('tooltips.renameProject')}
      >
        <Edit3 className="h-3 w-3 text-muted-foreground" />
      </button>
      <div className="flex flex-shrink-0 items-center opacity-100 transition-opacity duration-150 ease-out md:opacity-0 md:group-focus-within/project:opacity-100 md:group-hover/project:opacity-100">
        <button
          className={ICON_BUTTON_CLASS}
          onClick={() => onDelete(project)}
          title={t('tooltips.deleteProject')}
          aria-label={t('tooltips.deleteProject')}
        >
          <Trash2 className="h-3 w-3 text-danger" />
        </button>
      </div>
    </div>
  );
}
