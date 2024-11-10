import { useState } from 'react';
import './App.css'
import DropzoneFileLoader from './Uploader.jsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './components/Selector'

function App() {

	const currentYear = new Date().getFullYear();
	const [solver, setSolver] = useState<string>("gecode");

	return (
		<>
			<div className='flex justify-center'>
				<img src="/logo.png" className="logo" alt="Vite logo" />
			</div>
			<h1 className='my-4'>MinPol</h1>
			<DropzoneFileLoader  solver={solver}/>
			<div className="card">
			</div>
			<div className='flex flex-col justify-center w-fit m-auto'>
				{/* <p>Selecciona solver</p> */}
				<Select
					onValueChange={(e) => {
						setSolver(e);
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Solver" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Gecode">Gecode</SelectItem>
						<SelectItem value="Chuffed">Chuffed</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<p className="read-the-docs mt-8">
				<p>© {currentYear} Grupo 2; Ada 2; Ingenieria es sistemas. Todos los derechos reservados.</p>
			</p>
		</>
	)
}

export default App
