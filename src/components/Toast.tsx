import { useUI } from '../context/UIContext';
import styles from './Toast.module.css';

export default function Toast() {
  const { toasts, removeToast } = useUI();

  return (
    <>
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles[toast.type]}`}>
            <p className={styles.message}>{toast.message}</p>
            <button
              className={styles.confirmBtn}
              onClick={() => removeToast(toast.id)}
            >
              확인
            </button>
          </div>
        </div>
      ))}
    </>
  );
};
