/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/app.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/19/2024
 * Last modification: 09/24/2024
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
import type { ChartConfig } from "@/components/ui/chart";
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

interface AlgorithmResults {
  fb?: ModexResult | null;
  pd?: ModexResult | null;
  v?: ModexResult | null;
}

type AlgorithmKey = 'fb' | 'pd' | 'v';

interface ModexPromiseResult {
  algorithm: AlgorithmKey;
  data: ModexResult | null;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);

  const [algorithmResults, setAlgorithmResults] = useState<AlgorithmResults>({});

  const [strategyDifferences, setStrategyDifferences] = useState<StrategyDifferences>({
    fbVsPd: null,
    fbVsV: null,
    pdVsV: null
  });

  const onFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    setNetworkData(null);
    setAlgorithmResults({});
    setStrategyDifferences({
      fbVsPd: null,
      fbVsV: null,
      pdVsV: null
    });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkData]);

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
      const modexPromises: Promise<ModexPromiseResult>[] = [];

      if (networkData?.agents.length && networkData.agents.length <= 2500) {
        const pdPromise = fetch(`http://localhost:8080/modex/pd?file=${fileName}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error al obtener ModexPD: ${response.statusText}`);
            }
            return response.json();
          })
          .then((dataPD: ModexResult) => ({
            algorithm: 'pd' as AlgorithmKey,
            data: dataPD,
          }))
          .catch(error => {
            console.error('Error al obtener ModexPD:', error);
            return { algorithm: 'pd' as AlgorithmKey, data: null };
          });
        modexPromises.push(pdPromise);
      } else {
        console.log("Programación Dinámica no se ejecuta para más de 2500 agentes.");
        setAlgorithmResults(prevResults => ({ ...prevResults, pd: null }));
      }

      const vPromise = fetch(`http://localhost:8080/modex/v?file=${fileName}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error al obtener ModexV: ${response.statusText}`);
          }
          return response.json();
        })
        .then((dataV: ModexResult) => ({
          algorithm: 'v' as AlgorithmKey,
          data: dataV,
        }))
        .catch(error => {
          console.error('Error al obtener ModexV:', error);
          return { algorithm: 'v' as AlgorithmKey, data: null };
        });
      modexPromises.push(vPromise);

      if (networkData?.agents.length && networkData.agents.length <= 25) {
        const fbPromise = fetch(`http://localhost:8080/modex/fb?file=${fileName}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error al obtener ModexFB: ${response.statusText}`);
            }
            return response.json();
          })
          .then((dataFB: ModexResult) => ({
            algorithm: 'fb' as AlgorithmKey,
            data: dataFB,
          }))
          .catch(error => {
            console.error('Error al obtener ModexFB:', error);
            return { algorithm: 'fb' as AlgorithmKey, data: null };
          });
        modexPromises.push(fbPromise);
      } else {
        console.log("Fuerza Bruta no se ejecuta para más de 25 agentes.");
        setAlgorithmResults(prevResults => ({ ...prevResults, fb: null }));
      }

      const modexResults = await Promise.all(modexPromises);

      const newAlgorithmResults: AlgorithmResults = { ...algorithmResults };

      modexResults.forEach(result => {
        newAlgorithmResults[result.algorithm] = result.data;
      });

      setAlgorithmResults(newAlgorithmResults);
    } catch (error) {
      console.error('Error al obtener los resultados de Modex:', error);
    }
  };

  const calculateHammingDistance = (arr1: number[], arr2: number[]): number => {
    if (arr1.length !== arr2.length) return -1;
    return arr1.reduce((acc, val, idx) => acc + (val !== arr2[idx] ? 1 : 0), 0);
  };

  const differenceExtremism = (extremism1: number | null, extremism2: number | null) => {
    if (extremism1 === null || extremism2 === null) return 'N/A';
    if (extremism1 === 0 && extremism2 === 0) return ' 0%';
    return ` ${((Math.abs(extremism2 - extremism1) / extremism1) * 100).toFixed(2)}%`;
  };

  const calculateStrategyDifferences = () => {
    const pdStrategy = algorithmResults.pd?.strategy || [];
    const vStrategy = algorithmResults.v?.strategy || [];
    const fbStrategy = algorithmResults.fb?.strategy || [];

    let pdVsV: number | null = null;
    let fbVsPd: number | null = null;
    let fbVsV: number | null = null;

    if (pdStrategy.length > 0 && vStrategy.length > 0) {
      pdVsV = calculateHammingDistance(pdStrategy, vStrategy);
    }

    if (fbStrategy.length > 0 && pdStrategy.length > 0) {
      fbVsPd = calculateHammingDistance(fbStrategy, pdStrategy);
      fbVsV = calculateHammingDistance(fbStrategy, vStrategy);
    }

    setStrategyDifferences({
      fbVsPd: fbVsPd !== -1 ? fbVsPd : null,
      fbVsV: fbVsV !== -1 ? fbVsV : null,
      pdVsV: pdVsV !== -1 ? pdVsV : null,
    });
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null || !networkData) return 'N/A';
    const totalAgents = networkData.agents.length || 1;
    return ` ${((value / totalAgents) * 100).toFixed(2)}%`;
  };

  useEffect(() => {
    if (algorithmResults.pd || algorithmResults.v || algorithmResults.fb) {
      calculateStrategyDifferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmResults]);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className='min-h-screen'>
        <Header subject="Análisis y diseño de algoritmos II" onFileSelect={onFileSelect} selectedFile={selectedFile} />

        {selectedFile && networkData ? (
          <main className="max-w-3xl m-auto rounded-md shadow-2xl overflow-hidden">
            <Section sectionTitle="Información general">
              <div className="flex flex-col gap-4">
                <ul className="list-none list-inside space-y-2 properties-list">
                  <li>Número de agentes: <span className="property-value">{networkData.agents.length}</span></li>
                  <li>Recursos totales: <span className="property-value">{networkData.resources}</span></li>
                  <li>Extremismo de la red: <span className="property-value">{networkData.extremism.toFixed(2)}</span></li>
                  <li>Esfuerzo total de moderación: <span className="property-value">{networkData.effort.toFixed(2)}</span></li>
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
                      {networkData.agents.map((agent: Agent, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{agent.opinion}</TableCell>
                          <TableCell>{agent.receptivity.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <SubSection subTitle="Comparación de soluciones">
                  <ul className="list-none list-inside space-y-2 properties-list">
                    {algorithmResults.pd && (
                      <>
                        <li>
                          Diferencia de estrategias:
                          <span className="property-value">
                            {formatPercentage(strategyDifferences.pdVsV)}
                          </span>
                        </li>
                        <li>
                          Diferencia de extremismos:
                          <span className="property-value">
                            {differenceExtremism(algorithmResults.pd?.extremism ?? null, algorithmResults.v?.extremism ?? null)}
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                  <CustomRadarChart
                    chartData={[
                      {
                        category: "Tiempo",
                        ModexPD: algorithmResults.pd?.computationTime ?? undefined,
                        ModexV: algorithmResults.v?.computationTime ?? undefined,
                        ...(algorithmResults.fb && { ModexFB: algorithmResults.fb.computationTime }),
                      },
                      {
                        category: "Extremismo",
                        ModexPD: algorithmResults.pd?.extremism ?? undefined,
                        ModexV: algorithmResults.v?.extremism ?? undefined,
                        ...(algorithmResults.fb && { ModexFB: algorithmResults.fb.extremism }),
                      },
                      {
                        category: "Esfuerzo",
                        ModexPD: algorithmResults.pd?.effort ?? undefined,
                        ModexV: algorithmResults.v?.effort ?? undefined,
                        ...(algorithmResults.fb && { ModexFB: algorithmResults.fb.effort }),
                      },
                    ]}
                    chartConfig={{
                      ...(algorithmResults.pd && {
                        ModexPD: {
                          label: "ModexPD",
                          color: "#FFA500",
                        },
                      }),
                      ...(algorithmResults.fb && {
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
              </div>
            </Section>

            {algorithmResults.fb && (
              <Section
                sectionTitle="Fuerza Bruta"
                output={{
                  extremism: algorithmResults.fb.extremism,
                  effort: algorithmResults.fb.effort,
                  strategy: algorithmResults.fb.strategy,
                }}
              >
                <div className="flex flex-col gap-4">
                  <ul className="list-none list-inside space-y-2 properties-list">
                    <li>
                      Tiempo de cómputo: 
                      <span className="property-value">
                        {algorithmResults.fb.computationTime !== null
                          ? `${algorithmResults.fb.computationTime.toFixed(4)} s`
                          : 't'}
                      </span>
                    </li>
                    <li>
                      Extremismo óptimo: 
                      <span className="property-value">
                        {algorithmResults.fb.extremism?.toFixed(3) ?? 'Ext'}
                      </span>
                    </li>
                    <li>
                      Esfuerzo empleado: 
                      <span className="property-value">
                        {algorithmResults.fb.effort?.toFixed(3) ?? 'Esf'}
                      </span>
                    </li>
                  </ul>
                  <SubSection subTitle="Estrategia fuerza bruta">
                    <Matrix
                      title=""
                      strategy={
                        algorithmResults.fb.strategy.length > 0
                          ? algorithmResults.fb.strategy
                          : strategyFB
                      }
                      agents={networkData?.agents}
                    />
                  </SubSection>
                  <SubSection subTitle="Comparación con datos iniciales">
                    <CustomBarChart
                      chartData={[
                        {
                          property: "Extremismo",
                          original: networkData?.extremism ?? 0,
                          modex: algorithmResults.fb.extremism ?? 0,
                        },
                        {
                          property: "Esfuerzo empleado",
                          original: networkData?.effort ?? 0,
                          modex: algorithmResults.fb.effort ?? 0,
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
              </Section>
            )}

            {algorithmResults.pd && (
              <Section
                sectionTitle="Programación dinámica"
                output={{
                  extremism: algorithmResults.pd.extremism,
                  effort: algorithmResults.pd.effort,
                  strategy: algorithmResults.pd.strategy,
                }}
              >
                <div className="flex flex-col gap-4">
                  <ul className="list-none list-inside space-y-2 properties-list">
                    <li>
                      Tiempo de cómputo: 
                      <span className="property-value">
                        {algorithmResults.pd.computationTime !== null
                          ? `${algorithmResults.pd.computationTime.toFixed(4)} s`
                          : 't'}
                      </span>
                    </li>
                    <li>
                      Extremismo óptimo: 
                      <span className="property-value">
                        {algorithmResults.pd.extremism?.toFixed(3) ?? 'Ext'}
                      </span>
                    </li>
                    <li>
                      Esfuerzo empleado: 
                      <span className="property-value">
                        {algorithmResults.pd.effort?.toFixed(3) ?? 'Esf'}
                      </span>
                    </li>
                  </ul>
                  <SubSection subTitle="Estrategia programación dinámica">
                    <Matrix
                      title=""
                      strategy={
                        algorithmResults.pd.strategy.length > 0
                          ? algorithmResults.pd.strategy
                          : []
                      }
                      agents={networkData?.agents}
                    />
                  </SubSection>
                  <SubSection subTitle="Comparación con datos iniciales">
                    <CustomBarChart
                      chartData={[
                        {
                          property: "Extremismo",
                          original: networkData?.extremism ?? 0,
                          modex: algorithmResults.pd.extremism ?? 0,
                        },
                        {
                          property: "Esfuerzo empleado",
                          original: networkData?.effort ?? 0,
                          modex: algorithmResults.pd.effort ?? 0,
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

            {algorithmResults.v && (
              <Section
                sectionTitle="Estrategia voraz"
                output={{
                  extremism: algorithmResults.v.extremism,
                  effort: algorithmResults.v.effort,
                  strategy: algorithmResults.v.strategy,
                }}
              >
                <div className="flex flex-col gap-4">
                  <ul className="list-none list-inside space-y-2 properties-list">
                    <li>
                      Tiempo de cómputo: 
                      <span className="property-value">
                        {algorithmResults.v.computationTime !== null
                          ? `${algorithmResults.v.computationTime.toFixed(4)} s`
                          : 't'}
                      </span>
                    </li>
                    <li>
                      Extremismo calculado: 
                      <span className="property-value">
                        {algorithmResults.v.extremism?.toFixed(3) ?? 'Ext'}
                      </span>
                    </li>
                    <li>
                      Esfuerzo empleado: 
                      <span className="property-value">
                        {algorithmResults.v.effort?.toFixed(3) ?? 'Esf'}
                      </span>
                    </li>
                  </ul>
                  <SubSection subTitle="Estrategia voraz">
                    <Matrix
                      title=""
                      strategy={
                        algorithmResults.v.strategy.length > 0
                          ? algorithmResults.v.strategy
                          : []
                      }
                      agents={networkData?.agents}
                    />
                  </SubSection>
                  <SubSection subTitle="Comparación con datos iniciales">
                    <CustomBarChart
                      chartData={[
                        {
                          property: "Extremismo",
                          original: networkData?.extremism ?? 0,
                          modex: algorithmResults.v.extremism ?? 0,
                        },
                        {
                          property: "Esfuerzo empleado",
                          original: networkData?.effort ?? 0,
                          modex: algorithmResults.v.effort ?? 0,
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
