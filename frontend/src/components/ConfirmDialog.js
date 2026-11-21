import { useEffect, useId, useRef } from 'react';

export default function ConfirmDialog({ title, children, onCancel, onConfirm }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  return <dialog ref={ref} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
    onClose={() => ref.current.returnValue === 'delete' ? onConfirm() : onCancel()}>
    <h2 id={titleId}>{title}</h2>
    <p id={descriptionId}>{children}</p>
    <form method="dialog" className="actions">
      <button className="button button-secondary" value="cancel" autoFocus>Cancel</button>
      <button className="button button-danger" value="delete">Delete</button>
    </form>
  </dialog>;
}
