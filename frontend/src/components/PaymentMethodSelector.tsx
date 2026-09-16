import { useState, useMemo } from 'react';
import { Wallet, Landmark, Globe2, Check } from 'lucide-react';
import type { PaymentMethods, GlobalProvider, OnchainWallet } from '@/types/dashboard';

type MethodKey = 'global' | 'local' | 'onchain';

const PROVIDER_LABELS: Record<GlobalProvider['provider'], string> = {
  paypal: 'PayPal',
  revolut: 'Revolut',
  wise: 'Wise',
  payoneer: 'Payoneer',
  other: 'Otro',
};

const NETWORK_LABELS: Record<OnchainWallet['network'], string> = {
  polygon: 'Polygon',
  tron: 'Tron (TRC-20)',
  bnb: 'BNB Chain (BEP-20)',
  ethereum: 'Ethereum (ERC-20)',
};

// Account-number field label changes by country — extend as needed.
const ACCOUNT_LABELS: Record<string, string> = {
  MX: 'CLABE',
  ES: 'IBAN',
  US: 'Cuenta + Routing',
};

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethods;
  value: MethodKey | null;
  onChange: (method: MethodKey) => void;
}

export function PaymentMethodSelector({ paymentMethods, value, onChange }: PaymentMethodSelectorProps) {
  const available = useMemo(() => {
    const methods: MethodKey[] = [];
    if (paymentMethods.global?.enabled && paymentMethods.global.providers.length > 0) methods.push('global');
    if (paymentMethods.local?.enabled) methods.push('local');
    if (paymentMethods.onchain?.enabled && paymentMethods.onchain.wallets.length > 0) methods.push('onchain');
    return methods;
  }, [paymentMethods]);

  const [selectedGlobalIdx, setSelectedGlobalIdx] = useState(0);
  const [selectedWalletIdx, setSelectedWalletIdx] = useState(0);

  if (available.length === 0) return null;

  const METHOD_META: Record<MethodKey, { label: string; icon: JSX.Element }> = {
    global: { label: 'Pago Global', icon: <Globe2 className="h-4 w-4" /> },
    local: { label: 'Pago Local', icon: <Landmark className="h-4 w-4" /> },
    onchain: { label: 'Pago Onchain', icon: <Wallet className="h-4 w-4" /> },
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 mb-4">
      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-3">
        Método de pago
      </span>

      {/* Method tabs — only shown when there's more than one option */}
      {available.length > 1 ? (
        <div className="flex gap-2 mb-4">
          {available.map((method) => {
            const isActive = value === method;
            return (
              <button
                key={method}
                onClick={() => onChange(method)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07]'
                }`}
              >
                {METHOD_META[method].icon}
                {METHOD_META[method].label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 text-[13px] font-semibold text-white">
          {METHOD_META[available[0]].icon}
          {METHOD_META[available[0]].label}
        </div>
      )}

      {/* Details for the selected method */}
      {value === 'global' && paymentMethods.global && (
        <div className="space-y-2">
          {paymentMethods.global.providers.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {paymentMethods.global.providers.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGlobalIdx(i)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors duration-150 ${
                    selectedGlobalIdx === i
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:text-slate-300'
                  }`}
                >
                  {p.provider === 'other' ? p.providerLabel || 'Otro' : PROVIDER_LABELS[p.provider]}
                </button>
              ))}
            </div>
          )}
          {paymentMethods.global.providers[selectedGlobalIdx] && (
            <div className="rounded-xl bg-black/20 border border-white/[0.06] px-3.5 py-3">
              <span className="block text-[11px] text-slate-500 mb-0.5">
                {paymentMethods.global.providers[selectedGlobalIdx].provider === 'other'
                  ? paymentMethods.global.providers[selectedGlobalIdx].providerLabel
                  : PROVIDER_LABELS[paymentMethods.global.providers[selectedGlobalIdx].provider]}
              </span>
              <span className="block text-[14px] font-mono text-white break-all">
                {paymentMethods.global.providers[selectedGlobalIdx].identifier}
              </span>
            </div>
          )}
        </div>
      )}

      {value === 'local' && paymentMethods.local && (
        <div className="rounded-xl bg-black/20 border border-white/[0.06] px-3.5 py-3 space-y-1.5">
          <Row label="Banco" val={paymentMethods.local.bankName} />
          <Row label="Titular" val={paymentMethods.local.accountHolder} />
          <Row
            label={ACCOUNT_LABELS[paymentMethods.local.country] ?? 'Número de cuenta'}
            val={paymentMethods.local.accountNumber}
            mono
          />
          {paymentMethods.local.swiftBic && <Row label="SWIFT/BIC" val={paymentMethods.local.swiftBic} mono />}
          <Row label="Moneda" val={paymentMethods.local.currency} />
        </div>
      )}

      {value === 'onchain' && paymentMethods.onchain && (
        <div className="space-y-2">
          {paymentMethods.onchain.wallets.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {paymentMethods.onchain.wallets.map((w, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedWalletIdx(i)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors duration-150 ${
                    selectedWalletIdx === i
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:text-slate-300'
                  }`}
                >
                  {NETWORK_LABELS[w.network]}
                </button>
              ))}
            </div>
          )}
          {paymentMethods.onchain.wallets[selectedWalletIdx] && (
            <div className="rounded-xl bg-black/20 border border-white/[0.06] px-3.5 py-3">
              <span className="block text-[11px] text-slate-500 mb-0.5">
                {NETWORK_LABELS[paymentMethods.onchain.wallets[selectedWalletIdx].network]}
              </span>
              <span className="block text-[13px] font-mono text-white break-all">
                {paymentMethods.onchain.wallets[selectedWalletIdx].address}
              </span>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-emerald-500">
                <Check className="h-3 w-3" />
                Se verifica automáticamente al pagar
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, val, mono }: { label: string; val: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] text-slate-500 shrink-0">{label}</span>
      <span className={`text-[13px] text-white text-right break-all ${mono ? 'font-mono' : ''}`}>{val}</span>
    </div>
  );
}