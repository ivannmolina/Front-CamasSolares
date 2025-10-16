import { http, isInMemory } from '@/lib/http'
import type { Movement, NewMovement } from '../types'
import { listClients, getClient } from '@/features/clients/api/clients.api'

// SIN mocks: iniciamos vacío
let MEM_MOVS: Movement[] = []

async function enrich(movs: Movement[]): Promise<Movement[]>{
  // Si ya viene con datos de cliente del backend, no necesitamos enriquecer
  const hasClientData = movs.some(m => m.cliente && typeof m.cliente === 'object')
  if (hasClientData) {
    console.log('Movimientos ya vienen con datos de cliente del backend')
    return movs
  }
  
  // Si no, enriquecemos desde la lista de clientes
  const clients = await listClients()
  const map = new Map(clients.map(c=>[c.id, c]))
  return movs.map(m => {
    if (!m.clienteId) return { ...m, cliente: null }
    const cliente = map.get(m.clienteId)
    return { ...m, cliente: cliente || null }
  })
}

export async function listMovementsForDay(isoDate: string): Promise<Movement[]>{
  if (isInMemory) return enrich(MEM_MOVS)
  try {
    const { data } = await http.get(`/movimientos?fecha=${isoDate}`)
    console.log('Movimientos del backend:', data)
    const enriched = await enrich(data)
    console.log('Movimientos enriquecidos:', enriched)
    return enriched
  } catch (error) {
    console.error('Error al cargar movimientos:', error)
    return []
  }
}

export async function createMovement(payload: NewMovement): Promise<Movement>{
  if (isInMemory){
    const last = MEM_MOVS.length ? MEM_MOVS[MEM_MOVS.length - 1] : undefined
    const id = (typeof last?.id === 'number' ? last!.id : 0) + 1
    const created: Movement = { 
      id, 
      fecha: payload.fecha,
      tipo: payload.tipo,
      monto: payload.monto,
      clienteId: payload.clienteId,
      tipoCama: payload.tipoCama,
      medioPago: payload.medioPago,
      descripcion: payload.descripcion,
      cliente: null
    }
    MEM_MOVS = [created, ...MEM_MOVS]
    return (await enrich([created]))[0]
  }
  const { data } = await http.post('/movimientos', {
    fecha: payload.fecha,
    tipo: payload.tipo,
    monto: payload.monto,
    clienteId: payload.clienteId,
    tipoCama: payload.tipoCama ?? null,
    medioPago: payload.medioPago ?? null,
    descripcion: payload.descripcion ?? null
  })
  const cli = payload.clienteId ? await getClient(payload.clienteId) : null
  return { ...data, cliente: cli }
}

export async function deleteMovements(ids: (number|string)[]): Promise<void>{
  if (isInMemory){
    MEM_MOVS = MEM_MOVS.filter(m => !ids.includes(m.id))
    return
  }
  for (const id of ids) await http.delete(`/movimientos/${id}`)
}
