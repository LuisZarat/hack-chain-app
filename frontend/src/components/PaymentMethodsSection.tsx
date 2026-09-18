import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Landmark, Globe2, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMyPaymentMethods, useUpdatePaymentMethods } from '@/hooks/usePaymentMethods';
import { P } from '@/components/profile/palette';
import type { GlobalProvider, OnchainWallet } from '@/types/dashboard';

// ---------------------------------------------------------------------------
// Small shared primitives — same visual language as the rest of the page
// ---------------------------------------------------------------------------

interface SectionCardProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ label, description, icon, children }: SectionCardProps) {
  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: P.card, border: `1px solid ${P.border}` }}
    >
      <header
        className="flex items-start gap-3 px-6 py-5"
        style={{ borderBottom: `1px solid ${P.borderSub}` }}
      >
        {icon && (
          <div className="mt-0.5 shrink-0" style={{ color: P.accent }}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: P.textMuted }}>
            {label}
          </h2>
          {description && (
            <p className="text-sm mt-1.5" style={{ color: P.textSecondary }}>
              {description}
            </p>
          )}
        </div>
      </header>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50"
      style={{ backgroundColor: checked ? P.accent : P.surface, border: `1px solid ${checked ? P.accent : P.border}` }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform duration-200"
        style={{
          backgroundColor: checked ? P.bg : P.textMuted,
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}

function TextField({
  value, onChange, placeholder, mono,
}: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors ${mono ? 'font-mono' : ''}`}
      style={{ backgroundColor: P.surface, border: `1px solid ${P.border}`, color: P.textPrimary }}
      onFocus={(e) => (e.currentTarget.style.borderColor = P.borderFocus)}
      onBlur={(e) => (e.currentTarget.style.borderColor = P.border)}
    />
  );
}

function SelectField<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors [color-scheme:dark]"
      style={{ backgroundColor: P.surface, border: `1px solid ${P.border}`, color: P.textPrimary }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ---------------------------------------------------------------------------
// Global providers list (PayPal, Revolut, Wise, Payoneer, Otro)
// ---------------------------------------------------------------------------

const PROVIDER_OPTIONS: { value: GlobalProvider['provider']; label: string }[] = [
  { value: 'paypal', label: 'PayPal' },
  { value: 'revolut', label: 'Revolut' },
  { value: 'wise', label: 'Wise' },
  { value: 'payoneer', label: 'Payoneer' },
  { value: 'other', label: 'Otro' },
];

function GlobalProvidersList({
  providers, onChange,
}: { providers: GlobalProvider[]; onChange: (p: GlobalProvider[]) => void }) {
  const addProvider = () => onChange([...providers, { provider: 'paypal', identifier: '' }]);
  const removeProvider = (idx: number) => onChange(providers.filter((_, i) => i !== idx));
  const updateProvider = (idx: number, patch: Partial<GlobalProvider>) =>
    onChange(providers.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-3">
      {providers.map((p, idx) => (
        <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl p-3" style={{ backgroundColor: P.surface, border: `1px solid ${P.border}` }}>
          <SelectField
            value={p.provider}
            onChange={(v) => updateProvider(idx, { provider: v, providerLabel: v === 'other' ? p.providerLabel : undefined })}
            options={PROVIDER_OPTIONS}
          />
          {p.provider === 'other' && (
            <div className="flex-1 min-w-[140px]">
              <TextField
                value={p.providerLabel ?? ''}
                onChange={(v) => updateProvider(idx, { providerLabel: v })}
                placeholder="Nombre del proveedor"
              />
            </div>
          )}
          <div className="flex-1 min-w-[180px]">
            <TextField
              value={p.identifier}
              onChange={(v) => updateProvider(idx, { identifier: v })}
              placeholder="Correo, usuario o link de pago"
            />
          </div>
          <button type="button" onClick={() => removeProvider(idx)} className="p-2 rounded-lg transition-colors" style={{ color: P.textMuted }}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addProvider}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: P.accent }}
      >
        <Plus className="h-4 w-4" />
        Agregar proveedor
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onchain wallets list (Polygon, Tron, BNB, Ethereum)
// ---------------------------------------------------------------------------

const NETWORK_OPTIONS: { value: OnchainWallet['network']; label: string }[] = [
  { value: 'polygon', label: 'Polygon' },
  { value: 'tron', label: 'Tron (TRC-20)' },
  { value: 'bnb', label: 'BNB Chain (BEP-20)' },
  { value: 'ethereum', label: 'Ethereum (ERC-20)' },
];

function OnchainWalletsList({
  wallets, onChange,
}: { wallets: OnchainWallet[]; onChange: (w: OnchainWallet[]) => void }) {
  const addWallet = () => onChange([...wallets, { network: 'polygon', address: '' }]);
  const removeWallet = (idx: number) => onChange(wallets.filter((_, i) => i !== idx));
  const updateWallet = (idx: number, patch: Partial<OnchainWallet>) =>
    onChange(wallets.map((w, i) => (i === idx ? { ...w, ...patch } : w)));

  return (
    <div className="space-y-3">
      {wallets.map((w, idx) => (
        <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl p-3" style={{ backgroundColor: P.surface, border: `1px solid ${P.border}` }}>
          <SelectField value={w.network} onChange={(v) => updateWallet(idx, { network: v })} options={NETWORK_OPTIONS} />
          <div className="flex-1 min-w-[220px]">
            <TextField value={w.address} onChange={(v) => updateWallet(idx, { address: v })} placeholder="0x... / T..." mono />
          </div>
          <button type="button" onClick={() => removeWallet(idx)} className="p-2 rounded-lg transition-colors" style={{ color: P.textMuted }}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addWallet}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: P.accent }}
      >
        <Plus className="h-4 w-4" />
        Agregar wallet
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main self-contained section — own data fetch + own save button,
// same pattern as ClassCatalogSection.
// ---------------------------------------------------------------------------

interface PaymentMethodsSectionProps {
  prefersReduced: boolean | null;
}

export function PaymentMethodsSection({ prefersReduced }: PaymentMethodsSectionProps) {
  const { toast } = useToast();
  const { data: paymentMethods, isPending: isLoading } = useMyPaymentMethods();
  const updatePaymentMethods = useUpdatePaymentMethods();

  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [globalProviders, setGlobalProviders] = useState<GlobalProvider[]>([]);

  const [localEnabled, setLocalEnabled] = useState(false);
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftBic, setSwiftBic] = useState('');

  const [onchainEnabled, setOnchainEnabled] = useState(false);
  const [wallets, setWallets] = useState<OnchainWallet[]>([]);

  useEffect(() => {
    if (!paymentMethods) return;
    setGlobalEnabled(paymentMethods.global?.enabled ?? false);
    setGlobalProviders(paymentMethods.global?.providers ?? []);

    setLocalEnabled(paymentMethods.local?.enabled ?? false);
    setCountry(paymentMethods.local?.country ?? '');
    setCurrency(paymentMethods.local?.currency ?? '');
    setBankName(paymentMethods.local?.bankName ?? '');
    setAccountHolder(paymentMethods.local?.accountHolder ?? '');
    setAccountNumber(paymentMethods.local?.accountNumber ?? '');
    setSwiftBic(paymentMethods.local?.swiftBic ?? '');

    setOnchainEnabled(paymentMethods.onchain?.enabled ?? false);
    setWallets(paymentMethods.onchain?.wallets ?? []);
  }, [paymentMethods]);

  const isSaving = updatePaymentMethods.isPending;

  const handleSave = async () => {
    if (localEnabled && (!country || !currency || !bankName || !accountHolder || !accountNumber)) {
      toast({
        title: 'Faltan datos',
        description: 'Completa banco, titular, número de cuenta, país y moneda para el pago local.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updatePaymentMethods.mutateAsync({
        global: { enabled: globalEnabled, providers: globalProviders },
        local: {
          enabled: localEnabled,
          country,
          currency,
          bankName,
          accountHolder,
          accountNumber,
          swiftBic: swiftBic || null,
        },
        onchain: { enabled: onchainEnabled, wallets },
      });
      toast({ title: 'Métodos de pago guardados' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  if (isLoading) return null;

  return (
    <SectionCard
      label="Métodos de pago"
      description="Configura cómo quieres que los talentos te paguen tus clases."
      icon={<Wallet className="h-4 w-4" />}
    >
      <div className="space-y-6">

        {/* Global */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: P.textPrimary }}>
              <Globe2 className="h-4 w-4" style={{ color: P.accent }} />
              Pago Global (PayPal, Revolut, Wise, etc.)
            </span>
            <Toggle checked={globalEnabled} onChange={setGlobalEnabled} disabled={isSaving} />
          </div>
          <AnimatePresence initial={false}>
            {globalEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <GlobalProvidersList providers={globalProviders} onChange={setGlobalProviders} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: 1, backgroundColor: P.borderSub }} />

        {/* Local */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: P.textPrimary }}>
              <Landmark className="h-4 w-4" style={{ color: P.accent }} />
              Pago Local (Transferencia bancaria)
            </span>
            <Toggle checked={localEnabled} onChange={setLocalEnabled} disabled={isSaving} />
          </div>
          <AnimatePresence initial={false}>
            {localEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField value={country} onChange={setCountry} placeholder="País (ej. MX, ES, US)" />
                  <TextField value={currency} onChange={setCurrency} placeholder="Moneda (ej. MXN, USD)" />
                  <TextField value={bankName} onChange={setBankName} placeholder="Nombre del banco" />
                  <TextField value={accountHolder} onChange={setAccountHolder} placeholder="Titular de la cuenta" />
                  <TextField value={accountNumber} onChange={setAccountNumber} placeholder="CLABE / IBAN / Cuenta" mono />
                  <TextField value={swiftBic} onChange={setSwiftBic} placeholder="SWIFT/BIC (opcional)" mono />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: 1, backgroundColor: P.borderSub }} />

        {/* Onchain */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: P.textPrimary }}>
              <Wallet className="h-4 w-4" style={{ color: P.accent }} />
              Pago Onchain (USDT)
            </span>
            <Toggle checked={onchainEnabled} onChange={setOnchainEnabled} disabled={isSaving} />
          </div>
          <AnimatePresence initial={false}>
            {onchainEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <OnchainWalletsList wallets={wallets} onChange={setWallets} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save button — own, independent from the page's main "Guardar" footer */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
          style={{ backgroundColor: P.accent, color: P.bg }}
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Guardar métodos de pago
        </button>
      </div>
    </SectionCard>
  );
}