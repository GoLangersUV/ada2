/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/frontend/src/components/SubSection.tsx
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/10/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
import React from 'react';
import { Separator } from '../components/ui/separator';

interface SubSectionProps {
  subTitle: string;
  children: React.ReactNode;
}

const SubSection: React.FC<SubSectionProps> = ({ subTitle, children }) => {
  return (
    <div className="sub-section flex flex-col">
      <Separator className=" mt-7 " />
      <h3 className="text-[#00ADD8] text-xs mt-2 mb-5 font-sans">{subTitle}</h3>
      <div className="sub-content">
        {children}
      </div>
    </div>
  );
};

export default SubSection;
