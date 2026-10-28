import { useRef, type ReactNode, useEffect } from 'react';
type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog ref={dialogRef} onCancel={(e) => {  e.preventDefault();  onClose(); }}
        >
            <div className="modal-header">
                <h2>{title}</h2>
                <button className="modal-close" type="button" aria-label="סגירה" onClick={onClose}>
                    ✕
                </button>
            </div>
            {open && children}
        </dialog>
    )
}
export default Modal;