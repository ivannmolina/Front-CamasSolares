import type { Movement } from '../types'
import { fmtMoney } from '@/lib/format'

type Props = {
  items: Movement[]
}

export default function MovementsTable({ items }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900/40">
          <tr className="text-zinc-300">
            {/* sin checkbox */}
            <th className="px-4 py-3 text-left">Nombre ↓</th>
            <th className="px-4 py-3 text-left">Apellido ↓</th>
            <th className="px-4 py-3 text-left">Celular ↓</th>
            <th className="px-4 py-3 text-left">Fecha ↓</th>
            <th className="px-4 py-3 text-left">Tipo cama ↓</th>
            <th className="px-4 py-3 text-left">Monto ↓</th>
            <th className="px-4 py-3 text-left">Medio de pago ↓</th>
            <th className="px-4 py-3 text-left">Tipo mov. ↓</th>
            <th className="px-4 py-3 text-left">Descripción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-zinc-400">
                Los movimientos añadidos en el turno se visualizan en esta tabla.
              </td>
            </tr>
          )}

          {items.map((m) => {
            const nombre = m.cliente?.nombre ?? '-'
            const apellido = m.cliente?.apellido ?? '-'
            const telText = m.cliente?.telefono ?? '-'
            const telNode = m.cliente?.whatsapp_link ? (
              <a
                href={m.cliente.whatsapp_link}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline"
                title="Abrir WhatsApp"
              >
                {telText}
              </a>
            ) : (
              telText
            )

            const fecha = new Date(m.fecha).toLocaleString('es-AR', {
              dateStyle: 'short',
              timeStyle: 'medium',
            })

            return (
              <tr key={m.id} className="hover:bg-zinc-900/30">
                <td className="px-4 py-3">{nombre}</td>
                <td className="px-4 py-3">{apellido}</td>
                <td className="px-4 py-3">{telNode}</td>
                <td className="px-4 py-3">{fecha}</td>
                <td className="px-4 py-3">{m.tipoCama ?? '-'}</td>
                <td className="px-4 py-3">{fmtMoney(Number(m.monto) || 0)}</td>
                <td className="px-4 py-3">{m.medioPago ?? '-'}</td>
                <td className="px-4 py-3">
                  {m.tipo === 'OUT' ? (
                    <span className="rounded px-2 py-0.5 bg-rose-900/40 text-rose-300">Egreso</span>
                  ) : (
                    <span className="rounded px-2 py-0.5 bg-emerald-900/40 text-emerald-300">Ingreso</span>
                  )}
                </td>
                <td className="px-4 py-3">{m.tipo === 'OUT' ? (m.descripcion ?? 'extracción de caja') : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

