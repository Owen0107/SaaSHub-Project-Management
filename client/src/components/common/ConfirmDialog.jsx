import { useState } from 'react';
import { createContext, useContext } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const confirm = ({ title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', variant = 'danger' }) => {
    return new Promise((resolve) => {
      setDialog({ title, message, confirmText, cancelText, variant, resolve });
    });
  };

  const handleConfirm = () => { dialog?.resolve(true); setDialog(null); };
  const handleCancel = () => { dialog?.resolve(false); setDialog(null); };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()} role="alertdialog" aria-labelledby="confirm-title">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: dialog.variant === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={22} color={dialog.variant === 'danger' ? 'var(--danger)' : 'var(--warning)'} />
              </div>
              <div>
                <h3 id="confirm-title" className="modal-title">{dialog.title}</h3>
                <p className="modal-body" style={{ marginBottom: 0 }}>{dialog.message}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>{dialog.cancelText}</button>
              <button className={`btn ${dialog.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={handleConfirm}>{dialog.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
};
