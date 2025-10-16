import { useEffect, useState } from 'react'
import Input from '@/ui/Input'
import Button from '@/ui/Button'
import { searchClients } from '@/features/clients/api/clients.api'
import type { Client } from '@/features/clients/types'

type Props = {
  value: Client | null
  onChange: (c: Client | null) => void
  onAddClient: () => void
}

export default function ClientPicker({value, onChange, onAddClient}: Props){
  const [q,setQ] = useState('')
  const [results,setResults] = useState<Client[]>([])
  const [showResults, setShowResults] = useState(false)
  
  useEffect(()=>{
    let mounted = true
    if (q.trim()) {
      searchClients(q).then(r=>{ 
        if(mounted) {
          setResults(r)
          setShowResults(true)
        }
      })
    } else {
      setResults([])
      setShowResults(false)
    }
    return ()=>{ mounted=false }
  },[q])

  const handleSelectClient = (c: Client) => {
    onChange(c)
    setQ(`${c.nombre} ${c.apellido}`)
    setShowResults(false)
  }

  const handleClearClient = () => {
    onChange(null)
    setQ('')
    setShowResults(false)
  }

  return (
    <div className="vstack" style={{gap:6}}>
      <label className="caption">Buscar cliente</label>
      <div className="hstack" style={{gap:8}}>
        <div style={{flex:1, position:'relative'}}>
          <div style={{position:'relative'}}>
            <Input 
              placeholder="Buscar por nombre, apellido o teléfono"
              value={value ? `${value.nombre} ${value.apellido}` : q} 
              onChange={e=>{
                if(!value) setQ(e.target.value)
              }}
              onFocus={() => {
                if(q.trim() && !value) setShowResults(true)
              }}
              disabled={!!value}
            />
            {value && (
              <button 
                onClick={handleClearClient}
                style={{
                  position:'absolute',
                  right:'8px',
                  top:'50%',
                  transform:'translateY(-50%)',
                  background:'none',
                  border:'none',
                  cursor:'pointer',
                  color:'var(--muted)',
                  fontSize:'18px',
                  padding:'4px 8px'
                }}
                title="Limpiar selección"
              >
                ✕
              </button>
            )}
          </div>
          {showResults && !value && q.trim() && (
            <div style={{
              position:'absolute',
              zIndex:10,
              width:'100%',
              border:'1px solid var(--border)',
              borderRadius:8,
              background:'var(--surface)',
              marginTop:6,
              maxHeight:180,
              overflow:'auto',
              boxShadow:'0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {results.length > 0 ? (
                results.map(c=>(
                  <div key={c.id}
                       style={{
                         padding:'8px 10px',
                         cursor:'pointer',
                         borderBottom:'1px solid var(--border)'
                       }}
                       className="hover:bg-zinc-800/50"
                       onClick={()=>handleSelectClient(c)}
                  >
                    <div><b>{c.nombre} {c.apellido}</b></div>
                    <div className="caption">{c.telefono ?? 's/teléfono'}</div>
                  </div>
                ))
              ) : (
                <div className="caption" style={{padding:'12px 10px', textAlign:'center'}}>
                  No se encontraron clientes. Puedes añadir uno nuevo con el botón "+Añadir cliente".
                </div>
              )}
            </div>
          )}
        </div>
        {!value && <Button onClick={onAddClient}>+ Añadir cliente</Button>}
      </div>
    </div>
  )
}
