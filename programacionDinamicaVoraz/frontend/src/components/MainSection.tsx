import React from 'react';

interface MainSectionProps {
  sectionTitle: string;
  children: React.ReactNode; // Para pasar contenido dentro del componente
}

const MainSection: React.FC<MainSectionProps> = ({ sectionTitle, children }) => {
  return (
    <section className="main-section pb-14 font-serif text-left border-2 border-[#3D3D3D] hover:border-[#00ADD8]">
      <h2 className="text-[#00ADD8] bg-[#3D3D3D] mb-5 py-1 px-4 italic">{sectionTitle}</h2>
      <div className="section-content mx-4">
        {children}  {/* Aquí renderizas el contenido pasado como "children" */}
      </div>
    </section>
  );
};

export default MainSection;

