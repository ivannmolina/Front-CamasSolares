import { useEffect, useMemo, useState } from 'react'
import MovementsTable from '../components/MovementsTable'
import AddMovementModal from '../components/AddMovementModal'
import { listMovementsForDay, deleteMovements } from '../api/movements.api'
import type { Movement } from '../types'
import { todayISO } from '@/lib/format'

type SortKey = 'nombre'|'apellido'|'fecha'|'monto'
type SortDir = 'asc'|'desc'
type Props = {
  items: Movement[]
  onAdd: () => void
  onSort: (k: 'nombre'|'apellido'|'fecha'|'monto') => void
  sortKey: 'nombre'|'apellido'|'fecha'|'monto'
  sortDir: 'asc'|'desc'
}
export default function MovementsPage(){           // ← sin props
  const [items,setItems] = useState<Movement[]>([])
  const [open,setOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(()=>{
    listMovementsForDay(todayISO()).then(setItems)
  },[])

  const sorted = useMemo(()=>{
    const arr = [...items]
    const getVal = (m: Movement, k: SortKey) => {
      if (k==='nombre') return m.cliente?.nombre?.toLowerCase() ?? ''
      if (k==='apellido') return m.cliente?.apellido?.toLowerCase() ?? ''
      if (k==='monto') return m.monto
      return m.fecha
    }
    arr.sort((a,b)=>{
      const va = getVal(a, sortKey) as any
      const vb = getVal(b, sortKey) as any
      if (va<vb) return sortDir==='asc' ? -1 : 1
      if (va>vb) return sortDir==='asc' ? 1 : -1
      return 0
    })
    return arr
  },[items, sortKey, sortDir])

  async function handleDelete(){ /* … si lo usás … */ }

  return (
    <div className="vstack" style={{gap:12}}>
      <MovementsTable
        items={sorted}
        onAdd={()=>setOpen(true)}
        onSort={(k)=>{
          if (sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc')
          else { setSortKey(k); setSortDir('asc') }
        }}
        sortKey={sortKey}
        sortDir={sortDir}
      />

      {open && (
        <AddMovementModal
          onClose={()=>setOpen(false)}
          onCreated={(m)=>{ setItems(prev=>[m, ...prev]) }}
        />
      )}

      <footer className="bottom-nav">
        <nav className="card" style={{padding:12, marginTop:18}}>
          <div className="hstack" style={{gap:24}}>
            <span>🏠 Inicio</span>
            <span>🧾 Cierre de turno</span>
            <span>📜 Historial de cierres</span>
          </div>
        </nav>
      </footer>
    </div>
  )
}
