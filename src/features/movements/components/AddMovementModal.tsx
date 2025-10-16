import { useState } from 'react'
import Modal from '@/ui/Modal'
import Input from '@/ui/Input'
import Select from '@/ui/Select'
import Button from '@/ui/Button'
import ClientPicker from './ClientPicker'
import AddClientModal from './AddClientModal'
import type { Client } from '@/features/clients/types'
import { createMovement } from '../api/movements.api'
import type { Movement } from '../types'

export default function AddMovementModal({onClose, onCreated}:{onClose:()=>void; onCreated:(m:Movement)=>void}){
  const [cliente,setCliente] = useState<Client|null>(null)
  const [fecha,setFecha] = useState<string>(new Date().toISOString().slice(0,16))
  const [tipoCama,setTipoCama] = useState<'Horizontal'|'Vertical'>('Horizontal')
  const [monto,setMonto] = useState<number>(0)
  const [medioPago,setMedioPago] = useState<'Efectivo'|'Mercado Pago'|'Débito'|'Crédito'>('Efectivo')
  const [openAddClient,setOpenAddClient]=useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(){
    if(!cliente || monto < 0) return
    setSaving(true)
    try{
      const created = await createMovement({
        clienteId: cliente.id,
        fecha: new Date(fecha).toISOString(),
        tipoCama,
        monto: Number(monto),
        medioPago
      })
      onCreated(created)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal title="Añadir movimiento" onClose={onClose}>
        <div className="vstack" style={{gap:14}}>
          <ClientPicker value={cliente} onChange={setCliente} onAddClient={()=>setOpenAddClient(true)} />
          <div className="grid-3">
            <div><label className="caption">Fecha</label><Input type="datetime-local" value={fecha} onChange={e=>setFecha(e.target.value)} /></div>
            <div><label className="caption">Tipo cama</label><Select value={tipoCama} onChange={e=>setTipoCama(e.target.value as any)}><option>Horizontal</option><option>Vertical</option></Select></div>
            <div><label className="caption">Medio de pago</label><Select value={medioPago} onChange={e=>setMedioPago(e.target.value as any)}><option>Efectivo</option><option>Mercado Pago</option><option>Débito</option><option>Crédito</option></Select></div>
          </div>
          <div><label className="caption">Monto</label><Input type="number" value={monto} onChange={e=>setMonto(Number(e.target.value))} placeholder="0" /></div>
          <div className="hstack" style={{justifyContent:'flex-end', gap:10, marginTop:6}}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="primary" onClick={handleSave} disabled={!cliente || saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </div>
        </div>
      </Modal>

      {openAddClient && (
        <AddClientModal onClose={()=>setOpenAddClient(false)} onCreated={(c)=>{ setCliente(c); }} />
      )}
    </>
  )
}
