import type { Movement } from '../types'
import { fmtMoney } from '@/lib/format'
import Button from '@/ui/Button'
import ConfirmModal from '@/ui/ConfirmModal'
import { useState } from 'react'

type Props = {
  items: Movement[]
  onAdd: () => void
  onDelete: (ids: number[]) => void
  onSort: (k: 'nombre'|'apellido'|'fecha'|'monto') => void
  sortKey: 'nombre'|'apellido'|'fecha'|'monto'
  sortDir: 'asc'|'desc'
}

export default function MovementsTable({ items, onAdd, onDelete, onSort, sortKey, sortDir }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [showConfirm, setShowConfirm] = useState(false)

  const getSortIcon = (key: 'nombre'|'apellido'|'fecha'|'monto') => {
    if (sortKey !== key) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map(m => m.id)))
    }
  }

  const handleDeleteClick = () => {
    if (selected.size === 0) return
    setShowConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDelete(Array.from(selected))
    setSelected(new Set())
    setShowConfirm(false)
  }

  const handleCancelDelete = () => {
    setSelected(new Set())
    setShowConfirm(false)
  }

  return (
    <div className="vstack" style={{gap:12}}>
      <div className="hstack" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div className="hstack" style={{gap:12}}>
          <h2 className="text-xl font-semibold">Movimientos del turno</h2>
          {selected.size > 0 && (
            <Button onClick={handleDeleteClick} style={{background:'#dc2626', color:'white', borderColor:'#dc2626'}}>
              🗑️ Eliminar ({selected.size})
            </Button>
          )}
        </div>
        <Button className="primary" onClick={onAdd}>+ Añadir movimiento</Button>
      </div>
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900/40">
          <tr className="text-zinc-300">
            <th className="px-4 py-3 text-left" style={{width:'50px'}}>
              <input 
                type="checkbox" 
                checked={selected.size === items.length && items.length > 0}
                onChange={toggleSelectAll}
                style={{cursor:'pointer'}}
              />
            </th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-800/50" onClick={() => onSort('nombre')}>
              Nombre {getSortIcon('nombre')}
            </th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-800/50" onClick={() => onSort('apellido')}>
              Apellido {getSortIcon('apellido')}
            </th>
            <th className="px-4 py-3 text-left">Celular</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-800/50" onClick={() => onSort('fecha')}>
              Fecha {getSortIcon('fecha')}
            </th>
            <th className="px-4 py-3 text-left">Tipo cama</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-800/50" onClick={() => onSort('monto')}>
              Monto {getSortIcon('monto')}
            </th>
            <th className="px-4 py-3 text-left">Medio de pago</th>
            <th className="px-4 py-3 text-left">Tipo mov.</th>
            <th className="px-4 py-3 text-left">Descripción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {items.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-10 text-center text-zinc-400">
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
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={selected.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    style={{cursor:'pointer'}}
                  />
                </td>
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
      
      {showConfirm && (
        <ConfirmModal
          title="Confirmar eliminación"
          message={`¿Estás seguro de eliminar ${selected.size} movimiento(s)? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  )
}

