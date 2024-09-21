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

const strategyFB = [0]; // Valor por defecto

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

  // Nuevos estados
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

  // Efecto para obtener los datos cuando cambia el archivo seleccionado
  // 1. Efecto para cargar los datos de la red
  useEffect(() => {
    if (selectedFile) {
      fetchNetworkData(selectedFile);
    }
  }, [selectedFile]);

  // 2. Efecto para cargar los resultados de Modex, condicionado a networkData
  useEffect(() => {
    if (networkData) {
      fetchModexResults(selectedFile); // Ejecuta fetch de Modex solo cuando networkData está cargado
    }
  }, [networkData, selectedFile]);

  // Función para obtener los datos de la red
  const fetchNetworkData = async (fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8080/network?file=${fileName}`);
      const data = await response.json();
      console.log('Datos del network:', data);
      setNetworkData(data);
    } catch (error) {
      console.error('Error al obtener los datos del network:', error);
    }
  };

  // Función para obtener los resultados de Modex
  const fetchModexResults = async (fileName: string) => {
    try {
      // Fetch de PD y V (siempre se ejecutan)
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

      // Condición para ejecutar el fetch de Fuerza Bruta (FB) solo si hay <= 25 agentes
      if (networkData?.agents.length && networkData.agents.length <= 25) {
        const responseFB = await fetch(`http://localhost:8080/modex/fb?file=${fileName}`);
        const dataFB: ModexResult = await responseFB.json();
        setStrategyFBData(dataFB.strategy);
        setFbComputationTime(dataFB.computationTime);
        setFbExtremism(dataFB.extremism);
        setFbEffort(dataFB.effort);
      } else {
        console.log("Fuerza Bruta no se ejecuta para más de 25 agentes.");
      }

    } catch (error) {
      console.error('Error al obtener los resultados de Modex:', error);
    }
  };

  return (
    <ThemeProvider defaultTheme="system" >
      <div>
        <Header subject="Análisis y diseño de algoritmos II" onFileSelect={onFileSelect} selectedFile={selectedFile} />

        <main className="max-w-3xl m-auto rounded-md shadow-2xl overflow-hidden">
          <MainSection sectionTitle="Información general">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2">
                <li>Número de agentes: <span className="italic">{networkData ? networkData.agents.length : 'n'}</span></li>
                <li>Recursos totales: <span className="italic">{networkData ? networkData.resources : 'R_max'}</span></li>
                <li>Extremismo de la red: <span className="italic">{networkData?.extremism.toFixed(2) ?? 'Ext'}</span></li>
                <li>Esfuerzo total de moderación: <span className="italic">{networkData?.effort.toFixed(2) ?? 'Esf'}</span></li>
              </ul>

              <div className="max-w-sm overflow-y-scroll ring-1 ring-[#D9D9D9] ring-opacity-30 relative max-h-72 flow-root agents-table">
                <Table>
                  <TableHeader className='sticky top-0 bg-[#D9D9D9] bg-opacity-20 backdrop-blur backdrop-filter'>
                    <TableRow>
                      <TableHead>Agente</TableHead>
                      <TableHead>Opinión</TableHead>
                      <TableHead>Receptividad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='max-h-2'>
                    {networkData && networkData.agents.map((agent: Agent, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index}</TableCell>
                        <TableCell>{agent.opinion}</TableCell>
                        <TableCell>{agent.receptivity.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <SubSection subTitle="Comparación de soluciones">
                  <CustomRadarChart chartData={[
                    { category: "Tiempo", ModexFB: fbComputationTime, ModexPD: PDComputationTime, ModexV: strategyVComputationTime},
                    { category: "Extremismo", ModexFB: fbExtremism,  ModexPD: PDExtremism, ModexV: strategyVExtremism},
                    { category: "Esfuerzo", ModexFB: fbEffort,  ModexPD: PDEffort, ModexV: strategyVEffort},
                  ]}
                  chartConfig = {
                  {
                    ModexFB: {
                      label: "ModexFB",
                      color: "#FF6B6B",
                    },
                    ModexPD: {
                      label: "ModexPD",
                      color: "#FFA500",
                    },
                    ModexV: {
                      label: "ModexV",
                      color: "#9B59B6",
                    } 
                  }satisfies ChartConfig}/>
              </SubSection>
              <SubSection subTitle="Diferencias de estrategias">
                <ul className="list-none list-inside space-y-2">
                  <li>ModexFB vs ModexPD: <span className="italic">α</span></li>
                  <li>ModexFB vs ModexV : <span className="italic">β</span></li>
                  <li>ModexPD vs ModexV: <span className="italic">γ</span></li>
                </ul>
              </SubSection>
            </div>
          </MainSection>
          {networkData?.agents.length <= 25 ? (
          <MainSection sectionTitle="Fuerza Bruta">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2">
                <li>Tiempo de cómputo: <span className="italic">{fbComputationTime !== null ? `${fbComputationTime.toFixed(4)} s` : 't'}</span></li>
                <li>Extremismo óptimo: <span className="italic">{fbExtremism !== null ? fbExtremism.toFixed(3) : 'Ext'}</span></li>
                <li>Esfuerzo empleado: <span className="italic">{fbEffort !== null ? fbEffort.toFixed(3) : 'Esf'}</span></li>
              </ul>
              <SubSection subTitle="Estrategia fuerza bruta">
                <Matrix title="" strategy={strategyFBData.length > 0 ? strategyFBData : strategyFB} />
              </SubSection>
              <SubSection subTitle="Comparación con datos iniciales">
                  <CustomBarChart chartData={[
                    { property: "Extremismo", original: networkData?.extremism, modex: fbExtremism },
                    { property: "Esfuerzo empleado", original: networkData?.effort, modex: fbEffort },
                  ]
                }
                chartConfig={
                  {
                    original: {
                      label: "Original",
                      color: "#00A29C",
                    },
                    modex: {
                      label: "ModexFB",
                      color: "#5DC9E2",
                    },
                  } satisfies ChartConfig
                  }/>
              </SubSection>
            </div>
          </MainSection>) : null}

          <MainSection sectionTitle="Programación dinámica">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2">
                <li>Tiempo de cómputo: <span className="italic">{PDComputationTime !== null ? `${PDComputationTime.toFixed(4)} s` : 't'}</span></li>
                <li>Extremismo óptimo: <span className="italic">{PDExtremism !== null ? PDExtremism.toFixed(3) : 'Ext'}</span></li>
                <li>Esfuerzo empleado: <span className="italic">{PDEffort !== null ? PDEffort.toFixed(3) : 'Esf'}</span></li>
              </ul>
              <SubSection subTitle="Estrategia programación dinámica">
                <Matrix title="" strategy={strategyPDData.length > 0 ? strategyPDData : strategyPDData} />
              </SubSection>
              <SubSection subTitle="Comparación con datos iniciales">
                  <CustomBarChart chartData={[
                    { property: "Extremismo", original: networkData?.extremism, modex: PDExtremism },
                    { property: "Esfuerzo empleado", original: networkData?.effort, modex: PDEffort },
                  ]
                }
                chartConfig={
                  {
                    original: {
                      label: "Original",
                      color: "#00A29C",
                    },
                    modex: {
                      label: "ModexPD",
                      color: "#5DC9E2",
                    },
                  } satisfies ChartConfig
                  }/>
              </SubSection>
            </div>
          </MainSection>

          <MainSection sectionTitle="Estrategia voraz">
            <div className="flex flex-col gap-4">
              <ul className="list-none list-inside space-y-2">
                <li>Tiempo de cómputo: <span className="italic">{strategyVComputationTime !== null ? `${strategyVComputationTime.toFixed(4)} s` : 't'}</span></li>
                <li>Extremismo óptimo: <span className="italic">{strategyVExtremism !== null ? strategyVExtremism.toFixed(3) : 'Ext'}</span></li>
                <li>Esfuerzo empleado: <span className="italic">{strategyVEffort !== null ? strategyVEffort.toFixed(3) : 'Esf'}</span></li>
              </ul>
              <SubSection subTitle="Estrategia voraz">
                <Matrix title="" strategy={strategyVData.length > 0 ? strategyVData : strategyVData} />
              </SubSection>
              <SubSection subTitle="Comparación con datos iniciales">
                  <CustomBarChart chartData={[
                    { property: "Extremismo", original: networkData?.extremism, modex: strategyVExtremism},
                    { property: "Esfuerzo empleado", original: networkData?.effort, modex: strategyVEffort},
                  ]
                } 
                chartConfig={
                  {
                    original: {
                      label: "Original",
                      color: "#00A29C",
                    },
                    modex: {
                      label: "ModexV",
                      color: "#5DC9E2",
                    },
                  } satisfies ChartConfig
                }/>
              </SubSection>
            </div>
          </MainSection>

        </main>
        <footer className='max-w-3xl mx-auto my-20'>
        <div className="mt-8 md:order-1 md:mt-0 ">
          <p className="text-left text-xs leading-5 ">&copy; 09/20/2024 Grupo 1: Juan Camilo Narváez Tascón, Julián Ernesto Puyo, Cristian David Pacheco, Juan Sebastian Molina</p>
        </div>

        </footer>
      </div>

    </ThemeProvider>
  );
}

export default App;

