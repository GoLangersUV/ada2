/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/MainSection.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
import React from 'react';

interface MainSectionProps {
  sectionTitle: string;
  children: React.ReactNode;
}

const MainSection: React.FC<MainSectionProps> = ({ sectionTitle, children }) => {
  return (
    <section className="main-section pb-14 font-serif text-left border-2 border-[#3D3D3D] hover:border-[#00ADD8]">
      <h2 className="text-[#00ADD8] bg-[#3D3D3D] mb-5 py-1 px-4 font-sans">{sectionTitle}</h2>
      <div className="section-content mx-4">
        {children} 
      </div>
    </section>
  );
};

export default MainSection;
