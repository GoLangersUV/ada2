import React from 'react';

interface MatrixProps {
  strategy: number[];
  title: string;
}

const Matrix: React.FC<MatrixProps> = ({ strategy }) => {

  // Función para calcular las dimensiones de la matriz
  function calculateMatrixDimensions(n: number) {
    const columns = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / columns);
    return { rows, columns };
  }

  const { rows, columns } = calculateMatrixDimensions(strategy.length);

  // Función para copiar la estrategia al portapapeles
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
      {/* Matriz */}
      <div
        className="matrix w-full"
        style={{
          display: 'grid',
          gap: '2px',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          aspectRatio: '1 / 0.8',
        }}
      >
        {strategy.map((value, index) => (
          <div
            className={`cell bg-opacity-60 ${value === 1 ? 'bg-[#5DDF6C]' : 'bg-[#FF6B6B]'}`}
            key={index}
          ></div>
        ))}
      </div>

      {/* Botón de copiar estrategia alineado a la derecha */}
      <button
        className="w-fit text-xs rounded"
        onClick={copyStrategy} // Usamos el evento onClick de React
      >
        📋 Copiar estrategia
      </button>
    </div>
  );
};

export default Matrix;

