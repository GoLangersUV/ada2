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

