import { Plus } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {Icon && <Icon size={36} />}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          <Plus size={18} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
