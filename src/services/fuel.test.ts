import { describe, expect, it } from 'vitest'
import { parseFuelLogDoc, sortFuelLogsNewestFirst } from './fuel'

describe('fuel service', () => {
  it('parseFuelLogDoc maps Firestore fields', () => {
    const entry = parseFuelLogDoc(
      {
        id: 'log1',
        data: () => ({
          userId: 'u1',
          date: '2026-06-09',
          mealLabel: 'Pollo',
          kcal: 420,
          proteinG: 35,
          carbsG: 40,
          fatG: 12,
          source: 'photo_ai',
          createdAt: 1000,
        }),
      },
      '2026-06-08'
    )
    expect(entry.id).toBe('log1')
    expect(entry.mealLabel).toBe('Pollo')
    expect(entry.kcal).toBe(420)
    expect(entry.source).toBe('photo_ai')
  })

  it('sortFuelLogsNewestFirst orders by createdAt desc', () => {
    const sorted = sortFuelLogsNewestFirst([
      {
        id: 'a',
        userId: 'u1',
        date: '2026-06-09',
        mealLabel: 'A',
        kcal: 1,
        proteinG: 1,
        carbsG: 1,
        fatG: 1,
        source: 'manual',
        createdAt: 100,
      },
      {
        id: 'b',
        userId: 'u1',
        date: '2026-06-09',
        mealLabel: 'B',
        kcal: 2,
        proteinG: 2,
        carbsG: 2,
        fatG: 2,
        source: 'manual',
        createdAt: 300,
      },
    ])
    expect(sorted.map((e) => e.id)).toEqual(['b', 'a'])
  })
})
