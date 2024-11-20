// App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import DropzoneFileLoader from './Uploader.jsx';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './components/Selector';
import Resultados from './Resultados';

interface ResultItem {
    fileName: string;
    inputFile: string;
}

interface FileResponse {
    success: boolean;
    message: string;
    payload: {
        fileName: string;
        inputFile: string;
    };
}

function App() {

    const currentYear = new Date().getFullYear();
    const [solver, _] = useState<string>("gecode");
    const [results, setResults] = useState<ResultItem[]>([]);
    const [selectedResult, setSelectedResult] = useState<string | null>(null);

    // Fetch existing results when the component mounts
    useEffect(() => {
        fetch('http://localhost:3000/results')
            .then(response => response.json())
            .then((data: Record<string, any>) => {
                const resultItems: ResultItem[] = Object.entries(data).map(([fileName, item]: [string, any]) => ({
                    fileName,
                    inputFile: item.inputFile
                }));
                setResults(resultItems);
            })
            .catch(error => {
                console.error('Error fetching results data:', error);
            });
    }, []);


    const onFileResponse = (response: FileResponse) => {
        console.log("Respuesta del servidor:", response);
        const { payload } = response;

        if (payload && payload.fileName && payload.inputFile) {
            setResults((prevResults) => {
                const exists = prevResults.some(item => item.fileName === payload.fileName);
                if (!exists) {
                    const newResult: ResultItem = {
                        fileName: payload.fileName,
                        inputFile: payload.inputFile
                    };
                    const newResults = [...prevResults, newResult];
                    console.log("Nuevo estado de results:", newResults);
                    return newResults;
                }
                console.log("El archivo ya existe en los resultados.");
                return prevResults;
            });
            setSelectedResult(payload.fileName); // Seleccionar automáticamente el nuevo archivo
        } else {
            console.error("Respuesta inválida del servidor:", response);
        }
    }

    const selectedName = selectedResult 
        ? results.find(result => result.fileName === selectedResult)?.inputFile ?? null
        : null;

    return (
        <>
            <div className='flex justify-center'>
                <img src="logo.png" className="logo" alt="Vite logo" />
            </div>
            <h1 className='my-4'>MinPol</h1>

            <DropzoneFileLoader solver={solver} onFileResponse={onFileResponse} />

            <h3 className='my-4'>Please select a result in the select below</h3>
            {results.length > 0 && (
                <div className='m-auto w-fit my-4'>
                    <Select
                        onValueChange={(selectedFileName: string) => {
                            setSelectedResult(selectedFileName);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a result" />
                        </SelectTrigger>
                        <SelectContent>
                            {results.map((result) => (
                                <SelectItem key={result.fileName} value={result.fileName}>
                                    {result.inputFile}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {selectedResult && (
                <Resultados 
                    selectedResult={selectedResult} 
                    name={selectedName} 
                />
            )}

            <p className="read-the-docs mt-8">
                © {currentYear} Grupo I; Ada 2; Ingeniería en sistemas; EISC; Todos los derechos reservados.
            </p>
        </>
    );

}

export default App;
