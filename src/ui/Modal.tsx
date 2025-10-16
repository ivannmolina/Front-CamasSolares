import type { ReactNode, MouseEvent  } from 'react'  

export default function Modal({title, onClose, children, footer}:{title:string; onClose:()=>void; children:ReactNode; footer?:ReactNode}){
  const stop = (e:MouseEvent)=>e.stopPropagation()
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={stop}>
        <header>
          <h3 style={{margin:0}}>{title}</h3>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </header>
        <section>{children}</section>
      </div>
    </div>
  )
}
