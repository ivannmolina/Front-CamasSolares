import { useState } from 'react'
import Modal from '@/ui/Modal'
import Button from '@/ui/Button'
import type { Movement } from '../types'
import { createCierre } from '@/features/cierres/api/cierres.api'

type Props = {
  onClose: () => void
  movements: Movement[]
  currentDate: string
  onSuccess?: () => void  // Callback para recargar movimientos
}

export default function CloseTurnModal({ onClose, movements, currentDate, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  // Calcular resumen general
  const ingresos = movements
    .filter(m => m.tipo === 'IN')
    .reduce((sum, m) => sum + m.monto, 0)
  
  const egresos = movements
    .filter(m => m.tipo === 'OUT')
    .reduce((sum, m) => sum + m.monto, 0)
  
  const balance = ingresos - egresos

  // Calcular totales por medio de pago (solo ingresos)
  const totalEfectivo = movements
    .filter(m => m.tipo === 'IN' && m.medioPago === 'Efectivo')
    .reduce((sum, m) => sum + m.monto, 0)
  
  const totalMercadoPago = movements
    .filter(m => m.tipo === 'IN' && m.medioPago === 'Mercado Pago')
    .reduce((sum, m) => sum + m.monto, 0)
  
  const totalTransferencia = movements
    .filter(m => m.tipo === 'IN' && (m.medioPago === 'Débito' || m.medioPago === 'Crédito'))
    .reduce((sum, m) => sum + m.monto, 0)

  const handleAccept = () => {
    setStep(2)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      // Preparar fecha en formato YYYY-MM-DD
      const today = new Date()
      const fechaISO = today.toISOString().split('T')[0] // "2025-10-18"
      
      // 1. Crear el cierre en el backend
      const payload = {
        fecha: fechaISO,  // Backend espera 'fecha' en formato YYYY-MM-DD
        totalEfectivo,
        totalMercadoPago,
        totalTransferencia,
        totalGeneral: ingresos, // Total general = total ingresos
      }
      
      console.log('📤 Enviando cierre al backend:', payload)
      
      const cierre = await createCierre(payload)
      
      console.log('✅ Cierre creado en el backend:', cierre)
      
      // 2. Generar PDF
      await generatePDF(movements, ingresos, egresos, balance, totalEfectivo, totalMercadoPago, totalTransferencia, currentDate)
      
      // 3. Ir a modal de éxito
      setStep(3)
    } catch (err) {
      console.error('❌ Error al crear cierre:', err)
      // Mostrar más detalles del error
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string | string[] } } }
        console.error('📛 Detalles del error:', axiosError.response?.data)
        
        // Mostrar mensaje específico si existe
        const errorData = axiosError.response?.data
        if (errorData?.message) {
          const messages = Array.isArray(errorData.message) 
            ? errorData.message.join('\n') 
            : errorData.message
          console.error('📝 Mensajes de validación:', messages)
          alert(`Error de validación:\n${messages}`)
          return
        }
      }
      alert('Error al realizar el cierre de turno')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    onClose()
    // Recargar los movimientos para que no aparezcan los cerrados
    if (onSuccess) onSuccess()
  }

  // Modal 1: Aceptar cierre
  if (step === 1) {
    return (
      <Modal title="Realizar cierre de turno" onClose={onClose}>
        <div className="vstack" style={{ gap: 20 }}>
          <div style={{ fontSize: '16px', textAlign: 'center', padding: '20px 0' }}>
            ¿Desea cerrar el turno?
          </div>
          <div className="hstack" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="primary" onClick={handleAccept}>Aceptar</Button>
          </div>
        </div>
      </Modal>
    )
  }

  // Modal 2: Confirme cierre de turno
  if (step === 2) {
    const now = new Date()
    const fecha = now.toLocaleDateString('es-AR')
    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

    return (
      <Modal title="Confirme cierre de turno" onClose={onClose}>
        <div className="vstack" style={{ gap: 20 }}>
          <div style={{ padding: '20px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '15px', marginBottom: 12, fontWeight: 600 }}>
              Detalle del cierre a realizar:
            </div>
            <div className="vstack" style={{ gap: 8, fontSize: '14px' }}>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span className="caption">Fecha:</span>
                <span style={{ fontWeight: 600 }}>{fecha}</span>
              </div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span className="caption">Hora:</span>
                <span style={{ fontWeight: 600 }}>{hora}</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}></div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span className="caption">Total movimientos:</span>
                <span style={{ fontWeight: 600 }}>{movements.length}</span>
              </div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span style={{ color: '#6ee7b7' }}>Ingresos:</span>
                <span style={{ fontWeight: 600, color: '#6ee7b7' }}>${ingresos.toFixed(2)}</span>
              </div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span style={{ color: '#fda4af' }}>Egresos:</span>
                <span style={{ fontWeight: 600, color: '#fda4af' }}>${egresos.toFixed(2)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}></div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Balance:</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: balance >= 0 ? '#6ee7b7' : '#fda4af' }}>
                  ${balance.toFixed(2)}
                </span>
              </div>
              
              {/* Detalle por medio de pago */}
              <div style={{ height: 1, background: 'var(--border)', margin: '12px 0 8px 0' }}></div>
              <div style={{ fontSize: '13px', marginBottom: 6, fontWeight: 600, color: 'var(--muted)' }}>
                Detalle por Medio de Pago:
              </div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span className="caption">Efectivo:</span>
                <span style={{ fontWeight: 600 }}>${totalEfectivo.toFixed(2)}</span>
              </div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span className="caption">Mercado Pago:</span>
                <span style={{ fontWeight: 600 }}>${totalMercadoPago.toFixed(2)}</span>
              </div>
              <div className="hstack" style={{ justifyContent: 'space-between' }}>
                <span className="caption">Transferencia:</span>
                <span style={{ fontWeight: 600 }}>${totalTransferencia.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="hstack" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="primary" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  // Modal 3: Cierre realizado
  return (
    <Modal title="Cierre de turno" onClose={handleFinish}>
      <div className="vstack" style={{ gap: 20 }}>
        <div style={{ fontSize: '16px', textAlign: 'center', padding: '30px 20px', color: '#6ee7b7' }}>
          ✓ Se realizó el cierre de turno satisfactoriamente
        </div>
        <div style={{ fontSize: '14px', textAlign: 'center', color: 'var(--muted)' }}>
          El PDF ha sido generado y descargado
        </div>
        <div className="hstack" style={{ justifyContent: 'center', gap: 10 }}>
          <Button className="primary" onClick={handleFinish}>Aceptar</Button>
        </div>
      </div>
    </Modal>
  )
}

// Función para generar el PDF
async function generatePDF(
  movements: Movement[],
  ingresos: number,
  egresos: number,
  balance: number,
  totalEfectivo: number,
  totalMercadoPago: number,
  totalTransferencia: number,
  currentDate: string
) {
  // Crear contenido HTML para imprimir
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Camas Solares Jorge - Cierre de Turno ${currentDate}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          font-size: 12px;
        }
        h1 {
          text-align: center;
          margin-bottom: 10px;
          font-size: 24px;
          font-weight: bold;
        }
        .date {
          text-align: center;
          margin-bottom: 20px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .summary {
          margin-top: 30px;
          padding: 15px;
          background-color: #f9f9f9;
          border: 2px solid #ddd;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 14px;
        }
        .summary-row.total {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #333;
          margin-top: 10px;
          padding-top: 10px;
        }
        .ingreso { color: green; }
        .egreso { color: red; }
        .balance { color: ${balance >= 0 ? 'green' : 'red'}; }
      </style>
    </head>
    <body>
      <h1>Camas Solares Jorge</h1>
      <div class="date">${new Date().toLocaleString('es-AR')}</div>
      
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Tipo Cama</th>
            <th>Monto</th>
            <th>Medio Pago</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          ${movements.map(m => `
            <tr>
              <td>${m.cliente?.nombre || '-'}</td>
              <td>${m.cliente?.apellido || '-'}</td>
              <td>${new Date(m.fecha).toLocaleString('es-AR')}</td>
              <td>${m.tipo === 'IN' ? 'Ingreso' : 'Egreso'}</td>
              <td>${m.tipoCama || '-'}</td>
              <td>$${m.monto.toFixed(2)}</td>
              <td>${m.medioPago || '-'}</td>
              <td>${m.descripcion || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <h2 style="margin-top: 0; margin-bottom: 15px;">Resumen del Turno</h2>
        
        <div class="summary-row ingreso">
          <span>Total Ingresos:</span>
          <span>$${ingresos.toFixed(2)}</span>
        </div>
        
        <div class="summary-row egreso">
          <span>Total Egresos:</span>
          <span>$${egresos.toFixed(2)}</span>
        </div>
        
        <div class="summary-row total balance">
          <span>Balance General:</span>
          <span>$${balance.toFixed(2)}</span>
        </div>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #ddd;">
          <h3 style="margin-top: 0; margin-bottom: 10px;">Detalle por Medio de Pago (Ingresos)</h3>
          
          <div class="summary-row">
            <span>Efectivo:</span>
            <span>$${totalEfectivo.toFixed(2)}</span>
          </div>
          
          <div class="summary-row">
            <span>Mercado Pago:</span>
            <span>$${totalMercadoPago.toFixed(2)}</span>
          </div>
          
          <div class="summary-row">
            <span>Transferencia (Débito/Crédito):</span>
            <span>$${totalTransferencia.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  // Abrir ventana de impresión
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Esperar a que cargue y luego imprimir
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      // No cerramos la ventana automáticamente para que el usuario pueda guardar como PDF
    }
  }
}
