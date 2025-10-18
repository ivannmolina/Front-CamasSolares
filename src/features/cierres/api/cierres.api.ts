import { http } from '@/lib/http'
import type { Cierre, CreateCierrePayload } from '../types'

export async function createCierre(payload: CreateCierrePayload): Promise<Cierre> {
  const { data } = await http.post('/cierres', payload)
  return data
}

export async function listCierres(): Promise<Cierre[]> {
  const { data } = await http.get('/cierres')
  return data
}

export async function getCierre(id: number): Promise<Cierre> {
  const { data } = await http.get(`/cierres/${id}`)
  return data
}
