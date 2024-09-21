// frontend/src/components/App.tsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import MainSection from './MainSection.astro';
import SubSection from './SubSection.astro';
import CustomRadarChart from './RadarChart';
import CustomBarChart from './BarChart';
import Matrix from './Matrix.astro';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const strategyFB = [0, 1, 0, 1, 1, 0, 1, 1, 0]; // Ejemplo de estrategia para fuerza bruta

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [networkData, setNetworkData] = useState<any>(null);
  const [strategyFBData, setStrategyFBData] = useState<number[]>([]);

  // Función para manejar la selección de archivo
  const onFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  // Efecto para obtener los datos cuando cambia el archivo seleccionado
  useEffect(() => {
    if (selectedFile) {
      fetchNetworkData(selectedFile);
      fetchModexResults(selectedFile);
    }
  }, [selectedFile]);

  // Función para obtener los datos de la red
  const fetchNetworkData = async (fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8080/network?file=${fileName}`);
      const data = await response.json();
      setNetworkData(data);
    } catch (error) {
      console.error('Error al obtener los datos del network:', error);
    }
  };

  // Función para obtener los resultados de Modex
  const fetchModexResults = async (fileName: string) => {
    try {
      const responseFB = await fetch(`http://localhost:8080/modex/fb?file=${fileName}`);
      const dataFB = await responseFB.json();
      setStrategyFBData(dataFB.strategy);
      // Puedes agregar más peticiones para otros algoritmos
    } catch (error) {
      console.error('Error al obtener los resultados de Modex:', error);
    }
  };

  return (
    <>
      <Header subject="Análisis y diseño de algoritmos II" onFileSelect={onFileSelect} />

      <main className="max-w-3xl m-auto rounded-md ring-1 ring-[#3D3D3D] shadow-2xl overflow-hidden">
        <MainSection sectionTitle="Información general">
          <div className="flex flex-col gap-4">
            <ul className="list-none list-inside space-y-2">
              <li>Número de agentes: <span className="text-white italic">{networkData ? networkData.agents.length : 'n'}</span></li>
              <li>Recursos totales: <span className="text-white italic">{networkData ? networkData.resources : 'R_max'}</span></li>
              <li>Extremismo de la red: <span className="text-white italic">Ext</span></li>
              <li>Esfuerzo total de moderación: <span className="text-white italic">Esf</span></li>
            </ul>
            <div className="max-w-sm overflow-y-scroll ring-1 ring-[#D9D9D9] ring-opacity-30 relative max-h-72 flow-root agents-table">
              <Table>
                <TableHeader className='sticky top-0 bg-[#D9D9D9] bg-opacity-20 backdrop-blur backdrop-filter'>
                  <TableRow>
                    <TableHead className='text-white'>Agente</TableHead>
                    <TableHead className='text-white'>Opinión</TableHead>
                    <TableHead className='text-white'>Receptividad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className='max-h-2'>
                  {networkData && networkData.agents.map((agent: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index}</TableCell>
                      <TableCell>{agent.opinion}</TableCell>
                      <TableCell>{agent.receptivity.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <SubSection subTitle="Comparación de soluciones">
                <CustomRadarChart client:only/>
            </SubSection>
            <SubSection subTitle="Diferencias de estrategias">
              <ul className="list-none list-inside space-y-2">
                <li>ModexFB vs ModexPD: <span className="text-white italic">α</span></li>
                <li>ModexFB vs ModexV : <span className="text-white italic">β</span></li>
                <li>ModexPD vs ModexV: <span className="text-white italic">γ</span></li>
              </ul>
            </SubSection>
          </div>
        </MainSection>
        <MainSection sectionTitle="Fuerza Bruta">
          <div className="flex flex-col gap-4">
            <ul className="list-none list-inside space-y-2">
              <li>Tiempo de cómputo: <span className="text-white italic">t</span></li>
              <li>Extremismo óptimo: <span className="text-white italic">Ext</span></li>
              <li>Esfuerzo empleado: <span className="text-white italic">Esf</span></li>
            </ul>
            <SubSection subTitle="Estrategia fuerza bruta">
              <Matrix title="" strategy={strategyFBData.length > 0 ? strategyFBData : strategyFB} />
            </SubSection>
            <SubSection subTitle="Comparación con datos iniciales">
                <CustomBarChart client:only/>
            </SubSection>
          </div>
        </MainSection>

        <MainSection sectionTitle="Programación dinámica">

        </MainSection>

        <MainSection sectionTitle="Estrategia voraz">
         
        </MainSection>

      </main>
    </>
  );
};

export default App;

