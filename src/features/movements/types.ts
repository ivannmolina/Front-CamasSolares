export type MedioPago = 'Efectivo' | 'Mercado Pago' | 'Débito' | 'Crédito';

export type TipoCama = 'Horizontal' | 'Vertical';

export type TipoMovimiento = 'IN' | 'OUT';

export type Movement = {
  id: number;
  fecha: string;                 // ISO
  tipo: TipoMovimiento;          // IN / OUT
  tipoCama?: TipoCama;
  medioPago?: MedioPago;
  monto: number;
  descripcion?: string;          // solo OUT (egreso)
  clienteId?: number;
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    telefono?: string | null;
    whatsapp_link?: string | null;
  } | null;
};

export type NewMovement = Omit<Movement,'id'|'cliente'> & {
  clienteId?: number;
};