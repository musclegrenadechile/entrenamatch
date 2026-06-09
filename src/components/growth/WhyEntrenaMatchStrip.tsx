import { MapPin, MessageCircle, Users } from 'lucide-react'

/** Fase 109 — por qué EntrenaMatch vs redes genéricas (FTUE / growth). */
export function WhyEntrenaMatchStrip({ compact = false }: { compact?: boolean }) {
  const items = [
    {
      icon: MapPin,
      title: 'Mapa LIVE',
      desc: 'Instagram no muestra quién entrena ahora cerca de ti.',
    },
    {
      icon: Users,
      title: 'Match por gym',
      desc: 'WhatsApp es chat genérico — aquí filtras por ciudad, objetivo y horario.',
    },
    {
      icon: MessageCircle,
      title: 'EntrenaSync',
      desc: 'Entrenan juntos con minutos que suman al derby de tu zona.',
    },
  ]

  return (
    <section
      className={`rounded-2xl border border-[#FF671F]/25 bg-gradient-to-b from-[#1a1208]/80 to-[#0D0D10] ${
        compact ? 'p-3 mb-3' : 'p-4 mb-4'
      } text-left max-w-[340px] mx-auto`}
      aria-label="Por qué EntrenaMatch"
    >
      <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold mb-2">
        ¿Por qué no Instagram o WhatsApp?
      </p>
      <ul className="space-y-2">
        {items.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex gap-2.5 items-start">
            <Icon size={14} className="text-[#22c55e] shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className={`font-bold text-white ${compact ? 'text-[11px]' : 'text-xs'}`}>{title}</p>
              <p className={`text-[#9CA3AF] leading-snug ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
