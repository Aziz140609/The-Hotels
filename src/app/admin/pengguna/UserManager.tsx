'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/table';
import { createUser, updateUser, deleteUser } from '@/lib/actions/admin-users';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

export interface AdminUserRow {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string | null;
  role: 'admin' | 'user';
  created_at: string;
}

export function UserManager({
  rows,
  total,
  page,
  pageSize,
  filters,
  currentAdminId,
}: {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: { q: string; role: string };
  currentAdminId: string;
}) {
  const router = useRouter();
  const [local, setLocal] = useState(filters);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = (q: string, role: string, nextPage = 1) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (nextPage > 1) params.set('page', String(nextPage));
    router.push(`/admin/pengguna${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await deleteUser(deleting.id);
    setBusy(false);
    setDeleting(null);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success('Pengguna dihapus');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex items-end justify-between gap-4 border-b border-gold/25 pb-3">
        <div>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-gold">MANAJEMEN AKUN</span>
          <h1 className="font-serif text-3xl text-ivory">Pengguna</h1>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Tambah Pengguna
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters(local.q, local.role);
        }}
        className="mb-6 flex flex-col gap-3 border-b border-gold/20 pb-3 md:flex-row md:items-center"
      >
        <Input value={local.q} onChange={(e) => setLocal({ ...local, q: e.target.value })} placeholder="Cari nama / email..." className="md:max-w-xs" />
        <Select value={local.role} onChange={(e) => setLocal({ ...local, role: e.target.value })} className="md:max-w-[160px]">
          <option value="" className="bg-emerald-900">Semua Peran</option>
          <option value="admin" className="bg-emerald-900">Admin</option>
          <option value="user" className="bg-emerald-900">User</option>
        </Select>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" size="sm">Terapkan</Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocal({ q: '', role: '' });
              applyFilters('', '');
            }}
          >
            Reset
          </Button>
        </div>
        <span className="text-[11px] text-muted-ivory md:ml-auto">{total} pengguna</span>
      </form>

      {rows.length === 0 ? (
        <div className="py-10">
          <EmptyState title="Belum ada pengguna" description="Belum ada akun yang cocok dengan filter." />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold/30">
                {['NAMA', 'EMAIL', 'NO. HP', 'PERAN', 'TERDAFTAR', 'AKSI'].map((h, i) => (
                  <th key={h} className={`px-2 py-3 text-[10px] font-normal uppercase tracking-[0.2em] text-gold ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15 text-[13px]">
              {rows.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-gold/5">
                  <td className="px-2 py-3.5 text-ivory">
                    {u.nama_lengkap}
                    {u.id === currentAdminId && <span className="ml-2 text-[10px] uppercase tracking-widest text-gold">(Anda)</span>}
                  </td>
                  <td className="px-2 py-3.5 text-muted-ivory">{u.email}</td>
                  <td className="px-2 py-3.5 text-muted-ivory">{u.no_hp ?? '-'}</td>
                  <td className="px-2 py-3.5">
                    <span className={`text-[10px] uppercase tracking-widest ${u.role === 'admin' ? 'text-gold' : 'text-muted-ivory'}`}>{u.role}</span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-muted-ivory">{formatDate(u.created_at)}</td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setEditing(u)} className="text-[11px] uppercase tracking-widest text-gold hover:text-ivory">
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={u.id === currentAdminId}
                        onClick={() => setDeleting(u)}
                        className="text-[11px] uppercase tracking-widest text-danger hover:text-ivory disabled:opacity-30"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => applyFilters(filters.q, filters.role, p)} />
        </div>
      )}

      <Dialog open={creating} onClose={() => setCreating(false)} title="Tambah Pengguna">
        {creating && <CreateUserForm onDone={() => setCreating(false)} />}
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Edit Pengguna">
        {editing && <EditUserForm key={editing.id} user={editing} onDone={() => setEditing(null)} />}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Hapus Pengguna"
        message={busy ? 'Menghapus...' : `Hapus akun ${deleting?.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`}
        danger
      />
    </div>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (fd: FormData) => {
    setBusy(true);
    setErrors({});
    const res = await createUser({
      nama_lengkap: String(fd.get('nama_lengkap') ?? ''),
      email: String(fd.get('email') ?? ''),
      no_hp: String(fd.get('no_hp') ?? '') || undefined,
      password: String(fd.get('password') ?? ''),
      role: fd.get('role') as 'admin' | 'user',
    });
    setBusy(false);
    if (!res.ok) {
      setErrors((res.fieldErrors ?? {}) as Record<string, string[]>);
      toast.error(res.message);
      return;
    }
    toast.success('Pengguna ditambahkan');
    router.refresh();
    onDone();
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <FormField id="nama_lengkap" label="Nama Lengkap" error={errors.nama_lengkap?.[0]}>
        <Input id="nama_lengkap" name="nama_lengkap" required maxLength={100} />
      </FormField>
      <FormField id="email" label="Email" error={errors.email?.[0]}>
        <Input id="email" name="email" type="email" required />
      </FormField>
      <FormField id="no_hp" label="No. HP (opsional)" error={errors.no_hp?.[0]}>
        <Input id="no_hp" name="no_hp" placeholder="081234567890" />
      </FormField>
      <FormField id="password" label="Password Sementara" error={errors.password?.[0]}>
        <Input id="password" name="password" type="text" required minLength={8} />
      </FormField>
      <FormField id="role" label="Peran" error={errors.role?.[0]}>
        <Select id="role" name="role" defaultValue="user">
          <option value="user" className="bg-emerald-900">User</option>
          <option value="admin" className="bg-emerald-900">Admin</option>
        </Select>
      </FormField>
      <div className="flex justify-end gap-3 border-t border-gold/25 pt-5">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>Batal</Button>
        <Button type="submit" size="sm" loading={busy}>Tambah</Button>
      </div>
    </form>
  );
}

function EditUserForm({ user, onDone }: { user: AdminUserRow; onDone: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (fd: FormData) => {
    setBusy(true);
    setErrors({});
    const res = await updateUser(user.id, {
      nama_lengkap: String(fd.get('nama_lengkap') ?? ''),
      no_hp: String(fd.get('no_hp') ?? '') || undefined,
      role: fd.get('role') as 'admin' | 'user',
    });
    setBusy(false);
    if (!res.ok) {
      setErrors((res.fieldErrors ?? {}) as Record<string, string[]>);
      toast.error(res.message);
      return;
    }
    toast.success('Pengguna diperbarui');
    router.refresh();
    onDone();
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <FormField id="nama_lengkap" label="Nama Lengkap" error={errors.nama_lengkap?.[0]}>
        <Input id="nama_lengkap" name="nama_lengkap" defaultValue={user.nama_lengkap} required maxLength={100} />
      </FormField>
      <FormField id="email" label="Email">
        <Input id="email" name="email" defaultValue={user.email} disabled />
      </FormField>
      <FormField id="no_hp" label="No. HP" error={errors.no_hp?.[0]}>
        <Input id="no_hp" name="no_hp" defaultValue={user.no_hp ?? ''} />
      </FormField>
      <FormField id="role" label="Peran" error={errors.role?.[0]}>
        <Select id="role" name="role" defaultValue={user.role}>
          <option value="user" className="bg-emerald-900">User</option>
          <option value="admin" className="bg-emerald-900">Admin</option>
        </Select>
      </FormField>
      <div className="flex justify-end gap-3 border-t border-gold/25 pt-5">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>Batal</Button>
        <Button type="submit" size="sm" loading={busy}>Simpan</Button>
      </div>
    </form>
  );
}
