import { useState, useEffect } from 'react'
import Modal from '@/ui/Modal'
import Input from '@/ui/Input'
import Button from '@/ui/Button'
import { updateClient, searchClients } from '@/features/clients/api/clients.api'
import type { Client } from '@/features/clients/types'
import { waLink, phoneToWaNumber } from '@/lib/format'

type Props = {
  client: Client
  onClose: () => void
  onUpdated: (c: Client) => void
}

export default function EditClientModal({client, onClose, onUpdated}: Props){
  const [nombre, setNombre] = useState(client.nombre)
  const [apellido, setApellido] = useState(client.apellido)
  const [dni, setDni] = useState(client.dni ?? '')
  const [telefono, setTelefono] = useState(client.telefono ?? '')
  const [saving, setSaving] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)

  const link = waLink(telefono)
  const numberOk = telefono === '' || phoneToWaNumber(telefono) !== null

  // Validar duplicados en tiempo real (excluyendo el cliente actual)
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!nombre.trim() || !apellido.trim()) {
        setIsDuplicate(false)
        return
      }

      // Si no cambió el nombre y apellido, no es duplicado
      if (nombre === client.nombre && apellido === client.apellido) {
        setIsDuplicate(false)
        return
      }

      try {
        const existingClients = await searchClients(`${nombre} ${apellido}`)
        const duplicate = existingClients.find(
          c => c.id !== client.id && 
               c.nombre.toLowerCase() === nombre.toLowerCase() && 
               c.apellido.toLowerCase() === apellido.toLowerCase()
        )
        
        setIsDuplicate(!!duplicate)
      } catch (err) {
        console.error('Error al verificar cliente:', err)
      }
    }

    const timeoutId = setTimeout(checkDuplicate, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [nombre, apellido, client.id, client.nombre, client.apellido])

  async function handleSave(){
    if(!nombre || !apellido || !numberOk || isDuplicate) return
    
    setSaving(true)
    try {
      console.log('Enviando actualización:', {
        id: client.id,
        nombre,
        apellido,
        dni: dni.trim() || undefined,
        telefono: telefono.trim() || undefined
      })
      
      const updated = await updateClient(client.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim() || undefined,
        telefono: telefono.trim() || undefined
      })
      
      console.log('Cliente actualizado:', updated)
      onUpdated(updated)
      onClose()
    } catch(err) {
      console.error('Error al actualizar el cliente:', err)
      alert('Error al actualizar el cliente')
    } finally { 
      setSaving(false) 
    }
  }

  return (
    <Modal title="Editar cliente" onClose={onClose}>
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
        {isDuplicate && (
          <div className="bg-rose-900/40 text-rose-300" style={{padding:'12px 14px', borderRadius:'10px', border:'1px solid #9f1239', fontSize:'14px', fontWeight: 500}}>
            ⚠️ Ya existe otro cliente con ese nombre y apellido
          </div>
        )}
        <div className="hstack" style={{justifyContent:'flex-end', gap:10, marginTop:6}}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button className="primary" onClick={handleSave} disabled={!nombre || !apellido || !numberOk || isDuplicate || saving}>
            {saving ? 'Guardando…' : 'Actualizar cliente'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
