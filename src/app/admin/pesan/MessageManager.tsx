'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  MailOpen,
  Trash2,
  Search,
  ExternalLink,
  Inbox,
  Clock,
  User,
  Copy,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/table';
import { markMessageRead, deleteMessage } from '@/lib/actions/contact';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

export interface AdminMessageRow {
  id: number;
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
}

export function MessageManager({
  rows,
  total,
  unreadCount,
  page,
  pageSize,
  filters,
}: {
  rows: AdminMessageRow[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  filters: { q: string; status: string };
}) {
  const router = useRouter();
  const [local, setLocal] = useState(filters);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessageRow | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<AdminMessageRow | null>(null);
  const [busy, setBusy] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = (q: string, status: string, nextPage = 1) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status && status !== 'semua') params.set('status', status);
    if (nextPage > 1) params.set('page', String(nextPage));
    router.push(`/admin/pesan${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleOpenMessage = async (msg: AdminMessageRow) => {
    setSelectedMessage(msg);
    // If unread, mark as read automatically
    if (!msg.is_read) {
      await markMessageRead(msg.id, true);
      router.refresh();
    }
  };

  const handleToggleRead = async (msg: AdminMessageRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    const result = await markMessageRead(msg.id, !msg.is_read);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(msg.is_read ? 'Pesan ditandai belum dibaca' : 'Pesan ditandai sudah dibaca');
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingMessage) return;
    setBusy(true);
    const result = await deleteMessage(deletingMessage.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success('Pesan berhasil dihapus');
    setDeletingMessage(null);
    if (selectedMessage?.id === deletingMessage.id) {
      setSelectedMessage(null);
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-gold/20 bg-emerald-950/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-ivory">Total Pesan</span>
            <Inbox className="h-4 w-4 text-gold" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-3xl text-ivory">{total}</p>
        </div>
        <div className="border border-gold/30 bg-emerald-950/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-gold">Belum Dibaca</span>
            <Mail className="h-4 w-4 text-gold animate-pulse" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-3xl text-gold">{unreadCount}</p>
        </div>
        <div className="border border-gold/20 bg-emerald-950/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-ivory">Sudah Dibaca</span>
            <MailOpen className="h-4 w-4 text-muted-ivory" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-3xl text-muted-ivory">{Math.max(0, total - unreadCount)}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 border-b border-gold/20 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Input
              id="search-message"
              placeholder="Cari nama, email, subjek, atau pesan..."
              value={local.q}
              onChange={(e) => setLocal((prev) => ({ ...prev, q: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters(local.q, local.status);
              }}
              className="pl-9"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
          </div>
          <div className="w-full sm:w-48">
            <Select
              id="filter-status"
              value={local.status}
              onChange={(e) => {
                const nextStatus = e.target.value;
                setLocal((prev) => ({ ...prev, status: nextStatus }));
                applyFilters(local.q, nextStatus);
              }}
            >
              <option value="semua">Semua Status</option>
              <option value="unread">Belum Dibaca</option>
              <option value="read">Sudah Dibaca</option>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFilters(local.q, local.status)}
          >
            Terapkan
          </Button>
        </div>
      </div>

      {/* Messages Table */}
      {rows.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesan"
          description={
            filters.q || (filters.status && filters.status !== 'semua')
              ? 'Tidak ditemukan pesan dengan filter pencarian tersebut.'
              : 'Belum ada pesan yang masuk dari pengunjung.'
          }
        />
      ) : (
        <div className="overflow-x-auto border border-gold/20 bg-emerald-950/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gold/20 bg-emerald-900/40 text-[10px] uppercase tracking-wider text-gold">
              <tr>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Pengirim</th>
                <th className="px-5 py-4">Subjek & Pesan</th>
                <th className="px-5 py-4">Waktu</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 text-ivory">
              {rows.map((msg) => (
                <tr
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`group cursor-pointer transition-colors hover:bg-emerald-900/60 ${
                    !msg.is_read ? 'bg-gold/5 font-medium' : ''
                  }`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    {msg.is_read ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-ivory/70">
                        <MailOpen className="h-3.5 w-3.5" />
                        Dibaca
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-gold">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
                        BARU
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className={`text-[14px] ${!msg.is_read ? 'text-ivory font-semibold' : 'text-ivory/90'}`}>
                      {msg.nama}
                    </p>
                    <a
                      href={`mailto:${msg.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12px] font-light text-gold/80 hover:text-gold hover:underline"
                    >
                      {msg.email}
                    </a>
                  </td>
                  <td className="px-5 py-4 max-w-md">
                    <p className={`text-[14px] truncate ${!msg.is_read ? 'text-gold' : 'text-ivory'}`}>
                      {msg.subjek}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[12px] font-light text-muted-ivory/70">
                      {msg.pesan}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-[12px] font-light text-muted-ivory whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gold/60" />
                      {formatDate(msg.created_at)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleToggleRead(msg, e)}
                        disabled={busy}
                        title={msg.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                        className="h-8 px-2 text-gold hover:text-ivory"
                      >
                        {msg.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingMessage(msg);
                        }}
                        disabled={busy}
                        title="Hapus pesan"
                        className="h-8 px-2 text-danger hover:text-danger/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end pt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => applyFilters(local.q, local.status, p)}
          />
        </div>
      )}

      {/* Modal Detail Pesan */}
      <Dialog
        open={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subjek || 'Detail Pesan'}
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="border-b border-gold/20 pb-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-ivory">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gold" />
                  <span className="font-medium text-ivory text-sm">{selectedMessage.nama}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gold/70" />
                  <span>{formatDate(selectedMessage.created_at)}</span>
                </div>
              </div>
              <div className="text-xs text-muted-ivory">
                <span className="text-gold uppercase tracking-wider text-[10px]">Email: </span>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subjek)}`}
                  className="text-ivory hover:text-gold hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto rounded border border-gold/15 bg-emerald-950/70 p-4">
              <p className="text-[14px] font-light leading-relaxed whitespace-pre-wrap text-ivory">
                {selectedMessage.pesan}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingMessage(selectedMessage)}
                className="text-danger border-danger/60 hover:bg-danger hover:text-ivory"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Pesan
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMessage.email);
                    toast.success(`Alamat email ${selectedMessage.email} berhasil disalin!`);
                  }}
                  title="Salin alamat email tamu"
                  className="inline-flex items-center justify-center gap-1.5 border border-gold/40 bg-gold/5 px-3 py-2 text-[11px] uppercase tracking-wider text-muted-ivory transition-colors hover:bg-gold/15 hover:text-gold"
                >
                  <Copy className="h-3.5 w-3.5 text-gold" />
                  Salin
                </button>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMessage.email)}&su=${encodeURIComponent(`Re: ${selectedMessage.subjek} - The Hotels`)}&body=${encodeURIComponent(`Halo ${selectedMessage.nama},\n\nTerima kasih telah menghubungi The Hotels.\n\nMenanggapi pesan Anda mengenai "${selectedMessage.subjek}":\n\n[Tulis balasan Anda di sini]\n\n---\nSalam hangat,\nTim Concierge The Hotels\nJl. Contoh No. 1, Surakarta`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-gold bg-gold px-4 py-2 text-[11px] font-medium uppercase tracking-label text-emerald-900 transition-colors hover:bg-gold/90"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Balas via Gmail
                </a>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deletingMessage)}
        onClose={() => setDeletingMessage(null)}
        onConfirm={handleDelete}
        title="Hapus Pesan Masuk"
        message={`Apakah Anda yakin ingin menghapus pesan dari "${deletingMessage?.nama}" mengenai "${deletingMessage?.subjek}"? Tindakan ini tidak dapat dibatalkan.`}
        danger
      />
    </div>
  );
}

