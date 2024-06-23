import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: "Paso 1: Definir la Entidad",
    content: (
      <div>
        <p>Comenzamos definiendo la entidad VHDL con sus puertos de entrada y salida:</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {`entity recodificador is
  port (
    clk : in std_logic;
    reset : in std_logic;
    data_in : in std_logic_vector(15 downto 0);
    data_out : out std_logic_vector(17 downto 0)
  );
end entity recodificador;`}
        </pre>
      </div>
    )
  },
  {
    title: "Paso 2: Arquitectura - Señales Internas",
    content: (
      <div>
        <p>Dentro de la arquitectura, declaramos señales internas para manejar los bytes y calcular la paridad:</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {`architecture behavioral of recodificador is
  signal byte_low, byte_high : std_logic_vector(7 downto 0);
  signal parity_low, parity_high : std_logic;
begin`}
        </pre>
      </div>
    )
  },
  {
    title: "Paso 3: Lógica de Recodificación",
    content: (
      <div>
        <p>Implementamos la lógica para reordenar los bytes y calcular la paridad:</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {`process(clk, reset)
begin
  if reset = '1' then
    data_out <= (others => '0');
  elsif rising_edge(clk) then
    byte_low <= data_in(7 downto 0);
    byte_high <= data_in(15 downto 8);
    
    parity_low <= xor byte_low;
    parity_high <= xor byte_high;
    
    data_out <= byte_high & parity_high & byte_low & parity_low;
  end if;
end process;`}
        </pre>
      </div>
    )
  },
  {
    title: "Paso 4: Finalizar la Arquitectura",
    content: (
      <div>
        <p>Cerramos la arquitectura:</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {`end architecture behavioral;`}
        </pre>
        <p className="mt-2">Este código completa la implementación del recodificador.</p>
      </div>
    )
  },
  {
    title: "Resumen",
    content: (
      <ul className="list-disc list-inside">
        <li>Definimos la entidad con puertos de entrada/salida</li>
        <li>Declaramos señales internas para bytes y paridad</li>
        <li>Implementamos la lógica de reordenamiento y cálculo de paridad</li>
        <li>El proceso se activa en cada flanco de subida del reloj</li>
        <li>La salida combina los bytes reordenados con sus bits de paridad</li>
      </ul>
    )
  }
];

const Example = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h2>
        <div className="mb-6">{slides[currentSlide].content}</div>
        <div className="flex justify-between items-center">
          <button onClick={prevSlide} className="p-2 bg-blue-500 text-white rounded">
            <ChevronLeft size={24} />
          </button>
          <span>{currentSlide + 1} / {slides.length}</span>
          <button onClick={nextSlide} className="p-2 bg-blue-500 text-white rounded">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Example;