import type { SelectHTMLAttributes, ReactNode } from 'react'
type Props = SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }
export default function Select({children, ...p}: Props){
  return <select {...p}>{children}</select>
}
