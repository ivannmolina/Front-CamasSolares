import { useState } from 'react'
import Modal from '@/ui/Modal'
import Input from '@/ui/Input'
import Select from '@/ui/Select'
import Button from '@/ui/Button'
import ClientPicker from './ClientPicker'
import AddClientModal from './AddClientModal'
import type { Client } from '@/features/clients/types'
import { createMovement } from '../api/movements.api'
import type { Movement, TipoMovimiento } from '../types'

export default function AddMovementModal({onClose, onCreated}:{onClose:()=>void; onCreated:(m:Movement)=>void}){
  const [cliente,setCliente] = useState<Client|null>(null)
  const now = new Date()
  const [fecha,setFecha] = useState<string>(now.toISOString().slice(0,10)) // YYYY-MM-DD
  const [hora,setHora] = useState<string>(now.toTimeString().slice(0,5)) // HH:MM
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('IN')
  const [tipoCama,setTipoCama] = useState<'Horizontal'|'Vertical'>('Horizontal')
  const [monto,setMonto] = useState<string>('')
  const [medioPago,setMedioPago] = useState<'Efectivo'|'Mercado Pago'|'Débito'|'Crédito'>('Efectivo')
  const [descripcion, setDescripcion] = useState<string>('extracción de caja')
  const [openAddClient,setOpenAddClient]=useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(){
    const montoNum = Number(monto)
    
    // Validar según el tipo de movimiento
    if(tipoMovimiento === 'IN' && !cliente) {
      alert('Por favor selecciona un cliente')
      return
    }
    
    if(montoNum <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }
    
    setSaving(true)
    try{
      // Combinar fecha y hora
      const fechaHora = `${fecha}T${hora}:00`
      console.log('Creando movimiento con datos:', {
        clienteId: tipoMovimiento === 'IN' ? cliente?.id : undefined,
        fecha: new Date(fechaHora).toISOString(),
        tipo: tipoMovimiento,
        tipoCama: tipoMovimiento === 'IN' ? tipoCama : undefined,
        monto: Number(monto),
        medioPago: tipoMovimiento === 'IN' ? medioPago : undefined,
        descripcion: tipoMovimiento === 'OUT' ? descripcion : undefined
      })
      
      const created = await createMovement({
        clienteId: tipoMovimiento === 'IN' ? cliente!.id : undefined,
        fecha: new Date(fechaHora).toISOString(),
        tipo: tipoMovimiento,
        tipoCama: tipoMovimiento === 'IN' ? tipoCama : undefined,
        monto: montoNum,
        medioPago: tipoMovimiento === 'IN' ? medioPago : undefined,
        descripcion: tipoMovimiento === 'OUT' ? descripcion : undefined
      })
      
      console.log('Movimiento creado:', created)
      onCreated(created)
      onClose()
    } catch(error) {
      console.error('Error al crear movimiento:', error)
      alert('Error al guardar el movimiento. Por favor intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal title="Añadir movimiento" onClose={onClose}>
        <div className="vstack" style={{gap:14}}>
          {tipoMovimiento === 'IN' && (
            <ClientPicker value={cliente} onChange={setCliente} onAddClient={()=>setOpenAddClient(true)} />
          )}
          
          <div>
            <label className="caption">Tipo de movimiento</label>
            <Select value={tipoMovimiento} onChange={e=>setTipoMovimiento(e.target.value as TipoMovimiento)}>
              <option value="IN">Ingreso</option>
              <option value="OUT">Egreso</option>
            </Select>
          </div>

          <div className="grid-2">
            <div>
              <label className="caption">Fecha</label>
              <Input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
            </div>
            <div>
              <label className="caption">Hora</label>
              <Input type="time" value={hora} onChange={e=>setHora(e.target.value)} />
            </div>
          </div>

          {tipoMovimiento === 'IN' ? (
            <>
              <div className="grid-2">
                <div>
                  <label className="caption">Tipo cama</label>
                  <Select value={tipoCama} onChange={e=>setTipoCama(e.target.value as 'Horizontal'|'Vertical')}>
                    <option>Horizontal</option>
                    <option>Vertical</option>
                  </Select>
                </div>
                <div>
                  <label className="caption">Medio de pago</label>
                  <Select value={medioPago} onChange={e=>setMedioPago(e.target.value as 'Efectivo'|'Mercado Pago'|'Débito'|'Crédito')}>
                    <option>Efectivo</option>
                    <option>Mercado Pago</option>
                    <option>Débito</option>
                    <option>Crédito</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="caption">Monto</label>
                <Input type="number" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="Ingrese el monto" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="caption">Monto</label>
                <Input type="number" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="Ingrese el monto" />
              </div>
              <div>
                <label className="caption">Descripción</label>
                <Input type="text" value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="extracción de caja" />
              </div>
            </>
          )}

          <div className="hstack" style={{justifyContent:'flex-end', gap:10, marginTop:6}}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="primary" onClick={handleSave} disabled={(tipoMovimiento === 'IN' && !cliente) || !monto || Number(monto) <= 0 || saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>

      {openAddClient && (
        <AddClientModal onClose={()=>setOpenAddClient(false)} onCreated={(c)=>{ setCliente(c); }} />
      )}
    </>
  )
}
