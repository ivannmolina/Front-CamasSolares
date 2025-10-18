export type Cierre = {
  id: number
  fechaCierre: string
  totalEfectivo: number
  totalMercadoPago: number
  totalTransferencia: number
  totalGeneral: number
  movimientos?: unknown[]
}

export type CreateCierrePayload = {
  fecha?: string  // Backend espera 'fecha', no 'fechaCierre'
  totalEfectivo?: number
  totalMercadoPago?: number
  totalTransferencia?: number
  totalGeneral?: number
}
