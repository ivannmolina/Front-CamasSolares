import { http, isInMemory } from '@/lib/http'
import type { Client } from '../types'
import { waLink } from '@/lib/format'

// memoria vacía para modo sin API
let MEM_CLIENTS: Client[] = []

export async function listClients(): Promise<Client[]>{
  if (isInMemory) return MEM_CLIENTS
  const { data } = await http.get('/clientes')
  return data
}

export async function getClient(id: number): Promise<Client | undefined>{
  if (isInMemory) return MEM_CLIENTS.find(c=>c.id===id)
  const { data } = await http.get(`/clientes/${id}`)
  return data
}

export async function searchClients(q: string): Promise<Client[]>{
  const all = await listClients()
  const s = q.trim().toLowerCase()
  if (!s) return all.slice(0, 10)
  return all
    .filter(c => [c.nombre, c.apellido, c.telefono ?? ''].some(v => v.toLowerCase().includes(s)))
    .slice(0, 10)
}

export async function createClient(payload: Omit<Client,'id'|'createdAt'>): Promise<Client>{
  const whatsapp_link = waLink(payload.telefono)

  if (isInMemory){
    const last = MEM_CLIENTS.length ? MEM_CLIENTS[MEM_CLIENTS.length - 1] : undefined
    const c: Client = { id: (last?.id ?? 0) + 1, ...payload, whatsapp_link }
    MEM_CLIENTS = [c, ...MEM_CLIENTS]
    return c
  }

  const { data } = await http.post('/clientes', {
    nombre: payload.nombre,
    apellido: payload.apellido,
    telefono: payload.telefono ?? null,
    whatsapp_link
  })
  return data
}
