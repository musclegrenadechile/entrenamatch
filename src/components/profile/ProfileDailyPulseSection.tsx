import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileDailyPulseSection(props: ProfileTabProps) {
  const {
    dailyPulse,
    profileSection,
    triggerHaptic,
    setActiveTab,
    getUnlockedGadgets,
    getTodayStr,
    setDailyPulse,
    saveUserWithRealSync,
    currentUser,
    refreshDailyPulse,
    completeDailyChallenge,
    getNextGadget,
    syncBonds,
  } = profileTabBindings(props)
  return (
    <>
{dailyPulse && (
  <motion.div 
    className={`px-4 mt-4${profileSection !== 'rendimiento' ? ' hidden' : ''}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
  >
    <div className="rounded-3xl bg-gradient-to-br from-[#0f0a08] via-[#1a140f] to-[#0D0D10] border border-[#FF671F]/30 p-4 shadow-inner hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[#FF671F] text-[10px] font-bold tracking-[1px] uppercase">EL GYMPULSE DE TUS GYMPARTNERS</div>
          <div className="text-white text-xl font-black tracking-[-0.5px]">GymPulse Diario</div>
        </div>
        <div className="text-right flex items-center gap-3">
          <div>
            <div className="text-xs text-[#FFD700]">NIVEL {dailyPulse.level || 1}</div>
            <div className="text-[10px] text-[#9CA3AF]">Retención</div>
          </div>
          <div>
            <div className="momentum-number tabular-nums">{dailyPulse.momentum}</div>
            <div className="text-[9px] text-[#9CA3AF] -mt-1 font-medium tracking-widest">CONSTANCIA</div>
          </div>
        </div>
      </div>

      {/* Multi-streaks - attractive flames (enhanced with Voice + Pulse for more daily hooks) */}
      <div className="flex gap-1.5 mb-3">
        <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#22c55e]/20">
          <div className="text-lg font-black text-[#22c55e] flex items-center justify-center gap-0.5">🔥{dailyPulse.trainingStreak}</div>
          <div className="text-[8px] text-[#9CA3AF] font-medium">Train</div>
        </div>
        <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#FF671F]/20">
          <div className="text-lg font-black text-[#FF671F] flex items-center justify-center gap-0.5">🔗{dailyPulse.synergyStreak}</div>
          <div className="text-[8px] text-[#9CA3AF] font-medium">Synergy</div>
        </div>
        <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#EAB308]/30 ring-1 ring-inset ring-[#EAB308]/10">
          <div className="text-lg font-black text-[#EAB308] flex items-center justify-center gap-0.5">🎙️{dailyPulse.voiceStreak || 0}</div>
          <div className="text-[8px] text-[#EAB308]/90 font-medium tracking-wide">NOTAS DE VOZ</div>
        </div>
        <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#06B6D4]/20">
          <div className="text-lg font-black text-[#06B6D4] flex items-center justify-center gap-0.5">🗺️{dailyPulse.pulseStreak || 0}</div>
          <div className="text-[8px] text-[#9CA3AF] font-medium">Pulse</div>
        </div>
      </div>
      <div className="text-[8px] text-[#FFD700] -mt-2 mb-2 text-center">Récord: {Math.max(dailyPulse.longestTraining || 0, dailyPulse.longestSynergy || 0, dailyPulse.longestVoice || 0, dailyPulse.longestPulse || 0)}d</div>

      {/* Prominent status badges for protection / amplify (makes the spend feel real + visual payoff) */}
      {(dailyPulse.streakProtectedDate === getTodayStr() || dailyPulse.pulseAmplifiedDate === getTodayStr()) && (
        <div className="flex gap-2 justify-center mb-2">
          {dailyPulse.streakProtectedDate === getTodayStr() && <span className="status-protected">🛡️ PROTEGIDO HOY</span>}
          {dailyPulse.pulseAmplifiedDate === getTodayStr() && <span className="status-amplified">📡 AMPLIFICADO</span>}
        </div>
      )}

      {/* Level progress - powerful retention visual */}
      <div className="mb-3">
        <div className="flex justify-between text-[8px] mb-1">
          <span>NIVEL {dailyPulse.level || 1}</span>
          <span className="tabular-nums">{dailyPulse.xp || 0}/300 XP</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#FFD700] to-[#FF671F]" style={{width: `${((dailyPulse.xp || 0) / 300) * 100}%`}} />
        </div>
        <div className="text-[7px] text-[#9CA3AF] mt-0.5">Entrena más → +XP → sube de nivel y accede a extras exclusivos (mapa, sync, ripples...)</div>
      </div>

      {/* Gadgets exclusivos - fuerte motivador de retención visual (mientras más entrenes, más efectos únicos) */}
      {dailyPulse && getUnlockedGadgets(dailyPulse.level || 1).length > 0 && (
        <div className="mb-3">
          <div className="text-[8px] text-[#FFD700] font-bold mb-1">🎁 GADGETS DESBLOQUEADOS</div>
          <div className="flex gap-1 flex-wrap">
            {getUnlockedGadgets(dailyPulse.level || 1).map((g, i) => (
              <div key={i} className="text-[9px] bg-black/40 border border-[#FFD700]/30 rounded px-1.5 py-0.5 flex items-center gap-1" title={g.desc}>
                <span>{g.icon}</span> <span className="font-medium text-white/90">{g.name}</span>
              </div>
            ))}
          </div>
          {getNextGadget(dailyPulse.level || 1) && (
            <div className="text-[7px] text-[#9CA3AF] mt-0.5">Siguiente: {getNextGadget(dailyPulse.level || 1)!.name} (nivel {getNextGadget(dailyPulse.level || 1)!.level})</div>
          )}
        </div>
      )}

      {/* Reto GymPulse diario */}
      {dailyPulse.currentChallenge && (
        <div className="bg-[#0D0D10] border border-[#FF671F]/40 rounded-2xl p-3 mb-2">
          <div className="flex items-start gap-3">
            <div className="text-3xl mt-0.5">{dailyPulse.currentChallenge.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-[13px] flex items-center gap-2">
                {dailyPulse.currentChallenge.title}
                <span className="text-[8px] px-1.5 py-px bg-[#FF671F]/20 text-[#FF671F] rounded">MISIÓN</span>
              </div>
              <div className="text-[10px] text-[#9CA3AF] leading-snug mt-0.5">{dailyPulse.currentChallenge.description}</div>

              {/* Progress */}
              <div className="mt-2">
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-[#FF671F] font-medium">Progreso</span>
                  <span className="tabular-nums font-mono">{dailyPulse.currentChallenge.progress || 0}/{dailyPulse.currentChallenge.target}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#FF671F] to-[#E55A1A] transition-all" 
                    style={{ width: `${Math.min(100, Math.round(((dailyPulse.currentChallenge.progress || 0) / dailyPulse.currentChallenge.target) * 100))}%` }} 
                  />
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => {
                    try { triggerHaptic('light') } catch {}
                    if (dailyPulse.currentChallenge.type === 'solo') {
                      completeDailyChallenge(1)
                    } else if (dailyPulse.currentChallenge.type === 'bond') {
                      setActiveTab('explore')
                      toast('Ve a tu Red y activa una alianza hoy')
                    } else {
                      setActiveTab('profile')
                      toast('Publica en el GymPulse para completar')
                    }
                  }}
                  className="flex-1 text-xs py-1.5 rounded-full bg-[#FF671F] text-black font-bold active:bg-[#E55A1A] active:scale-[0.985] transition-transform"
                >
                  {dailyPulse.currentChallenge.actionLabel || 'Avanzar'}
                </button>
                {dailyPulse.currentChallenge.completed ? (
                  <div className="text-[10px] px-2 py-1.5 text-[#22c55e] font-bold">¡COMPLETADO! +{dailyPulse.currentChallenge.reward}</div>
                ) : (
                  <button 
                    onClick={() => { try { triggerHaptic('light') } catch {}; completeDailyChallenge(1) }} 
                    className="text-xs px-3 py-1.5 rounded-full border border-[#FF671F]/50 text-[#FF671F] active:bg-[#FF671F]/10 active:scale-[0.985] transition-transform"
                  >
                    +1
                  </button>
                )}
              </div>
              <div className="text-[8px] text-[#FFD700] mt-1">Recompensa: +{dailyPulse.currentChallenge.reward} Constancia para ti y tu Red</div>
            </div>
          </div>
        </div>
      )}

      {/* Spend Momentum - premium, impactful, clear payoff */}
      <div className="text-[9px] uppercase tracking-[1px] text-[#9CA3AF] mb-1 mt-2">Gasta Constancia — impacto real en tu pulso y el de tu red</div>
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if ((dailyPulse.momentum || 0) >= 30) {
              try { triggerHaptic('medium') } catch {}
              const todayStr = getTodayStr()
              const ampPulse = { ...dailyPulse, pulseAmplifiedDate: todayStr, momentum: (dailyPulse.momentum || 0) - 30 }
              setDailyPulse(ampPulse)
              saveUserWithRealSync({ ...(currentUser as any), pulseAmplifiedDate: todayStr, momentumPoints: ampPulse.momentum } as any)
              toast.success('GymPulse amplificado', { description: 'Tu actividad ahora tiene más peso en el GymPulse de tus GymPartners por 24h' })
            } else {
              toast('Necesitas 30 Constancia')
            }
          }}
          className="flex-1 text-[10px] py-2 rounded-2xl border border-[#FF671F]/40 active:bg-[#FF671F]/10 active:scale-[0.985] hover:bg-[#FF671F]/5 transition-all text-[#FF671F] flex flex-col items-center leading-tight"
        >
          <span>📡</span>
          <span className="font-bold">Amplificar Pulso</span>
          <span className="text-[9px] opacity-70">30M • 24h</span>
        </button>
        <button 
          onClick={() => {
            if ((dailyPulse.momentum || 0) >= 20) {
              try { triggerHaptic('medium') } catch {}
              const todayStr = getTodayStr()
              const igniteM = (dailyPulse.momentum || 0) - 20
              const ignPulse = { ...dailyPulse, momentum: igniteM }
              setDailyPulse(ignPulse)
              saveUserWithRealSync({ ...(currentUser as any), momentumPoints: igniteM } as any)
              const bondIds = Object.keys(syncBonds || {})
              const target = bondIds.length > 0 ? bondIds[Math.floor(Math.random() * bondIds.length)] : null
              toast.success('Socio ignitado', { description: target ? `+protección de streak enviada a ${syncBonds[target]?.name || 'socio' } hoy` : 'Protección de streak enviada a tu Red' })
            } else toast('Necesitas 20 Constancia')
          }}
          className="flex-1 text-[10px] py-2 rounded-2xl border border-[#22c55e]/40 active:bg-[#22c55e]/10 active:scale-[0.985] hover:bg-[#22c55e]/5 transition-all text-[#22c55e] flex flex-col items-center leading-tight"
        >
          <span>🔥</span>
          <span className="font-bold">Ignitar Socio</span>
          <span className="text-[9px] opacity-70">20M • regalo</span>
        </button>
        <button 
          onClick={() => {
            if ((dailyPulse.momentum || 0) >= 50) {
              try { triggerHaptic('medium') } catch {}
              const todayStr = getTodayStr()
              const protectedPulse = { ...dailyPulse, streakProtectedDate: todayStr, momentum: (dailyPulse.momentum || 0) - 50 }
              setDailyPulse(protectedPulse)
              saveUserWithRealSync({ ...(currentUser as any), streakProtectedDate: todayStr, momentumPoints: protectedPulse.momentum } as any)
              toast.success('Streak protegido', { description: 'No perderás tu racha si no entrenas hoy. ¡Buen uso de Constancia!' })
            } else {
              toast('Necesitas 50 Constancia para proteger')
            }
          }}
          className="flex-1 text-[10px] py-2 rounded-2xl border border-[#EAB308]/40 active:bg-[#EAB308]/10 active:scale-[0.985] hover:bg-[#EAB308]/5 transition-all text-[#EAB308] flex flex-col items-center leading-tight"
        >
          <span>🛡️</span>
          <span className="font-bold">Proteger Racha</span>
          <span className="text-[9px] opacity-70">50M • hoy</span>
        </button>
      </div>

      <div className="text-center mt-2">
        <button 
          onClick={() => { 
            refreshDailyPulse(); 
            try { triggerHaptic('light') } catch {} 
          }} 
          className="text-[9px] text-[#9CA3AF] underline active:opacity-70 active:text-white transition-colors"
        >
          Refrescar GymPulse
        </button>
      </div>
    </div>
  </motion.div>
)}
    </>
  )
}
