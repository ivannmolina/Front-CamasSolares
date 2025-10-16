import MovementsPage from "../features/movements/pages/MovementsPage"

export default function App() {
  return (
    <div className="container">
      <div className="hstack" style={{justifyContent:'space-between', marginBottom:12}}>
        <h2 style={{margin:0}}>Camas Solares</h2>
        <div className="hstack caption">Hola Jorge</div>
      </div>
      <MovementsPage/>
    </div>
  )
}
