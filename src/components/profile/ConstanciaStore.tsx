export interface ConstanciaStoreProps {
  balance: number
  onProtectStreak: () => void
  onBuyInsurance: () => void
}

export function ConstanciaStore({ balance, onProtectStreak, onBuyInsurance }: ConstanciaStoreProps) {
  return (
    <div className="rounded-2xl border border-[#FF671F]/30 bg-[#1C1C20] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold">Tienda Constancia</p>
      <p className="text-sm text-white font-bold mt-1">Saldo: {balance} pts</p>
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={onProtectStreak}
          className="w-full py-2.5 rounded-xl bg-[#6366f1]/20 text-[#a5b4fc] text-xs font-bold border border-[#6366f1]/30"
        >
          Proteger racha — 50 Constancia
        </button>
        <button
          type="button"
          onClick={onBuyInsurance}
          className="w-full py-2.5 rounded-xl bg-[#FF671F]/15 text-[#FF671F] text-xs font-bold border border-[#FF671F]/30"
        >
          Seguro semanal — 120 Constancia
        </button>
      </div>
    </div>
  )
}
