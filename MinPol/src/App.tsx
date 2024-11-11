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
import { Chart } from "react-google-charts";

function App() {

	const currentYear = new Date().getFullYear();
	const [solver, setSolver] = useState<string>("gecode");
	const [results, setResults] = useState<string[]>([]);
	const [selectedResult, setSelectedResult] = useState<string | null>(null);
	const data = [
		["From", "To", "Weight"],
		["A", "X", 5],
		["A", "Y", 7],
		["A", "Z", 6],
		["B", "X", 2],
		["B", "Y", 9],
		["B", "Z", 4],
	  ];
	const options = {};
	const onFileResponse = (response: any) => {
		for (const key in response) {
			if (response[key].fileName) setResults([...results, response[key].fileName]);
		}
	}

	return (
		<>
			<div className='flex justify-center'>
				<img src="logo.png" className="logo" alt="Vite logo" />
			</div>
			<h1 className='my-4'>MinPol</h1>
			{results.length > 0 &&
				<div className='m-auto w-fit my-4'>
					<Select
						onValueChange={(e: string) => {
							// Modify the state of the Sankey Component
							setSelectedResult(e);
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select a results" />
						</SelectTrigger>
						<SelectContent>
							{
								results.map((result, index) =>
									<SelectItem key={index} value={result}>{result}</SelectItem>
								)
							}
						</SelectContent>
					</Select>
				</div>}
			<DropzoneFileLoader solver={solver} onFileResponse={onFileResponse} />
			<div className="card">
			</div>
			<div className='flex flex-col justify-center w-fit m-auto'>
				{/* <p>Selecciona solver</p> */}
				<Select
					onValueChange={(e: string) => {
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
			<Chart
			chartType="Sankey"
			width="100%"
			height="100%"
			data={data}
			options={options}
			/>
			<p className="read-the-docs mt-8">
				<p>© {currentYear} Grupo I; Ada 2; Ingeniería en sistemas; EISC; Todos los derechos reservados.</p>
			</p>
		</>
	)
}

export default App
