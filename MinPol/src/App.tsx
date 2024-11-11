import { useState, useEffect } from 'react';
import './App.css'
import DropzoneFileLoader from './Uploader.jsx'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './components/Selector'
import Resultados from './Resultados';

function App() {

    const currentYear = new Date().getFullYear();
    const [solver, setSolver] = useState<string>("gecode");
    const [results, setResults] = useState<string[]>([]);
    const [selectedResult, setSelectedResult] = useState<string | null>(null);

    // Fetch existing results when the component mounts
    useEffect(() => {
        fetch('http://localhost:3000/results')
            .then(response => response.json())
            .then(data => {
                const fileNames = Object.keys(data);
                setResults(fileNames);
            })
            .catch(error => {
                console.error('Error fetching results data:', error);
            });
    }, []);

    const onFileResponse = (response: any) => {
        console.log("Respuesta del servidor:", response);
        const { fileName } = response;
        if (fileName) {
            setResults((prevResults) => {
                const newResults = [...prevResults, fileName];
                console.log("Nuevo estado de results:", newResults);
                return newResults;
            });
        }
    }

    return (
        <>
            <div className='flex justify-center'>
                <img src="logo.png" className="logo" alt="Vite logo" />
            </div>
            <h1 className='my-4'>MinPol</h1>

            <DropzoneFileLoader solver={solver} onFileResponse={onFileResponse} />

            <div className='flex flex-col justify-center w-fit m-auto'>
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
            {results.length > 0 && (
                <div className='m-auto w-fit my-4'>
                    <Select
                        onValueChange={(e: string) => {
                            setSelectedResult(e);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a result" />
                        </SelectTrigger>
                        <SelectContent>
                            {results.map((result, index) => (
                                <SelectItem key={index} value={result}>
                                    {result}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {selectedResult && <Resultados selectedResult={selectedResult} />}

            <p className="read-the-docs mt-8">
                © {currentYear} Grupo I; Ada 2; Ingeniería en sistemas; EISC; Todos los derechos reservados.
            </p>
        </>
    );
}

export default App;
