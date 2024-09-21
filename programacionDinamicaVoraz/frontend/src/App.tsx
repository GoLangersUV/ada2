/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/app.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/19/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
import { useState, useEffect } from 'react';
import './App.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";
import type { ChartConfig } from "@/components/ui/chart"
import MainSection from "@/components/MainSection";
import CustomBarChart from "@/components/BarChart";
import CustomRadarChart from "@/components/RadarChart";
import SubSection from "@/components/SubSection";
import Matrix from "@/components/Matrix";
import { ThemeProvider } from "@/components/theme-provider";

const strategyFB = [0];

interface Agent {
  opinion: number;
  receptivity: number;
}

interface NetworkData {
  agents: Agent[];
  resources: number;
  extremism: number;
  effort: number;
}

interface ModexResult {
  strategy: number[];
  effort: number;
  extremism: number;
  computationTime: number;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);

  const [fbComputationTime, setFbComputationTime] = useState<number | null>(null);
  const [fbExtremism, setFbExtremism] = useState<number | null>(null);
  const [fbEffort, setFbEffort] = useState<number | null>(null);
  const [strategyFBData, setStrategyFBData] = useState<number[]>([]);

  const [PDComputationTime, setPDComputationTime] = useState<number | null>(null);
  const [PDExtremism, setPDExtremism] = useState<number | null>(null);
  const [PDEffort, setPDEffort] = useState<number | null>(null);
  const [strategyPDData, setStrategyPDData] = useState<number[]>([]);

  const [strategyVComputationTime, setStrategyVComputationTime] = useState<number | null>(null);
  const [strategyVExtremism, setStrategyVExtremism] = useState<number | null>(null);
  const [strategyVEffort, setStrategyVEffort] = useState<number | null>(null);
  const [strategyVData, setStrategyVData] = useState<number[]>([]);

  const onFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  useEffect(() => {
    if (selectedFile) {
      fetchNetworkData(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (networkData) {
      fetchModexResults(selectedFile);
    }
  }, [networkData, selectedFile]);

  const fetchNetworkData = async (fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8080/network?file=${fileName}`);
      const data = await response.json();
      setNetworkData(data);
    } catch (error) {
      console.error('Error al obtener los datos del network:', error);
    }
  };

  const fetchModexResults = async (fileName: string) => {
    try {
      const responsePD = await fetch(`http://localhost:8080/modex/pd?file=${fileName}`);
      const dataPD: ModexResult = await responsePD.json();
      setPDComputationTime(dataPD.computationTime);
      setPDExtremism(dataPD.extremism);
      setPDEffort(dataPD.effort);
      setStrategyPDData(dataPD.strategy);

      const responseV = await fetch(`http://localhost:8080/modex/v?file=${fileName}`);
      const dataV: ModexResult = await responseV.json();
      setStrategyVComputationTime(dataV.computationTime);
      setStrategyVExtremism(dataV.extremism);
      setStrategyVEffort(dataV.effort);
      setStrategyVData(dataV.strategy);

      if (networkData?.agents.length && networkData.agents.length <= 25) {
        const responseFB = await fetch(`http://localhost:8080/modex/fb?file=${fileName}`);
        const dataFB: ModexResult = await responseFB.json();
        setStrategyFBData(dataFB.strategy);
        setFbComputationTime(dataFB.computationTime);
        setFbExtremism(dataFB.extremism);
        setFbEffort(dataFB.effort);
      } else {
        console.log("Fuerza Bruta no se ejecuta para más de 25 agentes.");
        // Limpia los datos de ModexFB si no se deben calcular
        setStrategyFBData([]);
        setFbComputationTime(null);
        setFbExtremism(null);
        setFbEffort(null);
      }
    } catch (error) {
      console.error('Error al obtener los resultados de Modex:', error);
    }
  };

  return (
    <ThemeProvider defaultTheme="system" >
      <div className='min-h-screen'>
        <Header subject="Análisis y diseño de algoritmos II" onFileSelect={onFileSelect} selectedFile={selectedFile} />

        {selectedFile && networkData ? (
        <main className="max-w-3xl m-auto rounded-md shadow-2xl overflow-hidden">
          <MainSection sectionTitle="Información general">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2 properties-list">
                <li>Número de agentes: <span className="property-value">{networkData ? networkData.agents.length : 'n'}</span></li>
                <li>Recursos totales: <span className="property-value">{networkData ? networkData.resources : 'R_max'}</span></li>
                <li>Extremismo de la red: <span className="property-value">{networkData?.extremism.toFixed(2) ?? 'Ext'}</span></li>
                <li>Esfuerzo total de moderación: <span className="property-value">{networkData?.effort.toFixed(2) ?? 'Esf'}</span></li>
              </ul>

              <div className="max-w-sm overflow-y-scroll ring-1 ring-[#D9D9D9] ring-opacity-30 relative max-h-72 flow-root agents-table">
                <Table>
                  <TableHeader className='sticky top-0 bg-[#D9D9D9] bg-opacity-20 backdrop-blur backdrop-filter font-sans'>
                    <TableRow>
                      <TableHead>Agente</TableHead>
                      <TableHead>Opinión</TableHead>
                      <TableHead>Receptividad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='max-h-2'>
                    {networkData && networkData.agents.map((agent: Agent, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index+1}</TableCell>
                        <TableCell>{agent.opinion}</TableCell>
                        <TableCell>{agent.receptivity.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <SubSection subTitle="Comparación de soluciones">
                <CustomRadarChart
                  chartData={[
                    { 
                      category: "Tiempo", 
                      ModexPD: PDComputationTime ?? undefined, 
                      ModexV: strategyVComputationTime ?? undefined, 
                      ...(networkData?.agents.length <= 25 && { ModexFB: fbComputationTime ?? undefined })
                    },
                    { 
                      category: "Extremismo", 
                      ModexPD: PDExtremism ?? undefined, 
                      ModexV: strategyVExtremism ?? undefined, 
                      ...(networkData?.agents.length <= 25 && { ModexFB: fbExtremism ?? undefined })
                    },
                    { 
                      category: "Esfuerzo", 
                      ModexPD: PDEffort ?? undefined, 
                      ModexV: strategyVEffort ?? undefined, 
                      ...(networkData?.agents.length <= 25 && { ModexFB: fbEffort ?? undefined })
                    },
                  ]}
                  chartConfig={{
                    ...(networkData?.agents.length <= 25 && {
                      ModexFB: {
                        label: "ModexFB",
                        color: "#FF6B6B",
                      },
                    }),
                    ModexPD: {
                      label: "ModexPD",
                      color: "#FFA500",
                    },
                    ModexV: {
                      label: "ModexV",
                      color: "#9B59B6",
                    },
                  }}
                />
              </SubSection>
              <SubSection subTitle="Diferencias de estrategias">
                <ul className="list-none list-inside space-y-2 properties-list">
                  <li>ModexFB vs ModexPD: <span className="property-value">α</span></li>
                  <li>ModexFB vs ModexV : <span className="property-value">β</span></li>
                  <li>ModexPD vs ModexV: <span className="property-value">γ</span></li>
                </ul>
              </SubSection>
            </div>
          </MainSection>
          {networkData?.agents.length <= 25 ? (

          <MainSection sectionTitle="Fuerza Bruta">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2 properties-list">
                <li>Tiempo de cómputo: <span className="property-value">{fbComputationTime !== null ? `${fbComputationTime.toFixed(4)} s` : 't'}</span></li>
                <li>Extremismo óptimo: <span className="property-value">{fbExtremism !== null ? fbExtremism.toFixed(3) : 'Ext'}</span></li>
                <li>Esfuerzo empleado: <span className="property-value">{fbEffort !== null ? fbEffort.toFixed(3) : 'Esf'}</span></li>
              </ul>
              <SubSection subTitle="Estrategia fuerza bruta">
                <Matrix title="" strategy={strategyFBData.length > 0 ? strategyFBData : strategyFB} agents={networkData?.agents} />
              </SubSection>
              <SubSection subTitle="Comparación con datos iniciales">
                <CustomBarChart
                  chartData={[
                    { 
                      property: "Extremismo", 
                      original: networkData?.extremism ?? 0,
                      modex: fbExtremism ?? 0
                    },
                    { 
                      property: "Esfuerzo empleado", 
                      original: networkData?.effort ?? 0,
                      modex: fbEffort ?? 0
                    },
                  ]}
                  chartConfig={{
                    original: {
                      label: "Original",
                      color: "#00A29C",
                    },
                    modex: {
                      label: "ModexFB",
                      color: "#FF6B6B",
                    },
                  } satisfies ChartConfig}
                />
              </SubSection>
            </div>
          </MainSection>) : null}

          <MainSection sectionTitle="Programación dinámica">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2 properties-list">
                <li>Tiempo de cómputo: <span className="property-value">{PDComputationTime !== null ? `${PDComputationTime.toFixed(4)} s` : 't'}</span></li>
                <li>Extremismo óptimo: <span className="property-value">{PDExtremism !== null ? PDExtremism.toFixed(3) : 'Ext'}</span></li>
                <li>Esfuerzo empleado: <span className="property-value">{PDEffort !== null ? PDEffort.toFixed(3) : 'Esf'}</span></li>
              </ul>
              <SubSection subTitle="Estrategia programación dinámica">
                <Matrix title="" strategy={strategyPDData.length > 0 ? strategyPDData : strategyPDData} agents={networkData?.agents} />
              </SubSection>
              <SubSection subTitle="Comparación con datos iniciales">
                <CustomBarChart
                  chartData={[
                    { 
                      property: "Extremismo", 
                      original: networkData?.extremism ?? 0,
                      modex: PDExtremism ?? 0 
                    },
                    { 
                      property: "Esfuerzo empleado", 
                      original: networkData?.effort ?? 0,
                      modex: PDEffort ?? 0
                    },
                  ]}
                  chartConfig={{
                    original: {
                      label: "Original",
                      color: "#00A29C",
                    },
                    modex: {
                      label: "ModexPD",
                      color: "#FFA500",
                    },
                  } satisfies ChartConfig}
                />
              </SubSection>
            </div>
          </MainSection>
          <MainSection sectionTitle="Estrategia voraz">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2 properties-list">
                <li>Tiempo de cómputo: <span className="property-value">{strategyVComputationTime !== null ? `${strategyVComputationTime.toFixed(4)} s` : 't'}</span></li>
                <li>Extremismo calculado: <span className="property-value">{strategyVExtremism !== null ? strategyVExtremism.toFixed(3) : 'Ext'}</span></li>
                <li>Esfuerzo empleado: <span className="property-value">{strategyVEffort !== null ? strategyVEffort.toFixed(3) : 'Esf'}</span></li>
              </ul>
              <SubSection subTitle="Estrategia voraz">
                <Matrix title="" strategy={strategyVData.length > 0 ? strategyVData : strategyVData} agents={networkData?.agents} />
              </SubSection>
            </div>
            <SubSection subTitle="Comparación con datos iniciales">
              <CustomBarChart
                chartData={[
                  { 
                    property: "Extremismo", 
                    original: networkData?.extremism ?? 0, // Evitar null o undefined
                    modex: strategyVExtremism ?? 0 // Evitar null o undefined
                  },
                  { 
                    property: "Esfuerzo empleado", 
                    original: networkData?.effort ?? 0, // Evitar null o undefined
                    modex: strategyVEffort ?? 0 // Evitar null o undefined
                  },
                ]}
                chartConfig={{
                  original: {
                    label: "Original",
                    color: "#00A29C",
                  },
                  modex: {
                    label: "ModexV",
                    color: "#9B59B6",
                  },
                } satisfies ChartConfig}
              />
            </SubSection>
          </MainSection>
        </main>
        ) : (
          <div className="flex justify-center items-center h-64">
          </div>
        )}
        <footer className='w-full my-20 text-[#CECECE] bottom-0'>
          <div className="mt-8 md:order-1 md:mt-0 max-w-3xl m-auto px-4">
            <p className="text-left text-xs leading-5 ">&copy; 2024-II Grupo 1: Juan Camilo Narváez Tascón, Julián Ernesto Puyo, Cristian David Pacheco, Juan Sebastian Molina</p>
            <p className="text-left text-xs leading-5 "><a target='_blank' href="https://github.com/Krud3/ada2/tree/main">Repositorio</a></p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
