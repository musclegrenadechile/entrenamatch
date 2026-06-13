import {
  REGISTRATION_COUNTRIES,
  REGISTRATION_REGION_HINT,
  applyRegistrationCitySelection,
  applyRegistrationCountrySelection,
  getRegistrationCitiesForCountry,
} from '../../constants/pilotProgram'

export type RegistrationRegionValue = {
  country: string
  city: string
  lat: number
  lng: number
}

type RegistrationRegionSelectProps = {
  value: RegistrationRegionValue
  onChange: (next: RegistrationRegionValue) => void
  showHint?: boolean
}

export function RegistrationRegionSelect({
  value,
  onChange,
  showHint = true,
}: RegistrationRegionSelectProps) {
  const cities = getRegistrationCitiesForCountry(value.country)
  const cityValue = cities.some((c) => c.label === value.city)
    ? value.city
    : cities[0]?.label ?? value.city

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1.5">País</label>
        <select
          value={value.country}
          onChange={(e) => onChange(applyRegistrationCountrySelection(e.target.value))}
          className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-xl px-3 py-2.5 text-sm"
        >
          {REGISTRATION_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1.5">Ciudad</label>
        <select
          value={cityValue}
          onChange={(e) => onChange(applyRegistrationCitySelection(e.target.value))}
          className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-xl px-3 py-2.5 text-sm"
        >
          {cities.map((c) => (
            <option key={c.norm} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      {showHint && (
        <p className="text-[9px] text-[#9CA3AF] leading-snug">{REGISTRATION_REGION_HINT}</p>
      )}
    </div>
  )
}
