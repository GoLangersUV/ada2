/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/Matrix.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Agent {
  opinion: number;
  receptivity: number;
}

interface MatrixProps {
  strategy: number[];
  title?: string;
  agents?: Agent[];
}

const Matrix: React.FC<MatrixProps> = ({ strategy, title, agents }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ columns: 0, cellSize: 0 });

  useEffect(() => {
    const calculateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxHeight = 1000;
        const gap = 2;
        const maxCellSize = 20;

        let columns = Math.floor((containerWidth + gap) / (maxCellSize + gap));
        let cellSize = Math.floor((containerWidth - (columns - 1) * gap) / columns);

        const rows = Math.ceil(strategy.length / columns);
        if (rows * (cellSize + gap) > maxHeight) {
          const maxRows = Math.floor((maxHeight + gap) / (cellSize + gap));
          columns = Math.ceil(strategy.length / maxRows);
          cellSize = Math.floor((containerWidth - (columns - 1) * gap) / columns);
        }

        setDimensions({ columns, cellSize });
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => {
      window.removeEventListener('resize', calculateDimensions);
    };
  }, [strategy.length]);

  const copyStrategy = () => {
    const strategyString = `[${strategy.join(', ')}]`;
    navigator.clipboard.writeText(strategyString)
      .then(() => {
        alert('Estrategia copiada al portapapeles.');
      })
      .catch((err) => {
        console.error('Error al copiar la estrategia:', err);
      });
  };

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      {title && <h3 className="text-sm font-semibold text-[#CECECE]">{title}</h3>}
      <div ref={containerRef} className="w-full">
        <div
          className="matrix"
          style={{
            display: 'grid',
            gap: '2px',
            gridTemplateColumns: `repeat(${dimensions.columns}, ${dimensions.cellSize}px)`,
            maxHeight: '1000px',
            overflow: 'hidden',
          }}
        >
          {strategy.map((value, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={`cell bg-opacity-60 ${value === 1 ? 'bg-[#5DDF6C]' : 'bg-[#FF6B6B]'}`}
                    style={{
                      width: `${dimensions.cellSize}px`,
                      height: `${dimensions.cellSize}px`,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent className='dark:bg-black dark:text-white font-sans'>
                  <div className="flex flex-col">
                    <span><span className='text-gray-400'>Agente:</span> {index+1}</span>
                    {agents && agents[index] ? (
                      <>
                        <span><span className='text-gray-400'>Opinión: </span>{agents[index].opinion}</span>
                        <span><span className='text-gray-400'>Receptividad:</span> {agents[index].receptivity.toFixed(4)}</span>
                      </>
                    ) : (
                      <span>Datos del agente no disponibles</span>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
      <button
        className="w-fit text-xs font-sans text-[#CECECE]"
        onClick={copyStrategy}
      >
        📋 Copiar estrategia
      </button>
    </div>
  );
};

export default Matrix;
