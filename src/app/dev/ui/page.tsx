'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { GoldDivider } from '@/components/ui/gold-divider';
import { Input } from '@/components/ui/input';
import { PriceText } from '@/components/ui/price-text';
import { SectionLabel } from '@/components/ui/section-label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusDot } from '@/components/ui/status-dot';
import { Textarea } from '@/components/ui/textarea';

export default function UiDemoPage() {
  const [checked, setChecked] = useState(false);

  return (
    <main className="min-h-screen bg-emerald-900 px-6 py-16 text-ivory lg:px-20">
      <div className="mx-auto max-w-5xl space-y-16">
        <SectionLabel label="Development" title="UI Primitives" light />
        <GoldDivider />
        <section className="grid gap-6 md:grid-cols-2">
          <FormField id="name" label="Nama Lengkap">
            <Input id="name" placeholder="Nama tamu" />
          </FormField>
          <FormField id="type" label="Tipe Kamar">
            <Select id="type">
              <option>Deluxe</option>
              <option>Suite</option>
            </Select>
          </FormField>
          <DateRangePicker label="Tanggal Masuk" />
          <FormField id="message" label="Catatan">
            <Textarea id="message" placeholder="Permintaan khusus" />
          </FormField>
          <Checkbox
            id="terms"
            label="Saya menyetujui syarat reservasi"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
          />
        </section>
        <section className="flex flex-wrap gap-3">
          <Button onClick={() => toast.success('Tindakan berhasil disimpan.')}>
            Primary
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </section>
        <section className="flex flex-wrap gap-6">
          <PriceText value={500000} />
          <StatusDot label="Dikonfirmasi" color="success" />
          <Skeleton className="h-8 w-40" />
        </section>
        <EmptyState
          title="Belum ada booking"
          description="Booking Anda akan muncul di sini setelah reservasi dibuat."
        />
      </div>
    </main>
  );
}
