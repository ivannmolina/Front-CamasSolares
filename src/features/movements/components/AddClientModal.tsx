import { useState } from 'react'
import Modal from '@/ui/Modal'
import Input from '@/ui/Input'
import Button from '@/ui/Button'
import { createClient } from '@/features/clients/api/clients.api'
import type { Client } from '@/features/clients/types'
import { waLink, phoneToWaNumber } from '@/lib/format'

export default function AddClientModal({onClose, onCreated}:{onClose:()=>void; onCreated:(c:Client)=>void}){
  const [nombre,setNombre]=useState('')
  const [apellido,setApellido]=useState('')
  const [telefono,setTelefono]=useState('')
  const [saving, setSaving] = useState(false)

  const link = waLink(telefono)
  const numberOk = phoneToWaNumber(telefono) !== null // 8–15 dígitos

  async function handleSave(){
    if(!nombre || !apellido || !numberOk) return
    setSaving(true)
    try{
      const c = await createClient({nombre,apellido,telefono})
      onCreated(c)   // autocompleta el selector
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h3 style={{margin:0}}>Nuevo cliente</h3>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </header>
        <section className="vstack">
          <div className="grid-2">
            <div><label className="caption">Nombre</label><Input value={nombre} onChange={e=>setNombre(e.target.value)} /></div>
            <div><label className="caption">Apellido</label><Input value={apellido} onChange={e=>setApellido(e.target.value)} /></div>
          </div>
          <div>
            <label className="caption">Teléfono (incluí código de país y característica)</label>
            <Input value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="+54 264 xxxx xxxx / +56 9 xxxx xxxx" />
            <div className="caption" style={{marginTop:4, color: numberOk ? 'var(--muted)' : 'var(--danger)'}}>
              {numberOk
                ? (link ? <>Link WhatsApp: <code>{link}</code></> : 'Ingresá el número completo con característica y país')
                : 'Número inválido (8 a 15 dígitos luego de quitar símbolos)'}
            </div>
          </div>
        </section>
        <footer>
          <Button onClick={onClose}>Cancelar</Button>
          <Button className="primary" onClick={handleSave} disabled={!nombre || !apellido || !numberOk || saving}>
            {saving ? 'Guardando…' : 'Guardar cliente'}
          </Button>
        </footer>
      </div>
    </div>
  )
}
