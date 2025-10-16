import { useState, useEffect } from 'react'
import Modal from '@/ui/Modal'
import Input from '@/ui/Input'
import Button from '@/ui/Button'
import { createClient, searchClients } from '@/features/clients/api/clients.api'
import type { Client } from '@/features/clients/types'
import { waLink, phoneToWaNumber } from '@/lib/format'

export default function AddClientModal({onClose, onCreated}:{onClose:()=>void; onCreated:(c:Client)=>void}){
  const [nombre,setNombre]=useState('')
  const [apellido,setApellido]=useState('')
  const [telefono,setTelefono]=useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [isDuplicate, setIsDuplicate] = useState(false)

  const link = waLink(telefono)
  const numberOk = phoneToWaNumber(telefono) !== null // 8–15 dígitos

  // Validar duplicados en tiempo real
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!nombre.trim() || !apellido.trim()) {
        setIsDuplicate(false)
        setError('')
        return
      }

      try {
        const existingClients = await searchClients(`${nombre} ${apellido}`)
        const duplicate = existingClients.find(
          c => c.nombre.toLowerCase() === nombre.toLowerCase() && 
               c.apellido.toLowerCase() === apellido.toLowerCase()
        )
        
        if (duplicate) {
          setIsDuplicate(true)
          setError('⚠️ Este cliente ya está añadido')
        } else {
          setIsDuplicate(false)
          setError('')
        }
      } catch (err) {
        console.error('Error al verificar cliente:', err)
      }
    }

    const timeoutId = setTimeout(checkDuplicate, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [nombre, apellido])

  async function handleSave(){
    if(!nombre || !apellido || !numberOk || isDuplicate) return
    
    setSaving(true)
    try {
      const c = await createClient({nombre,apellido,telefono})
      onCreated(c)
      onClose()
    } catch(err) {
      setError('Error al guardar el cliente')
      console.error(err)
    } finally { 
      setSaving(false) 
    }
  }

  return (
    <Modal title="Añadir cliente" onClose={onClose}>
      <div className="vstack" style={{gap:12}}>
        <div>
          <label className="caption">Nombre</label>
          <Input value={nombre} onChange={e=>setNombre(e.target.value)} />
        </div>
        <div>
          <label className="caption">Apellido</label>
          <Input value={apellido} onChange={e=>setApellido(e.target.value)} />
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
        {error && (
          <div style={{color:'#dc2626', fontSize:'14px', padding:'10px 12px', background:'rgba(220,38,38,0.1)', borderRadius:'8px', fontWeight: 500}}>
            {error}
          </div>
        )}
        <div className="hstack" style={{justifyContent:'flex-end', gap:10, marginTop:6}}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button className="primary" onClick={handleSave} disabled={!nombre || !apellido || !numberOk || isDuplicate || saving}>
            {saving ? 'Guardando…' : 'Guardar cliente'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
