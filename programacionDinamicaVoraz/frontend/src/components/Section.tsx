/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/Section.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/22/2024
 * License: GNU-GPL
 */
import React from 'react';

interface MainSectionProps {
  sectionTitle: string;
  children: React.ReactNode;
  output?: { extremism: number, effort: number, strategy: number[] };
}

const Section: React.FC<MainSectionProps> = ({ sectionTitle, children, output }) => {

  const downloadSolution = () => {
    if (output) {
      const { extremism, effort, strategy } = output;

      const content = `${extremism.toFixed(3)}\n${effort.toFixed(3)}\n${strategy.join("\n")}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${sectionTitle}_solution.txt`;
      a.click();

      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <section className="main-section pb-14 font-serif text-left border-2 border-[#3D3D3D] hover:border-[#00ADD8]">
      <div className="text-[#00ADD8] bg-[#3D3D3D] font-sans mb-5 py-1 px-4 flex flex-row justify-between">
        <h2>{sectionTitle}</h2>
        {output ? (
          <button className='border-1 text-xs border rounded-md px-2 border-[#00ADD8]' onClick={downloadSolution}>
            Descargar solución
          </button>
        ) : null}
      </div>
      <div className="section-content mx-4">
        {children}
      </div>
    </section>
  );
};

export default Section;
