import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type RefObject } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'
import type { User } from 'firebase/auth'
import { toast } from 'sonner'
import { PARTNER_SEEDS } from '../constants/partnerSeeds'
import type { PartnerLocation, Tab } from '../types'
import { partnersForMap } from '../utils/partnerLocations'
import { isDevPasswordConfigured, verifyDevMapPassword } from '../config/devGate'

export interface UsePartnerLocationsOptions {
  isDemoMode: boolean
  db: Firestore | null
  storage: FirebaseStorage | null
  firebaseUser: User | null | undefined
  userLocation: { lat: number; lng: number } | null
  activeTab: Tab
  showLiveMap: boolean
  setActiveTab: (tab: Tab) => void
  setShowLiveMap: (v: boolean) => void
  setMapForceTick: React.Dispatch<React.SetStateAction<number>>
  gymPulseMapRef: RefObject<{ getCenter?: () => { lat: number; lng: number } | null; centerOn?: (lat: number, lng: number, z?: number) => void } | null>
  triggerHaptic: (style?: 'light' | 'medium' | 'success') => void
}

/** Fase 124 — partner Firestore listener + dev CRUD for GymPulse map */
export function usePartnerLocations(opts: UsePartnerLocationsOptions) {
  const {
    isDemoMode,
    db,
    storage,
    firebaseUser,
    userLocation,
    activeTab,
    showLiveMap,
    setActiveTab,
    setShowLiveMap,
    setMapForceTick,
    gymPulseMapRef,
    triggerHaptic,
  } = opts

  const [partnerLocations, setPartnerLocations] = useState<PartnerLocation[]>([])
  const [showPartners, setShowPartners] = useState(false)
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false)
  const [showManagePartners, setShowManagePartners] = useState(false)
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null)
  const [partnerFormName, setPartnerFormName] = useState('')
  const [partnerFormType, setPartnerFormType] = useState<'gym' | 'store' | 'studio'>('gym')
  const [partnerFormLat, setPartnerFormLat] = useState(-33.02)
  const [partnerFormLng, setPartnerFormLng] = useState(-71.55)
  const [partnerFormAddress, setPartnerFormAddress] = useState('')
  const [partnerLogoFile, setPartnerLogoFile] = useState<File | null>(null)
  const [partnerLogoPreview, setPartnerLogoPreview] = useState<string | null>(null)
  const [isPlacingPartner, setIsPlacingPartner] = useState(false)
  const [isQuickAddPartner, setIsQuickAddPartner] = useState(false)
  const [isDeveloper, setIsDeveloper] = useState(() => {
    try {
      return localStorage.getItem('entrenamatch_dev_mode') === '1'
    } catch {
      return false
    }
  })
  const [showDevLogin, setShowDevLogin] = useState(false)
  const [devPassword, setDevPassword] = useState('')

  const partnerLocationsRef = useRef<PartnerLocation[]>([])
  const isPlacingPartnerRef = useRef(false)
  const isQuickAddPartnerRef = useRef(false)
  const showAddPartnerFormRef = useRef(false)

  useEffect(() => {
    partnerLocationsRef.current = partnerLocations
  }, [partnerLocations])
  useEffect(() => {
    isPlacingPartnerRef.current = isPlacingPartner
  }, [isPlacingPartner])
  useEffect(() => {
    isQuickAddPartnerRef.current = isQuickAddPartner
  }, [isQuickAddPartner])
  useEffect(() => {
    showAddPartnerFormRef.current = showAddPartnerForm
  }, [showAddPartnerForm])

  const mapPartnerLocations = useMemo(
    () => partnersForMap(partnerLocations, isDemoMode),
    [partnerLocations, isDemoMode]
  )

  useEffect(() => {
    if (isDemoMode || !db) {
      setPartnerLocations([...PARTNER_SEEDS])
      return
    }

    let unsub: (() => void) | null = null
    ;(async () => {
      try {
        const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore')
        const q = query(collection(db, 'partnerLocations'), orderBy('name'))
        unsub = onSnapshot(
          q,
          (snap) => {
            const fromFs: PartnerLocation[] = []
            snap.forEach((d) => {
              const data = d.data() || {}
              Object.keys(data).forEach((k) => {
                if ((data as Record<string, unknown>)[k] === undefined) {
                  delete (data as Record<string, unknown>)[k]
                }
              })
              fromFs.push({ id: d.id, ...data } as PartnerLocation)
            })
            setPartnerLocations(fromFs)
            setMapForceTick((t) => t + 1)
          },
          (err) => {
            console.warn('partnerLocations listener error', err)
            setPartnerLocations([])
            setMapForceTick((t) => t + 1)
          }
        )
      } catch (err) {
        console.warn('partnerLocations listener error', err)
        setPartnerLocations([])
        setMapForceTick((t) => t + 1)
      }
    })()

    return () => {
      if (unsub) unsub()
    }
  }, [isDemoMode, db, setMapForceTick])

  const loginAsDeveloper = useCallback(() => {
    if (!isDevPasswordConfigured()) {
      toast.error('Editor de mapa no configurado', {
        description: 'Define VITE_DEV_MAP_PASSWORD en build local y añade tu UID en Firestore mapEditors/{uid}.',
      })
      return
    }
    if (verifyDevMapPassword(devPassword)) {
      setIsDeveloper(true)
      try {
        localStorage.setItem('entrenamatch_dev_mode', '1')
      } catch {}
      setShowDevLogin(false)
      setDevPassword('')
      try {
        triggerHaptic('success')
      } catch {}
      toast.success('Developer access granted', {
        description: 'You can now add and manage partner locations with logos',
      })
    } else {
      toast.error('Incorrect developer password')
    }
  }, [devPassword, triggerHaptic])

  const logoutDeveloper = useCallback(() => {
    setIsDeveloper(false)
    try {
      localStorage.removeItem('entrenamatch_dev_mode')
    } catch {}
    setShowManagePartners(false)
    setShowAddPartnerForm(false)
    setEditingPartnerId(null)
    setPartnerLogoFile(null)
    setPartnerLogoPreview(null)
    setMapForceTick((t) => t + 1)
    toast('Developer mode disabled')
  }, [setMapForceTick])

  const startEditPartner = useCallback(
    (p: PartnerLocation) => {
      setEditingPartnerId(p.id)
      setPartnerFormName(p.name || '')
      setPartnerFormType((p.type as 'gym' | 'store' | 'studio') || 'gym')
      setPartnerLogoFile(null)
      setPartnerLogoPreview(p.logoUrl || p.logo || null)
      setPartnerFormLat(p.lat ?? -33.02)
      setPartnerFormLng(p.lng ?? -71.55)
      setPartnerFormAddress(p.address || '')
      setIsPlacingPartner(false)
      setShowAddPartnerForm(true)
      setShowManagePartners(false)
      setTimeout(() => {
        if (gymPulseMapRef.current && p.lat && p.lng) {
          try {
            gymPulseMapRef.current.centerOn?.(p.lat, p.lng, 15)
          } catch {}
        }
      }, 80)
    },
    [gymPulseMapRef]
  )

  const openDevLogin = useCallback(() => {
    setShowDevLogin(true)
    setDevPassword('')
  }, [])

  const openAddPartner = useCallback(() => {
    if (!isDeveloper) {
      openDevLogin()
      return
    }
    setEditingPartnerId(null)
    setPartnerFormName('Nuevo Partner Gym')
    setPartnerFormType('gym')
    setPartnerLogoFile(null)
    setPartnerLogoPreview(null)
    setPartnerFormAddress('')
    let center: { lat: number; lng: number } | null = null
    try {
      center = gymPulseMapRef.current?.getCenter?.() || null
    } catch {}
    if (center) {
      setPartnerFormLat(center.lat)
      setPartnerFormLng(center.lng)
    } else if (userLocation) {
      setPartnerFormLat(userLocation.lat)
      setPartnerFormLng(userLocation.lng)
    } else {
      setPartnerFormLat(-33.02)
      setPartnerFormLng(-71.55)
    }
    setIsPlacingPartner(false)
    setShowAddPartnerForm(true)
    setShowManagePartners(false)
    setTimeout(() => {
      try {
        triggerHaptic('light')
      } catch {}
    }, 30)
  }, [isDeveloper, gymPulseMapRef, userLocation, openDevLogin, triggerHaptic])

  const openManagePartners = useCallback(() => {
    if (!isDeveloper) {
      openDevLogin()
      return
    }
    setShowManagePartners(true)
    setShowAddPartnerForm(false)
  }, [isDeveloper, openDevLogin])

  const handlePartnerEditFromMap = useCallback(
    (id: string) => {
      const p = (partnerLocationsRef.current || partnerLocations).find((pp) => pp.id === id)
      if (p) {
        if (activeTab !== 'map') setActiveTab('map')
        startEditPartner(p)
      } else {
        console.warn('dev edit: partner not found in current list for id', id)
        setEditingPartnerId(id)
        setPartnerFormName('Partner ' + id.slice(-6))
        setPartnerFormType('gym')
        setPartnerFormLat(-33.02)
        setPartnerFormLng(-71.55)
        setPartnerFormAddress('')
        setPartnerLogoFile(null)
        setPartnerLogoPreview(null)
        setIsPlacingPartner(false)
        setShowAddPartnerForm(true)
        setShowManagePartners(false)
      }
    },
    [partnerLocations, activeTab, setActiveTab, startEditPartner]
  )

  const cancelPartnerForm = useCallback(() => {
    setShowAddPartnerForm(false)
    setEditingPartnerId(null)
    setPartnerLogoFile(null)
    if (partnerLogoPreview && partnerLogoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(partnerLogoPreview)
    }
    setPartnerLogoPreview(null)
    setPartnerFormAddress('')
    setIsPlacingPartner(false)
    setPartnerFormLat(-33.02)
    setPartnerFormLng(-71.55)
  }, [partnerLogoPreview])

  const handlePartnerLogoSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setPartnerLogoFile(file)
        if (partnerLogoPreview && partnerLogoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(partnerLogoPreview)
        }
        setPartnerLogoPreview(URL.createObjectURL(file))
        try {
          triggerHaptic('light')
        } catch {}
      }
    },
    [partnerLogoPreview, triggerHaptic]
  )

  const uploadPartnerLogoIfNeeded = useCallback(
    async (file: File | null, pid: string): Promise<string | undefined> => {
      if (!file) return undefined
      if (isDemoMode || !storage) {
        return URL.createObjectURL(file)
      }
      if (!firebaseUser?.uid) {
        toast.error(
          'Para subir logo de partner necesitas estar sign-in con Firebase Auth. El partner se guardará sin logo.'
        )
        return undefined
      }
      try {
        const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
        const storageRef = ref(storage, `partners/${pid}/logo-${Date.now()}`)
        const task = uploadBytesResumable(storageRef, file)
        await new Promise<void>((resolve, reject) => {
          task.on('state_changed', () => {}, reject, () => resolve())
        })
        return await getDownloadURL(task.snapshot.ref)
      } catch (e) {
        console.warn('partner logo upload failed', e)
        return undefined
      }
    },
    [isDemoMode, storage, firebaseUser?.uid]
  )

  const addPartnerAtCurrentCenter = useCallback(async () => {
    if (!isDeveloper || !gymPulseMapRef.current) {
      toast.error('Mapa dev no listo')
      return
    }
    const center = gymPulseMapRef.current.getCenter?.()
    if (!center) {
      toast.error('No se pudo obtener centro del mapa')
      return
    }
    const { lat, lng } = center
    const pid = 'partner-' + Date.now()
    const minimal: PartnerLocation = {
      id: pid,
      name:
        'Partner @centro ' +
        new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      lat,
      lng,
      type: 'gym',
      address: 'Agregado rápido por dev (centro mapa)',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPartnerLocations((prev) => [...prev, minimal])
    setMapForceTick((t) => t + 1)
    if (!isDemoMode && db) {
      try {
        const { setDoc, doc } = await import('firebase/firestore')
        await setDoc(doc(db, 'partnerLocations', pid), minimal)
      } catch (e) {
        console.warn('add@center fs', e)
      }
    }
    toast.success('Partner agregado en centro', { description: 'Abre Manage o Edit para logo/nombre' })
    setTimeout(() => startEditPartner(minimal), 80)
  }, [isDeveloper, gymPulseMapRef, isDemoMode, db, setMapForceTick, startEditPartner])

  const reloadPartners = useCallback(() => {
    setMapForceTick((t) => t + 1)
    toast('Mapa y partners refrescados')
  }, [setMapForceTick])

  return {
    partnerLocations,
    setPartnerLocations,
    mapPartnerLocations,
    partnerLocationsRef,
    showPartners,
    setShowPartners,
    showAddPartnerForm,
    setShowAddPartnerForm,
    showManagePartners,
    setShowManagePartners,
    editingPartnerId,
    setEditingPartnerId,
    partnerFormName,
    setPartnerFormName,
    partnerFormType,
    setPartnerFormType,
    partnerFormLat,
    setPartnerFormLat,
    partnerFormLng,
    setPartnerFormLng,
    partnerFormAddress,
    setPartnerFormAddress,
    partnerLogoFile,
    setPartnerLogoFile,
    partnerLogoPreview,
    setPartnerLogoPreview,
    isPlacingPartner,
    setIsPlacingPartner,
    isQuickAddPartner,
    setIsQuickAddPartner,
    isPlacingPartnerRef,
    isQuickAddPartnerRef,
    showAddPartnerFormRef,
    isDeveloper,
    setIsDeveloper,
    showDevLogin,
    setShowDevLogin,
    devPassword,
    setDevPassword,
    loginAsDeveloper,
    logoutDeveloper,
    openDevLogin,
    openAddPartner,
    openManagePartners,
    startEditPartner,
    cancelPartnerForm,
    handlePartnerEditFromMap,
    handlePartnerLogoSelect,
    uploadPartnerLogoIfNeeded,
    addPartnerAtCurrentCenter,
    reloadPartners,
  }
}
