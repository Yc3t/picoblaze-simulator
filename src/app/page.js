"use client"
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ReCodificadorExplanation() {
  const [showEndianness, setShowEndianness] = useState(false);
  const [showParity, setShowParity] = useState(false);

  const vhdlCode = `
  entity re_codificador is
  port(
    clk : in std_logic;
    rst : in std_logic;
    data_in : in std_logic_vector(15 downto 0);
    data_out : out std_logic_vector(17 downto 0)
  );
  end entity;
  
  architecture Behavioral of re_codificador is
  
  signal data_reg : std_logic_vector(17 downto 0);
  
  begin
  
  process(clk, rst)
  begin
    if rst then
      data_reg <= "00000000000000000000";
    else
      data_reg <= data_in & "00";
    end if;
  end process;
  
  data_out <= data_reg;
  
  end architecture;
  `;

  return (
    <div>
      <h2>FPGA Re-codificador</h2>
      <p>This circuit is designed to convert 16-bit Little Endian data into Big Endian format while adding two parity bits for error detection.</p>

      <h3>Key Concepts</h3>

      <button onClick={() => setShowEndianness(!showEndianness)}>
        Endianness (Little vs. Big)
      </button>
      {showEndianness && (
        <div>
          {/* Explanation of Little and Big Endian with visuals */}
        </div>
      )}

      <button onClick={() => setShowParity(!showParity)}>Parity Bits</button>
      {showParity && (
        <div>
          {/* Explanation of parity bits, their calculation, and error detection */}
        </div>
      )}

      <h3>VHDL Implementation</h3>
      <SyntaxHighlighter language="vhdl" style={prism}>
        {vhdlCode}
      </SyntaxHighlighter>
      {/* Explanations of the VHDL code */}
    </div>
  );
}

export default ReCodificadorExplanation;
