import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ column, tasks, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="kanban-column" style={{ borderTop: `3px solid ${column.color}`, ...(isOver ? { background: 'var(--bg-hover)' } : {}) }}>
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <div className="kanban-column-dot" style={{ background: column.color }} />
          {column.title}
        </div>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>
      <div className="kanban-column-body" ref={setNodeRef}>
        {tasks.map(task => (
          <KanbanCard key={task._id} task={task} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
