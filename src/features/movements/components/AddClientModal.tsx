import { useState, useEffect } from 'react'
import Modal from '@/ui/Modal'
import Input from '@/ui/Input'
import Button from '@/ui/Button'
import { createClient, listClients } from '@/features/clients/api/clients.api'
import type { Client } from '@/features/clients/types'
import { waLink, phoneToWaNumber } from '@/lib/format'

export default function AddClientModal({onClose, onCreated}:{onClose:()=>void; onCreated:(c:Client)=>void}){
  const [nombre,setNombre]=useState('')
  const [apellido,setApellido]=useState('')
  const [dni,setDni]=useState('')
  const [telefono,setTelefono]=useState('')
  const [saving, setSaving] = useState(false)
  const [isDniDuplicate, setIsDniDuplicate] = useState(false)

  const link = waLink(telefono)
  const numberOk = telefono === '' || phoneToWaNumber(telefono) !== null

  // Validar DNI duplicado
  useEffect(() => {
    const checkDniDuplicate = async () => {
      setIsDniDuplicate(false)

      if (!dni.trim()) return

      try {
        const allClients = await listClients()
        const dniExists = allClients.find(c => c.dni && c.dni === dni.trim())
        
        if (dniExists) {
          setIsDniDuplicate(true)
          console.log('DNI duplicado encontrado:', dniExists)
        }
      } catch (err) {
        console.error('Error al verificar DNI:', err)
      }
    }

    const timeoutId = setTimeout(checkDniDuplicate, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [dni])

  async function handleSave(){
    if(!nombre || !apellido || !numberOk || isDniDuplicate) return
    
    setSaving(true)
    try {
      console.log('Creando cliente:', { nombre, apellido, dni, telefono })
      const c = await createClient({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim() || undefined,
        telefono: telefono.trim() || undefined
      })
      console.log('Cliente creado:', c)
      onCreated(c)
      onClose()
    } catch(err) {
      console.error('Error al guardar el cliente:', err)
      alert('Error al guardar el cliente')
    } finally { 
      setSaving(false) 
    }
  }

  return (
    <Modal title="Añadir cliente" onClose={onClose}>
      <div className="vstack" style={{gap:12}}>
        <div>
          <label className="caption">Nombre</label>
          <Input className="client-form-input" value={nombre} onChange={e=>setNombre(e.target.value)} />
        </div>
        <div>
          <label className="caption">Apellido</label>
          <Input className="client-form-input" value={apellido} onChange={e=>setApellido(e.target.value)} />
        </div>
        <div>
          <label className="caption">DNI (opcional)</label>
          <Input 
            className="client-form-input" 
            value={dni} 
            onChange={e=>setDni(e.target.value.replace(/\D/g, ''))} 
            placeholder="12345678"
            maxLength={20}
          />
          <div className="caption" style={{marginTop:4}}>
            Solo números, hasta 20 dígitos
          </div>
        </div>
        <div>
          <label className="caption">Teléfono (incluí código de país y característica)</label>
          <Input className="client-form-input" value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="+54 264 xxxx xxxx / +56 9 xxxx xxxx" />
          <div className="caption" style={{marginTop:4, color: numberOk ? 'var(--muted)' : 'var(--danger)'}}>
            {numberOk
              ? (link ? <>Link WhatsApp: <code>{link}</code></> : 'Ingresá el número completo con característica y país')
              : 'Número inválido (8 a 15 dígitos luego de quitar símbolos)'}
          </div>
        </div>

        {/* Alerta de DNI duplicado (BLOQUEANTE) */}
        {isDniDuplicate && (
          <div className="bg-rose-900/40 text-rose-300" style={{padding:'12px 14px', borderRadius:'10px', border:'1px solid #9f1239', fontSize:'14px', fontWeight: 500}}>
            ⚠️ Ya existe un cliente con este DNI
          </div>
        )}

        <div className="hstack" style={{justifyContent:'flex-end', gap:10, marginTop:6}}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button className="primary" onClick={handleSave} disabled={!nombre || !apellido || !numberOk || isDniDuplicate || saving}>
            {saving ? 'Guardando…' : 'Guardar cliente'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
