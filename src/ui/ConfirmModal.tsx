import Button from './Button'

type Props = {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" style={{maxWidth: '400px'}} onClick={e => e.stopPropagation()}>
        <div style={{padding: '20px'}}>
          <h3 style={{margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600}}>{title}</h3>
          <p style={{margin: '0 0 20px 0', color: 'var(--muted)'}}>{message}</p>
          <div className="hstack" style={{justifyContent: 'flex-end', gap: 10}}>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button 
              onClick={onConfirm} 
              style={{background: '#dc2626', color: 'white', borderColor: '#dc2626'}}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
