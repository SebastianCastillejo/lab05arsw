import { createSelector } from '@reduxjs/toolkit'

const EMPTY = []
const countPoints = (bp) => bp.points?.length || 0

export const selectAllBlueprints = (s) => s.blueprints.all ?? EMPTY

// Memo selectors: solo se recalculan cuando cambia la lista de planos
export const selectAuthors = createSelector([selectAllBlueprints], (all) =>
  [...new Set(all.map((bp) => bp.author))].sort(),
)

export const selectTop5ByPoints = createSelector([selectAllBlueprints], (all) =>
  [...all].sort((a, b) => countPoints(b) - countPoints(a)).slice(0, 5),
)
