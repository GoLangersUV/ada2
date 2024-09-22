/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/app.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/19/2024
 * Last modification: 09/22/2024
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
import Section from "@/components/Section";
import CustomBarChart from "@/components/BarChart";
import CustomRadarChart from "@/components/RadarChart";
import SubSection from "@/components/SubSection";
import Matrix from "@/components/Matrix";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from '@/components/Footer';

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

interface StrategyDifferences {
  fbVsPd: number | null;
  fbVsV: number | null;
  pdVsV: number | null;
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

  const [strategyDifferences, setStrategyDifferences] = useState<StrategyDifferences>({
    fbVsPd: null,
    fbVsV: null,
    pdVsV: null
  });

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
      if (!response.ok) {
        throw new Error(`Error al obtener Network: ${response.statusText}`);
      }
      const data: NetworkData = await response.json();
      setNetworkData(data);
    } catch (error) {
      console.error('Error al obtener los datos del network:', error);
    }
  };

  const fetchModexResults = async (fileName: string) => {
    try {
      if (networkData?.agents.length && networkData.agents.length <= 2500) {
        const responsePD = await fetch(`http://localhost:8080/modex/pd?file=${fileName}`);
        if (!responsePD.ok) {
          throw new Error(`Error al obtener ModexPD: ${responsePD.statusText}`);
        }
        const dataPD: ModexResult = await responsePD.json();
        setPDComputationTime(dataPD.computationTime);
        setPDExtremism(dataPD.extremism);
        setPDEffort(dataPD.effort);
        setStrategyPDData(dataPD.strategy);
      } else {
        console.log("Programación Dinámica no se ejecuta para más de 2500 agentes.");
        setPDComputationTime(null);
        setPDExtremism(null);
        setPDEffort(null);
        setStrategyPDData([]);
      }

      const responseV = await fetch(`http://localhost:8080/modex/v?file=${fileName}`);
      if (!responseV.ok) {
        throw new Error(`Error al obtener ModexV: ${responseV.statusText}`);
      }
      const dataV: ModexResult = await responseV.json();
      setStrategyVComputationTime(dataV.computationTime);
      setStrategyVExtremism(dataV.extremism);
      setStrategyVEffort(dataV.effort);
      setStrategyVData(dataV.strategy);

      if (networkData?.agents.length && networkData.agents.length <= 25) {
        const responseFB = await fetch(`http://localhost:8080/modex/fb?file=${fileName}`);
        if (!responseFB.ok) {
          throw new Error(`Error al obtener ModexFB: ${responseFB.statusText}`);
        }
        const dataFB: ModexResult = await responseFB.json();
        setStrategyFBData(dataFB.strategy);
        setFbComputationTime(dataFB.computationTime);
        setFbExtremism(dataFB.extremism);
        setFbEffort(dataFB.effort);
      } else {
        console.log("Fuerza Bruta no se ejecuta para más de 25 agentes.");
        setStrategyFBData([]);
        setFbComputationTime(null);
        setFbExtremism(null);
        setFbEffort(null);
      }
    } catch (error) {
      console.error('Error al obtener los resultados de Modex:', error);
    }
  };

  const calculateHammingDistance = (arr1: number[], arr2: number[]): number => {
    if (arr1.length !== arr2.length) return -1; // Invalid comparison
    return arr1.reduce((acc, val, idx) => acc + (val !== arr2[idx] ? 1 : 0), 0);
  };

  const calculateStrategyDifferences = () => {
    let pdVsV: number | null = null;
    let fbVsPd: number | null = null;
    let fbVsV: number | null = null;

    if (strategyPDData.length > 0 && strategyVData.length > 0) {
      pdVsV = calculateHammingDistance(strategyPDData, strategyVData);
    }

    if (strategyFBData.length > 0 && strategyPDData.length > 0) {
      fbVsPd = calculateHammingDistance(strategyFBData, strategyPDData);
      fbVsV = calculateHammingDistance(strategyFBData, strategyVData);
    }

    setStrategyDifferences({
      fbVsPd: fbVsPd !== -1 ? fbVsPd : null,
      fbVsV: fbVsV !== -1 ? fbVsV : null,
      pdVsV: pdVsV !== -1 ? pdVsV : null
    });
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null) return 'N/A';
    const totalAgents = networkData?.agents.length || 1; // Prevent division by zero
    return `${((value / totalAgents) * 100).toFixed(2)}%`;
  };

  useEffect(() => {
    if (
      (strategyPDData.length > 0 && strategyVData.length > 0) ||
      (strategyPDData.length === 0 && strategyVData.length > 0)
    ) {
      calculateStrategyDifferences();
    }
  }, [strategyFBData, strategyPDData, strategyVData]);

  return (
    <ThemeProvider defaultTheme="system" >
      <div className='min-h-screen'>
        <Header subject="Análisis y diseño de algoritmos II" onFileSelect={onFileSelect} selectedFile={selectedFile} />

        {selectedFile && networkData ? (
        <main className="max-w-3xl m-auto rounded-md shadow-2xl overflow-hidden">
          <Section sectionTitle="Información general">
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
                    ...(networkData?.agents.length <= 2500 && {
                      ModexPD: {
                        label: "ModexPD",
                        color: "#FFA500",
                      },
                    }),
                    ...(networkData?.agents.length <= 25 && {
                      ModexFB: {
                        label: "ModexFB",
                        color: "#FF6B6B",
                      },
                    }),
                    ModexV: {
                      label: "ModexV",
                      color: "#9B59B6",
                    },
                  }}
                />
              </SubSection>
              <SubSection subTitle="Diferencias de estrategias">
                <ul className="list-none list-inside space-y-2 properties-list">
                  {strategyPDData.length > 0 && strategyPDData.length <= 2500 && (
                    <>
                      {strategyFBData.length > 0 && (
                        <>
                          <li>ModexFB vs ModexPD: <span className="property-value">{formatPercentage(strategyDifferences.fbVsPd)}</span></li>
                          <li>ModexFB vs ModexV: <span className="property-value">{formatPercentage(strategyDifferences.fbVsV)}</span></li>
                        </>
                      )}
                      <li>ModexPD vs ModexV: <span className="property-value">{formatPercentage(strategyDifferences.pdVsV)}</span></li>
                    </>
                  )}
                </ul>
              </SubSection>
            </div>
          </Section>

          {networkData?.agents.length <= 25 && (
          <Section sectionTitle="Fuerza Bruta" output={fbExtremism !== null && fbEffort !== null ? { extremism: fbExtremism, effort: fbEffort, strategy: strategyFBData } : undefined}>
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
          </Section>)}

          {networkData?.agents.length <= 2500 && (
            <Section sectionTitle="Programación dinámica" output={PDExtremism !== null && PDEffort !== null ? { extremism: PDExtremism, effort: PDEffort, strategy: strategyPDData } : undefined}>
              <div className="flex flex-col gap-4">
                <ul className="list-none list-inside space-y-2 properties-list">
                  <li>Tiempo de cómputo: <span className="property-value">{PDComputationTime !== null ? `${PDComputationTime.toFixed(4)} s` : 't'}</span></li>
                  <li>Extremismo óptimo: <span className="property-value">{PDExtremism !== null ? PDExtremism.toFixed(3) : 'Ext'}</span></li>
                  <li>Esfuerzo empleado: <span className="property-value">{PDEffort !== null ? PDEffort.toFixed(3) : 'Esf'}</span></li>
                </ul>
                <SubSection subTitle="Estrategia programación dinámica">
                  <Matrix title="" strategy={strategyPDData.length > 0 ? strategyPDData : []} agents={networkData?.agents} />
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
            </Section>
          )}

          {networkData?.agents.length <= 25000 && (
            <Section sectionTitle="Estrategia voraz" output={strategyVExtremism !== null && strategyVEffort !== null ? { extremism: strategyVExtremism, effort: strategyVEffort, strategy: strategyVData } : undefined}>
              <div className="flex flex-col gap-4">
                <ul className="list-none list-inside space-y-2 properties-list">
                  <li>Tiempo de cómputo: <span className="property-value">{strategyVComputationTime !== null ? `${strategyVComputationTime.toFixed(4)} s` : 't'}</span></li>
                  <li>Extremismo calculado: <span className="property-value">{strategyVExtremism !== null ? strategyVExtremism.toFixed(3) : 'Ext'}</span></li>
                  <li>Esfuerzo empleado: <span className="property-value">{strategyVEffort !== null ? strategyVEffort.toFixed(3) : 'Esf'}</span></li>
                </ul>
                <SubSection subTitle="Estrategia voraz">
                  <Matrix title="" strategy={strategyVData.length > 0 ? strategyVData : []} agents={networkData?.agents} />
                </SubSection>
                <SubSection subTitle="Comparación con datos iniciales">
                  <CustomBarChart
                    chartData={[
                      { 
                        property: "Extremismo", 
                        original: networkData?.extremism ?? 0,
                        modex: strategyVExtremism ?? 0 
                      },
                      { 
                        property: "Esfuerzo empleado", 
                        original: networkData?.effort ?? 0,
                        modex: strategyVEffort ?? 0 
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
              </div>
            </Section>
          )}
        </main>
        ) : null}
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
