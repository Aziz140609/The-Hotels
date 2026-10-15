import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Dialog } from './dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  danger?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }: ConfirmDialogProps) {
  return <Dialog open={open} onClose={onClose} title={title}><div className="space-y-6"><div className="flex gap-3 text-muted-ivory"><AlertTriangle className={danger ? 'text-danger' : 'text-gold'} strokeWidth={1.25} /><p className="text-sm leading-6">{message}</p></div><div className="flex justify-end gap-3"><Button variant="outline" size="sm" onClick={onClose}>Batal</Button><Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>Konfirmasi</Button></div></div></Dialog>;
}
