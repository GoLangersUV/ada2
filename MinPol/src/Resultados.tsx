// Resultados.tsx
import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import './App.css'; // Asegúrate de que el CSS esté importado correctamente

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
            console.log('Parsed data:', parsed); // Log para depuración
            setParsedData(parsed);
        }
    }, [selectedResult, resultsData]);

    const parseResultString = (resultString: string) => {
        console.log('Parsing result string:', resultString); // Log para depuración
        const lines = resultString.split(/\r?\n/);
        const data: any = {
            polarization: 0,
            population: 0,
            median: 0,
            values: [],
            initialDistribution: [],
            finalDistribution: [],
            movements: [],
            finalDistributionTable: [],
            totalCost: 0,
            maxCost: 0,
            totalMovements: 0,
            maxMov: 0
        };
        let parsingMovements = false;
        let parsingFinalDistributionTable = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim(); // Eliminar espacios en blanco al inicio y al final

            if (line.startsWith('Polarization =')) {
                data.polarization = parseFloat(line.split('=')[1].trim());
            } else if (line.startsWith('Population =')) {
                data.population = parseFloat(line.split('=')[1].trim());
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
            } else if (line.startsWith('Final distribution:')) {
                parsingFinalDistributionTable = true;
                // Saltar la línea de encabezado
                i += 1; // Saltar una línea (encabezado)
                continue; // Saltar al siguiente ciclo para evitar procesar la línea de encabezado
            } else if (parsingFinalDistributionTable && line === '') {
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
            } else if (line.startsWith('Movements (from -> to : amount, Cost):')) {
                parsingMovements = true;
            } else if (parsingMovements && line === '') {
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

        console.log('Final Distribution Table:', data.finalDistributionTable); // Log adicional
        console.log('Initial Distribution:', data.initialDistribution); // Log adicional
        console.log('Final Distribution:', data.finalDistribution); // Log adicional
        return data;
    };

    if (!selectedResult) {
        return <div>Por favor, selecciona un resultado.</div>;
    }

    if (!parsedData) {
        return <div>Cargando datos del resultado...</div>;
    }

    // Preparar los datos para la gráfica de comparación
    const comparisonChartData = [
        ["Value", "Initial population", "Final population"],
        ...parsedData.finalDistributionTable.map((item: any) => [
            item.value.toString(),
            parsedData.initialDistribution[item.opinion - 1] || 0, 
            item.population || 0,
        ]),
    ];

    // Opciones de la gráfica
    const comparisonChartOptions = {
        title: "Population (Initial vs Final)",
        hAxis: {
            title: "Value",
            titleTextStyle: { color: "#333" },
        },
        vAxis: {
            title: "Population",
            minValue: 0,
        },
        legend: { position: "bottom" },
        chartArea: { width: "70%", height: "70%" },
        colors: ["#1b9e77", "#d95f02"], 
    };

    const sankeyChartData = [
        ["From", "To", "Amount", "Cost"],
        ...parsedData.movements.map((move: any) => [move.from, move.to, move.amount, move.cost]),
    ];

    return (
        <div>
            <h2 className="resultado-titulo">Results for: {selectedResult}</h2>
            <h2 className="resultado-titulo">Polarization: {parsedData.polarization}</h2>
            <p className="texto-parrafo">Population: {parsedData.population}</p>
            <p className="texto-parrafo">Median: {parsedData.median}</p>
            <p className="texto-parrafo">
                Total cost: {parsedData.totalCost} {parsedData.totalCost < parsedData.maxCost && <span role="img" aria-label="checkmark">✔️</span>}
            </p>
            <p className="texto-parrafo">Max cost: {parsedData.maxCost}</p>
            <p className="texto-parrafo">
                Total movements: {parsedData.totalMovements} {parsedData.totalMovements < parsedData.maxMov && <span role="img" aria-label="checkmark">✔️</span>}
            </p>
            <p className="texto-parrafo">Max movement: {parsedData.maxMov}</p>

            <h3 className="seccion-subtitulo">Movements Visualizer</h3>
            <div className="chart-container">
                <Chart
                    chartType="Sankey"
                    width="100%"
                    height="300px"
                    data={sankeyChartData}
                />
            </div>

            {/* Gráfica de Comparación Population vs Value */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="300px"
                    data={comparisonChartData}
                    options={comparisonChartOptions}
                />
            </div>

            <h3 className="seccion-subtitulo">Movements</h3>
            <table className="centered-table">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Population</th>
                        <th>Cost</th>
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
                        <th>Initially Empty?</th>
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
        </div>
    );

};

export default Resultados;
