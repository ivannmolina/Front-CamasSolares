import { http, isInMemory } from '@/lib/http'
import type { Movement, NewMovement } from '../types'
import { listClients, getClient } from '@/features/clients/api/clients.api'

// SIN mocks: iniciamos vacío
let MEM_MOVS: Movement[] = []

async function enrich(movs: Movement[]): Promise<Movement[]>{
  const clients = await listClients()
  const map = new Map(clients.map(c=>[c.id, c]))
  return movs.map(m => ({ ...m, cliente: map.get(m.clienteId) }))
}

export async function listMovementsForDay(_isoDate: string): Promise<Movement[]>{
  if (isInMemory) return enrich(MEM_MOVS)
  const { data } = await http.get('/movimientos') // si tu back filtra por fecha, lo adaptamos
  return enrich(data)
}

export async function createMovement(payload: NewMovement): Promise<Movement>{
  if (isInMemory){
    const last = MEM_MOVS.length ? MEM_MOVS[MEM_MOVS.length - 1] : undefined
    const id = (typeof last?.id === 'number' ? last!.id : 0) + 1
    const created = { id, ...payload }
    MEM_MOVS = [created, ...MEM_MOVS]
    return (await enrich([created]))[0]
  }
  const { data } = await http.post('/movimientos', {
    fecha: payload.fecha,
    monto: payload.monto,
    clienteId: payload.clienteId,
    tipoCama: payload.tipoCama ?? null,
    medioPago: payload.medioPago ?? null
  })
  const cli = await getClient(data.clienteId)
  return { ...data, cliente: cli }
}

export async function deleteMovements(ids: (number|string)[]): Promise<void>{
  if (isInMemory){
    MEM_MOVS = MEM_MOVS.filter(m => !ids.includes(m.id))
    return
  }
  for (const id of ids) await http.delete(`/movimientos/${id}`)
}
