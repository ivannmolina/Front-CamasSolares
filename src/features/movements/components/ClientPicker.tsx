import { useEffect, useState } from 'react'
import Input from '@/ui/Input'
import Button from '@/ui/Button'
import { searchClients } from '@/features/clients/api/clients.api'
import type { Client } from '@/features/clients/types'
import { waLink } from '@/lib/format'

type Props = {
  value: Client | null
  onChange: (c: Client | null) => void
  onAddClient: () => void
}

export default function ClientPicker({value, onChange, onAddClient}: Props){
  const [q,setQ] = useState(value ? `${value.nombre} ${value.apellido}` : '')
  const [results,setResults] = useState<Client[]>([])
  useEffect(()=>{
    let mounted = true
    searchClients(q).then(r=>{ if(mounted) setResults(r) })
    return ()=>{ mounted=false }
  },[q])

  useEffect(()=>{
    if(value) setQ(`${value.nombre} ${value.apellido}`)
  },[value])

  return (
    <div className="vstack" style={{gap:6}}>
      <label className="caption">Cliente</label>
      <div className="hstack" style={{gap:8}}>
        <div style={{flex:1}}>
          <Input placeholder="Buscar por nombre, apellido o teléfono"
                 value={q} onChange={e=>setQ(e.target.value)} />
          {q && results.length>0 && (
            <div style={{border:'1px solid var(--border)',borderRadius:8,background:'#fff',marginTop:6,maxHeight:180,overflow:'auto'}}>
              {results.map(c=>(
                <div key={c.id}
                     style={{padding:'8px 10px',cursor:'pointer'}}
                     onClick={()=>{onChange(c); setQ(`${c.nombre} ${c.apellido}`)}}
                >
                  <b>{c.nombre} {c.apellido}</b> · {c.telefono ?? 's/teléfono'}
                  {waLink(c.telefono) && <> · <a href={waLink(c.telefono)!} target="_blank" rel="noreferrer">WhatsApp</a></>}
                </div>
              ))}
            </div>
          )}
        </div>
        <Button onClick={onAddClient}>+ Añadir cliente</Button>
      </div>
      {value && (
        <div className="caption">
          Seleccionado: <b>{value.nombre} {value.apellido}</b> · {value.telefono ?? 's/teléfono'}
          {waLink(value.telefono) && <> · <a href={waLink(value.telefono)!} target="_blank" rel="noreferrer">WhatsApp</a></>}
        </div>
      )}
    </div>
  )
}
