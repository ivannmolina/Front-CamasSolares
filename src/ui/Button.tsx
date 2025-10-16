import type { ButtonHTMLAttributes } from 'react'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'ghost'|'default' }
export default function Button({variant='default', className='', ...p}: Props){
  const cls = ['btn', variant==='primary'?'primary':'', variant==='ghost'?'ghost':'', className].join(' ')
  return <button {...p} className={cls}/>
}
