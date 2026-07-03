import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { LEGAL_VERSIONS } from '../../constants'
import type { LegalPage } from '../profile/profileTabTypes'

export type LegalPagesMountProps = {
  page: LegalPage
  onClose: () => void
}

/** Fase 457 — legal pages overlay extracted from App.tsx. */
export function LegalPagesMount({ page, onClose }: LegalPagesMountProps) {
  if (!page) return null

  return (
    <AnimatePresence>
      <div className="em-v2-legal absolute inset-0 z-[100] flex flex-col">
        <div className="em-v2-legal__header h-14 px-4 flex items-center gap-3">
          <button type="button" onClick={onClose} aria-label="Volver">
            <ArrowLeft />
          </button>
          <div className="em-v2-legal__title">
            {page === 'terms' && 'Términos de Servicio'}
            {page === 'privacy' && 'Política de Privacidad'}
            {page === 'community' && 'Directrices de la Comunidad'}
          </div>
        </div>
        <div className="em-v2-legal__body flex-1 overflow-auto p-5 text-sm space-y-4">
          {page === 'terms' && (
            <>
              <p>
                <strong>EntrenaMatch</strong> es una plataforma para conectar personas interesadas en
                realizar actividades deportivas y de entrenamiento de forma presencial.
              </p>
              <p>Al usar la aplicación aceptas que:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Eres mayor de 18 años.</li>
                <li>La app no es un servicio de citas románticas ni de naturaleza sexual.</li>
                <li>Los encuentros deben realizarse en lugares públicos y seguros.</li>
                <li>
                  Eres responsable de tu propia seguridad y de verificar la identidad de las personas con
                  quienes quedas.
                </li>
              </ul>
              <p>
                EntrenaMatch no se hace responsable de los encuentros presenciales ni de ningún incidente
                que ocurra fuera de la plataforma.
              </p>
            </>
          )}

          {page === 'privacy' && (
            <>
              <p>
                Recopilamos la información que proporcionas al crear tu perfil (nombre, edad, fotos,
                preferencias de entrenamiento, ubicación aproximada).
              </p>
              <p>
                Tu ubicación se utiliza únicamente para calcular distancias con otros usuarios y mejorar
                los filtros. No la compartimos con terceros.
              </p>
              <p>
                Las fotos y datos de tu perfil son visibles para otros usuarios de la app una vez que
                creas tu cuenta.
              </p>
              <p>
                Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos o usando
                la función de reset en tu perfil.
              </p>
              <p>
                Al aceptar esta política autorizas el tratamiento de tus datos con el fin exclusivo de
                facilitar conexiones para entrenamiento.
              </p>
            </>
          )}

          {page === 'community' && (
            <>
              <p className="font-semibold text-[#FF671F]">Directrices de la Comunidad EntrenaMatch</p>
              <p>
                Esta es una plataforma seria para{' '}
                <strong>entrenamiento sincronizado de alto rendimiento</strong>. Nuestra comunidad se
                basa en respeto, seguridad y enfoque en resultados físicos compartidos a través de la Red
                de EntrenaSync.
              </p>

              <p>
                <strong>Reglas obligatorias:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
                <li>
                  <strong>Respeto y profesionalismo:</strong> Sé motivador y respetuoso. Cero acoso,
                  insultos, discriminación, mensajes sexuales o románticos no solicitados.
                </li>
                <li>
                  <strong>Enfoque Comunidad:</strong> Solo para sync de entrenos (gym, running, etc.).
                  Nada de citas, spam, ventas o contenido off-topic.
                </li>
                <li>
                  <strong>Seguridad:</strong> Encuentros SOLO en lugares públicos. Verifica perfiles,
                  informa a terceros, nunca compartas datos bancarios o sensibles.
                </li>
                <li>
                  <strong>Perfiles auténticos:</strong> Fotos y datos reales. Prohibido perfiles falsos,
                  bots, cuentas múltiples o impersonación.
                </li>
                <li>
                  <strong>Contenido limpio:</strong> Posts, voces y fotos deben ser de entrenamiento.
                  Nada explícito, violento, de odio o que viole leyes.
                </li>
                <li>
                  <strong>Reporta y bloquea:</strong> Usa las herramientas de reporte y bloqueo ante
                  cualquier violación.
                </li>
                <li>
                  <strong>Mayores de 18:</strong> Solo adultos. Cualquier sospecha de menores resultará en
                  ban inmediato.
                </li>
              </ul>

              <p className="text-xs">
                Violaciones = bloqueo + posible suspensión permanente. Entrena duro, entrena juntos,
                entrena seguro.
              </p>
            </>
          )}
        </div>
        <div className="em-v2-legal__footer p-4">
          <div className="em-v2-legal__version">
            Versión{' '}
            {page === 'terms'
              ? LEGAL_VERSIONS.terms
              : page === 'privacy'
                ? LEGAL_VERSIONS.privacy
                : LEGAL_VERSIONS.community}{' '}
            • Última actualización: {LEGAL_VERSIONS.lastUpdated}
          </div>
          <button type="button" onClick={onClose} className="em-v2-hero-card__cta w-full">
            Cerrar
          </button>
        </div>
      </div>
    </AnimatePresence>
  )
}
