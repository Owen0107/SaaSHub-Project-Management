import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useProject } from '../contexts/ProjectContext';
import { useConfirm } from '../components/common/ConfirmDialog';
import KanbanColumn from '../components/Kanban/KanbanColumn';
import KanbanCard from '../components/Kanban/KanbanCard';
import EmptyState from '../components/common/EmptyState';
import CreateProjectModal from '../components/common/CreateProjectModal';
import Skeleton from '../components/common/Skeleton';
import CreateTaskModal from '../components/Kanban/CreateTaskModal';
import PageTransition from '../components/PageTransition';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, KanbanSquare, FolderPlus } from 'lucide-react';
import './Kanban.css';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#6B7280' },
  { id: 'in_progress', title: 'In Progress', color: '#0984E3' },
  { id: 'in_review', title: 'In Review', color: '#FDCB6E' },
  { id: 'done', title: 'Done', color: '#00B894' },
];

const KanbanPage = () => {
  const { currentProject, loading: projectLoading, fetchProjects } = useProject();
  const confirm = useConfirm();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchTasks = async () => {
    if (!currentProject) return;
    try {
      const { data } = await api.get(`/tasks?project=${currentProject._id}&limit=100`);
      setTasks(data.tasks);
    } catch (err) {
      toast.error('Không thể tải danh sách tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectLoading) return;
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTasks();
  }, [currentProject, projectLoading]);

  const getColumnTasks = (status) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event) => {
    const task = tasks.find(t => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id; // column id

    if (!COLUMNS.find(c => c.id === newStatus)) return;

    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    const prevTasks = [...tasks];
    setTasks(prev => prev.map(t =>
      t._id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`${task.taskId} → ${COLUMNS.find(c => c.id === newStatus)?.title}`);
    } catch (err) {
      // Rollback on error
      setTasks(prevTasks);
      toast.error('Cập nhật thất bại, đã hoàn tác');
    }
  };

  const handleDelete = async (task) => {
    const ok = await confirm({
      title: `Xóa ${task.taskId}?`,
      message: `Xóa task "${task.title}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;

    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(t => t._id !== task._id));

    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success(`Đã xóa ${task.taskId}`, {
        duration: 5000,
        icon: '🗑️',
      });
    } catch (err) {
      setTasks(prevTasks);
      toast.error('Xóa thất bại');
    }
  };

  const handleCreate = async (taskData) => {
    try {
      const { data } = await api.post('/tasks', { ...taskData, project: currentProject._id });
      setTasks(prev => [...prev, data]);
      toast.success(`Tạo ${data.taskId} thành công!`);
      setShowCreate(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tạo task thất bại');
    }
  };

  if (loading || projectLoading) {
    return (
      <div className="page-container">
        <div className="page-header"><Skeleton variant="title" /></div>
        <div className="kanban-board">
          {COLUMNS.map(c => (
            <div key={c.id} className="kanban-column">
              <Skeleton variant="title" width="60%" />
              <Skeleton variant="card" count={3} style={{ marginBottom: 12 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Kanban Board</h1>
        </div>
        <EmptyState
          icon={FolderPlus}
          title="Chưa có project nào"
          description="Tạo project đầu tiên để bắt đầu quản lý công việc trên Kanban board."
          actionText="Tạo Project đầu tiên"
          onAction={() => setShowCreateProject(true)}
        />
        {showCreateProject && (
          <CreateProjectModal
            onClose={() => setShowCreateProject(false)}
            onCreated={() => fetchProjects()}
          />
        )}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Kanban Board</h1>
          <p>{currentProject?.name}</p>
        </div>
        <EmptyState
          icon={KanbanSquare}
          title="Chưa có task nào"
          description="Tạo task đầu tiên để bắt đầu quản lý công việc trên Kanban board."
          actionText="Tạo task đầu tiên"
          onAction={() => setShowCreate(true)}
        />
        {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      </div>
    );
  }

  return (
    <PageTransition className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Kanban Board</h1>
          <p>{currentProject?.name} — {tasks.length} tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Tạo task
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(col => (
            <KanbanColumn key={col.id} column={col} tasks={getColumnTasks(col.id)} onDelete={handleDelete} />
          ))}
        </div>
        <DragOverlay>
          {activeTask && <KanbanCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </PageTransition>
  );
};

export default KanbanPage;
