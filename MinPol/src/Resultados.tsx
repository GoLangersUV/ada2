import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";

interface ResultadosProps {
    selectedResult: string | null;
}

interface ResultData {
    timestamp: string;
    result: string;
    isError: boolean;
    inputFile: string;
}

const Resultados: React.FC<ResultadosProps> = ({ selectedResult }) => {
    const [resultsData, setResultsData] = useState<{ [key: string]: ResultData }>({});
    const [parsedData, setParsedData] = useState<any>(null);

    useEffect(() => {
        // Fetch results data from the backend
        fetch('http://localhost:3000/results')
            .then(response => response.json())
            .then(data => {
                setResultsData(data);
            })
            .catch(error => {
                console.error('Error fetching results data:', error);
            });
    }, []);

    useEffect(() => {
        if (selectedResult && resultsData[selectedResult]) {
            const resultString = resultsData[selectedResult].result;
            const parsed = parseResultString(resultString);
            console.log('Parsed data:', parsed); // Agregar log para depuración
            setParsedData(parsed);
        }
    }, [selectedResult, resultsData]);

    const parseResultString = (resultString: string) => {
        console.log('Parsing result string:', resultString); // Agregar log para depuración
        const lines = resultString.split(/\r?\n/);
        const data: any = {
            values: [], // Inicializar values como arreglo vacío
            movements: [],
            finalDistributionTable: []
        };
        let parsingMovements = false;
        let parsingFinalDistributionTable = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('Polarization =')) {
                data.polarization = parseFloat(line.split('=')[1].trim());
            } else if (line.startsWith('Median =')) {
                data.median = parseFloat(line.split('=')[1].trim());
            } else if (line.startsWith('Values =')) {
                const valuesString = line.split('=')[1].trim();
                try {
                    data.values = JSON.parse(valuesString);
                } catch (error) {
                    console.error('Error parsing values:', error);
                    data.values = [];
                }
            } else if (line.startsWith('Initial distribution =')) {
                const initDistString = line.split('=')[1].trim();
                try {
                    data.initialDistribution = JSON.parse(initDistString);
                } catch (error) {
                    console.error('Error parsing initial distribution:', error);
                    data.initialDistribution = [];
                }
            } else if (line.startsWith('Final distribution =')) {
                const finalDistString = line.split('=')[1].trim();
                try {
                    data.finalDistribution = JSON.parse(finalDistString);
                } catch (error) {
                    console.error('Error parsing final distribution:', error);
                    data.finalDistribution = [];
                }
            } else if (line.startsWith('Movements (from -> to : amount, Cost):')) {
                parsingMovements = true;
            } else if (parsingMovements && line.trim() === '') {
                parsingMovements = false;
            } else if (parsingMovements) {
                const movementLine = line.trim();
                const match = movementLine.match(/^(\d+) -> (\d+) : (\d+) , ([\d.]+)/);
                if (match) {
                    data.movements.push({
                        from: match[1],
                        to: match[2],
                        amount: parseInt(match[3]),
                        cost: parseFloat(match[4])
                    });
                }
            } else if (line.startsWith('Final distribution:')) {
                parsingFinalDistributionTable = true;
                // Skip the header lines
                i += 1; 
            } else if (parsingFinalDistributionTable && line.trim() === '') {
                parsingFinalDistributionTable = false;
            } else if (parsingFinalDistributionTable) {
                const parts = line.split('\t');
                if (parts.length >= 4) {
                    data.finalDistributionTable.push({
                        opinion: parseInt(parts[0]),
                        value: parseFloat(parts[1]),
                        population: parseInt(parts[2]),
                        initiallyEmpty: parts[3].replace(/\"/g, '')
                    });
                }
            } else if (line.startsWith('Total cost:')) {
                data.totalCost = parseFloat(line.split(':')[1].trim());
            } else if (line.startsWith('Max cost:')) {
                data.maxCost = parseFloat(line.split(':')[1].trim());
            } else if (line.startsWith('Total movements:')) {
                data.totalMovements = parseInt(line.split(':')[1].trim());
            } else if (line.startsWith('Max mov:')) {
                data.maxMov = parseInt(line.split(':')[1].trim());
            }
        }

        return data;
    };

    if (!selectedResult) {
        return <div>Por favor, selecciona un resultado.</div>;
    }

    if (!parsedData) {
        return <div>Cargando datos del resultado...</div>;
    }

    const chartData = [
        ["From", "To", "Amount", "Cost"],
        ...parsedData.movements.map((move: any) => [move.from, move.to, move.amount, move.cost])
    ];

    return (
        <div>
            <h2>Resultado para {selectedResult}</h2>
            <h2>Polarización: {parsedData.polarization}</h2>
            <p>Mediana: {parsedData.median}</p>
            <p>Valores: {parsedData.values ? parsedData.values.join(', ') : 'No disponible'}</p>
            <p>Distribución inicial: {parsedData.initialDistribution ? parsedData.initialDistribution.join(', ') : 'No disponible'}</p>
            <p>Distribución final: {parsedData.finalDistribution ? parsedData.finalDistribution.join(', ') : 'No disponible'}</p>
            <p>Costo total: {parsedData.totalCost}</p>
            <p>Costo máximo: {parsedData.maxCost}</p>
            <p>Total de movimientos: {parsedData.totalMovements}</p>
            <p>Movimiento máximo: {parsedData.maxMov}</p>

            <h3>Movimientos</h3>
            <table className="centered-table">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Partial Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {parsedData.movements.map((move: any, index: number) => (
                        <tr key={index}>
                            <td>{move.from}</td>
                            <td>{move.to}</td>
                            <td>{move.amount}</td>
                            <td>{move.cost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 className="seccion-subtitulo">Final distribution</h3>
            <table className="centered-table">
                <thead>
                    <tr>
                        <th>Opinion</th>
                        <th>Value</th>
                        <th>Population</th>
                        <th>Initially empty?</th>
                    </tr>
                </thead>
                <tbody>
                    {parsedData.finalDistributionTable.map((item: any, index: number) => (
                        <tr key={index}>
                            <td>{item.opinion}</td>
                            <td>{item.value}</td>
                            <td>{item.population}</td>
                            <td>{item.initiallyEmpty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Visualización de Movimientos</h3>
            <Chart
                chartType="Sankey"
                width="100%"
                height="300px"
                data={chartData}
            />
        </div>
    );
};

export default Resultados;
