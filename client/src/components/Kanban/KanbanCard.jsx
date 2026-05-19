import { useDraggable } from '@dnd-kit/core';
import { Trash2, GitCommit } from 'lucide-react';

const KanbanCard = ({ task, isDragging, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task._id });

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    zIndex: 999,
  } : undefined;

  const priorityMap = {
    high: { label: 'High', class: 'badge-high' },
    medium: { label: 'Medium', class: 'badge-medium' },
    low: { label: 'Low', class: 'badge-low' },
  };

  const priority = priorityMap[task.priority] || priorityMap.medium;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`kanban-card ${isDragging ? 'dragging' : ''}`}>
      {onDelete && (
        <div className="kanban-card-actions">
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onDelete(task); }} aria-label={`Delete ${task.taskId}`}>
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="kanban-card-id">{task.taskId}</div>
      <div className="kanban-card-title">{task.title}</div>

      <div className="kanban-card-footer">
        <div className="kanban-card-meta">
          <span className={`badge ${priority.class}`}>{priority.label}</span>
          {task.commits?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
              <GitCommit size={12} /> {task.commits.length}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="avatar avatar-sm" style={{ background: task.assignee.avatar || 'var(--primary)' }} title={task.assignee.name}>
            {task.assignee.initials}
          </div>
        )}
      </div>

      {task.progress > 0 && (
        <div className="kanban-card-progress">
          <div className="kanban-card-progress-bar" style={{ width: `${task.progress}%` }} />
        </div>
      )}
    </div>
  );
};

export default KanbanCard;
