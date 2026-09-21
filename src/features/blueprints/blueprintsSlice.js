import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

const same = (a, b) => a.author === b.author && a.name === b.name

export const fetchAll = createAsyncThunk('blueprints/fetchAll', async () =>
  blueprintsService.getAll(),
)

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const items = await blueprintsService.getByAuthor(author)
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => blueprintsService.getByAuthorAndName(author, name),
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) =>
  blueprintsService.create(payload),
)

// Optimistic update: el cambio se aplica antes de que responda el servidor
// y se revierte si la petición falla
export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async (bp, { dispatch, getState }) => {
    const state = getState().blueprints
    const previous =
      state.all.find((b) => same(b, bp)) ??
      state.byAuthor[bp.author]?.find((b) => same(b, bp)) ??
      (state.current && same(state.current, bp) ? state.current : null)

    dispatch(blueprintReplaced(bp))
    try {
      return await blueprintsService.update(bp.author, bp.name, bp)
    } catch (err) {
      if (previous) dispatch(blueprintReplaced(previous))
      throw err
    }
  },
)

// Optimistic delete: el plano desaparece de inmediato y vuelve si el servidor falla
export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }, { dispatch, getState }) => {
    const { all, byAuthor, current } = getState().blueprints
    const snapshot = { author, all, items: byAuthor[author], current }

    dispatch(blueprintRemoved({ author, name }))
    try {
      await blueprintsService.remove(author, name)
      return { author, name }
    } catch (err) {
      dispatch(blueprintsRestored(snapshot))
      throw err
    }
  },
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    all: [],
    allStatus: 'idle',
    allError: null,
    byAuthor: {},
    status: 'idle',
    error: null,
    current: null,
    currentRequest: null,
    currentStatus: 'idle',
    currentError: null,
    saveStatus: 'idle',
    saveError: null,
    deleteError: null,
  },
  reducers: {
    blueprintReplaced: (s, a) => {
      const bp = a.payload
      const replaceIn = (list) => {
        const i = list?.findIndex((b) => same(b, bp)) ?? -1
        if (i !== -1) list[i] = bp
      }
      replaceIn(s.all)
      replaceIn(s.byAuthor[bp.author])
      if (s.current && same(s.current, bp)) s.current = bp
    },
    blueprintRemoved: (s, a) => {
      const bp = a.payload
      s.all = s.all.filter((b) => !same(b, bp))
      if (s.byAuthor[bp.author]) {
        s.byAuthor[bp.author] = s.byAuthor[bp.author].filter((b) => !same(b, bp))
      }
      if (s.current && same(s.current, bp)) s.current = null
    },
    blueprintsRestored: (s, a) => {
      const { author, all, items, current } = a.payload
      s.all = all
      if (items) s.byAuthor[author] = items
      s.current = current
    },
    deleteErrorCleared: (s) => {
      s.deleteError = null
    },
    saveStatusReset: (s) => {
      s.saveStatus = 'idle'
      s.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAll.pending, (s) => {
        s.allStatus = 'loading'
        s.allError = null
      })
      .addCase(fetchAll.fulfilled, (s, a) => {
        s.allStatus = 'succeeded'
        s.all = a.payload
      })
      .addCase(fetchAll.rejected, (s, a) => {
        s.allStatus = 'failed'
        s.allError = a.error.message
      })
      .addCase(fetchByAuthor.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
        delete s.byAuthor[a.meta.arg]
      })
      .addCase(fetchBlueprint.pending, (s, a) => {
        s.currentStatus = 'loading'
        s.currentError = null
        s.currentRequest = a.meta.arg
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.currentStatus = 'succeeded'
        s.current = a.payload
      })
      .addCase(fetchBlueprint.rejected, (s, a) => {
        s.currentStatus = 'failed'
        s.currentError = a.error.message
      })
      .addCase(createBlueprint.pending, (s) => {
        s.saveStatus = 'loading'
        s.saveError = null
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        s.saveStatus = 'succeeded'
        s.all.push(bp)
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
        s.current = bp
      })
      .addCase(createBlueprint.rejected, (s, a) => {
        s.saveStatus = 'failed'
        s.saveError = a.error.message
      })
      .addCase(updateBlueprint.pending, (s) => {
        s.saveStatus = 'loading'
        s.saveError = null
      })
      .addCase(updateBlueprint.fulfilled, (s) => {
        s.saveStatus = 'succeeded'
      })
      .addCase(updateBlueprint.rejected, (s, a) => {
        s.saveStatus = 'failed'
        s.saveError = `${a.error.message}. Se restauró la versión anterior.`
      })
      .addCase(deleteBlueprint.pending, (s) => {
        s.deleteError = null
      })
      .addCase(deleteBlueprint.rejected, (s, a) => {
        s.deleteError = `${a.error.message}. El plano se restauró.`
      })
  },
})

export const {
  blueprintReplaced,
  blueprintRemoved,
  blueprintsRestored,
  deleteErrorCleared,
  saveStatusReset,
} = slice.actions

export default slice.reducer
