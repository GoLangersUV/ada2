import './output.css'
import DropzoneFileLoader from './Uploader.jsx'

function App() {

  const currentYear = new Date().getFullYear();

  return (
    <>
      <div>
          <img src="/logo.png" className="logo" alt="Vite logo" />
      </div>
      <h1>MinPol</h1>
      <DropzoneFileLoader />
      <div className="card">
      </div>
      <p className="read-the-docs">
      <p>© {currentYear} Grupo 2; Ada 2; Ingenieria es sistemas. Todos los derechos reservados.</p>
      </p>
    </>
  )
}

export default App
