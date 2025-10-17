import { useEffect, useState } from 'react'
import Input from '@/ui/Input'
import Button from '@/ui/Button'
import { searchClients } from '@/features/clients/api/clients.api'
import type { Client } from '@/features/clients/types'
import EditClientModal from './EditClientModal'

type Props = {
  value: Client | null
  onChange: (c: Client | null) => void
  onAddClient: () => void
}

export default function ClientPicker({value, onChange, onAddClient}: Props){
  const [q,setQ] = useState('')
  const [results,setResults] = useState<Client[]>([])
  const [showResults, setShowResults] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
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

  const handleEditClient = (c: Client, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se seleccione el cliente
    setEditingClient(c)
    setShowResults(false)
  }

  const handleClientUpdated = (updated: Client) => {
    // Actualizar en la lista de resultados
    setResults(prev => prev.map(c => c.id === updated.id ? updated : c))
    // Si el cliente editado es el seleccionado, actualizarlo también
    if (value?.id === updated.id) {
      onChange(updated)
      setQ(`${updated.nombre} ${updated.apellido}`)
    }
    setEditingClient(null)
  }

  return (
    <div className="vstack" style={{gap:12}}>
      <div style={{flex:1, position:'relative'}}>
        <label className="caption">Buscar cliente</label>
        <div className="hstack" style={{gap:8, marginTop:6}}>
          <div style={{flex:1, position:'relative'}}>
            <div style={{position:'relative'}}>
              <Input 
                className="client-search-input"
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
                         borderBottom:'1px solid var(--border)',
                         display:'flex',
                         alignItems:'center',
                         justifyContent:'space-between',
                         gap:'8px'
                       }}
                       className="hover:bg-zinc-800/50"
                       onClick={()=>handleSelectClient(c)}
                  >
                    <div style={{flex:1}}>
                      <div>
                        <b>{c.nombre} {c.apellido}</b>
                        {c.dni && (
                          <span style={{marginLeft:'8px', color:'var(--muted)', fontSize:'13px'}}>
                            DNI: {c.dni}
                          </span>
                        )}
                      </div>
                      <div className="caption">{c.telefono ?? 's/teléfono'}</div>
                    </div>
                    <button
                      onClick={(e) => handleEditClient(c, e)}
                      style={{
                        background:'none',
                        border:'none',
                        cursor:'pointer',
                        color:'var(--muted)',
                        fontSize:'16px',
                        padding:'4px 8px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        borderRadius:'6px',
                        transition:'all 0.2s'
                      }}
                      className="hover:bg-zinc-700"
                      title="Editar cliente"
                    >
                      ✏️
                    </button>
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
      
      {editingClient && (
        <EditClientModal 
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={handleClientUpdated}
        />
      )}
    </div>
  )
}
