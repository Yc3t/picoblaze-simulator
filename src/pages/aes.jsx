import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: "Introduction to AES PicoBlaze Implementation",
    content: (
      <div>
        <p>This presentation covers the implementation of AES (Advanced Encryption Standard) functionality in the PicoBlaze soft-core microcontroller.</p>
        <ul>
          <li>Modifications to picoblaze.vhd</li>
          <li>New AES-specific components</li>
          <li>Changes to the toplevel design</li>
          <li>Program ROM modifications</li>
          <li>Testbench for verification</li>
        </ul>
      </div>
    )
  },
  {
    title: "PicoBlaze Architecture Overview",
    content: (
      <div>
        <p>The PicoBlaze is a compact, 8-bit soft-core microcontroller designed for embedded applications.</p>
        <ul>
          <li>8-bit data path</li>
          <li>16 8-bit registers</li>
          <li>256-word instruction memory</li>
          <li>64-byte scratchpad RAM</li>
          <li>Simple I/O operations</li>
        </ul>
      </div>
    )
  },
  {
    title: "Modifications to picoblaze.vhd (1/3)",
    content: (
      <div>
        <p>Key changes to the main PicoBlaze architecture:</p>
        <ol>
          <li>Add new instruction constants:
            <pre>constant aes_init_id : std_logic_vector(4 downto 0) := "11101";</pre>
            <pre>constant aes_process_id : std_logic_vector(4 downto 0) := "11110";</pre>
            <pre>constant aes_finalize_id : std_logic_vector(4 downto 0) := "11111";</pre>
          </li>
        </ol>
      </div>
    )
  },
  {
    title: "Modifications to picoblaze.vhd (2/3)",
    content: (
      <div>
        <ol start="2">
          <li>Add new instruction signals:
            <pre>signal i_aes_init, i_aes_process, i_aes_finalize : std_logic;</pre>
          </li>
          <li>Add AES component declaration:
            <pre>{`component aes_core
    Port ( data_in : in STD_LOGIC_VECTOR (127 downto 0);
           key : in STD_LOGIC_VECTOR (127 downto 0);
           encrypt : in STD_LOGIC;
           data_out : out STD_LOGIC_VECTOR (127 downto 0);
           done : out STD_LOGIC;
           start : in STD_LOGIC;
           clk : in STD_LOGIC);
end component;`}</pre>
          </li>
        </ol>
      </div>
    )
  },
  {
    title: "Modifications to picoblaze.vhd (3/3)",
    content: (
      <div>
        <ol start="4">
          <li>Add AES-related signals:
            <pre>{`signal aes_data_in, aes_key, aes_data_out : std_logic_vector(127 downto 0);
signal aes_encrypt, aes_done, aes_start : std_logic;`}</pre>
          </li>
          <li>Modify instruction decoding:
            <pre>{`i_aes_init <= '1' when instruction(15 downto 11) = aes_init_id else '0';
i_aes_process <= '1' when instruction(15 downto 11) = aes_process_id else '0';
i_aes_finalize <= '1' when instruction(15 downto 11) = aes_finalize_id else '0';`}</pre>
          </li>
          <li>Update ALU result generation to include AES operations</li>
        </ol>
      </div>
    )
  },
  {
    title: "AES Core Component (1/2)",
    content: (
      <div>
        <p>The AES core component (aes_core.vhd) implements the main AES algorithm:</p>
        <ul>
          <li>SubBytes transformation</li>
          <li>ShiftRows operation</li>
          <li>MixColumns operation</li>
          <li>AddRoundKey step</li>
          <li>Key expansion</li>
        </ul>
        <p>It supports both encryption and decryption modes.</p>
      </div>
    )
  },
  {
    title: "AES Core Component (2/2)",
    content: (
      <div>
        <p>Key features of the AES core:</p>
        <ul>
          <li>128-bit input/output data path</li>
          <li>128-bit key input</li>
          <li>Configurable number of rounds (10 for AES-128)</li>
          <li>Start signal to initiate operation</li>
          <li>Done signal to indicate completion</li>
          <li>Encrypt input to select between encryption and decryption</li>
        </ul>
      </div>
    )
  },
  {
    title: "SubBytes Component",
    content: (
      <div>
        <p>The SubBytes component (subbytes.vhd) implements the S-box substitution:</p>
        <pre>{`entity subbytes is
    Port ( data_in : in STD_LOGIC_VECTOR (7 downto 0);
           data_out : out STD_LOGIC_VECTOR (7 downto 0);
           clk : in STD_LOGIC);
end subbytes;`}</pre>
        <ul>
          <li>Uses a look-up table for efficient implementation</li>
          <li>Operates on individual bytes</li>
          <li>Clocked operation for synchronous design</li>
        </ul>
      </div>
    )
  },
  {
    title: "MixColumns Component",
    content: (
      <div>
        <p>The MixColumns component (mixcolumns.vhd) performs column mixing:</p>
        <pre>{`entity mixcolumns is
    Port ( col_in : in STD_LOGIC_VECTOR (31 downto 0);
           col_out : out STD_LOGIC_VECTOR (31 downto 0);
           clk : in STD_LOGIC);
end mixcolumns;`}</pre>
        <ul>
          <li>Operates on 32-bit columns</li>
          <li>Implements Galois field multiplication</li>
          <li>Clocked operation for synchronous design</li>
        </ul>
      </div>
    )
  },
  {
    title: "Key Expansion Component",
    content: (
      <div>
        <p>The Key Expansion component (keyexpand.vhd) generates round keys:</p>
        <pre>{`entity keyexpand is
    Port (key_in : in std_logic_vector(127 downto 0);
          round : in std_logic_vector(3 downto 0);
          key_out : out std_logic_vector(127 downto 0);
          clk : in std_logic);
end keyexpand;`}</pre>
        <ul>
          <li>Takes the initial 128-bit key as input</li>
          <li>Generates a new 128-bit round key for each round</li>
          <li>Uses SubWord and RotWord operations</li>
          <li>Incorporates round constant (Rcon) values</li>
        </ul>
      </div>
    )
  },
  {
    title: "Toplevel Design Changes (1/2)",
    content: (
      <div>
        <p>Modifications to the toplevel.vhd file:</p>
        <ol>
          <li>Add AES core component declaration</li>
          <li>Instantiate the AES core:
            <pre>{`aes: aes_core
    port map ( data_in => aes_data_in,
               key => aes_key,
               encrypt => aes_encrypt,
               data_out => aes_data_out,
               done => aes_done,
               start => aes_start,
               clk => clk );`}</pre>
          </li>
        </ol>
      </div>
    )
  },
  {
    title: "Toplevel Design Changes (2/2)",
    content: (
      <div>
        <ol start="3">
          <li>Modify RAM to accommodate AES data and key storage</li>
          <li>Update RAM read process to include AES output access</li>
          <li>Implement AES control process:
            <ul>
              <li>Handle data and key loading</li>
              <li>Manage AES operation start and completion</li>
              <li>Control result reading</li>
            </ul>
          </li>
        </ol>
      </div>
    )
  },
  {
    title: "Program ROM Modifications (1/2)",
    content: (
      <div>
        <p>Updates to programa_helloworld_int_FLIP.vhd:</p>
        <ol>
          <li>Add new instructions for AES operations:
            <pre>{`"0001000011100000", -- 03: LOAD s0, A0     ; Load port address for AES control
"0100000100000001", -- 04: LOAD s1, 01     ; s1 = 1 (data start address)
"0100001000010001", -- 05: LOAD s2, 11     ; s2 = 17 (data end address)`}</pre>
          </li>
          <li>Implement data loading loop</li>
          <li>Implement key loading loop</li>
        </ol>
      </div>
    )
  },
  {
    title: "Program ROM Modifications (2/2)",
    content: (
      <div>
        <ol start="4">
          <li>Add AES encryption initiation:
            <pre>{`"0000010100000001", -- 17: LOAD s5, 01     ; Load control byte (01 for encrypt)
"1000100000000000", -- 18: OUTPUT s5, (s0) ; Send control byte to AES core`}</pre>
          </li>
          <li>Implement result reading loop</li>
          <li>Add appropriate delay for AES operation completion</li>
        </ol>
      </div>
    )
  },
  {
    title: "Testbench Overview",
    content: (
      <div>
        <p>The testbench (toplevel_tb.vhd) verifies the AES implementation:</p>
        <ul>
          <li>Instantiates the toplevel design</li>
          <li>Provides clock generation</li>
          <li>Implements a stimulus process:
            <ol>
              <li>Loads test data and key into RAM</li>
              <li>Monitors program execution</li>
              <li>Reads AES result from RAM</li>
              <li>Compares result with expected output</li>
            </ol>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Testbench: Data Loading",
    content: (
      <div>
        <p>The testbench loads test data and key into RAM:</p>
        <pre>{`-- Load test data into RAM
for i in 0 to 15 loop
    write_to_port(std_logic_vector(to_unsigned(i+1, 8)), TEST_DATA(i));
end loop;

-- Load test key into RAM
for i in 0 to 15 loop
    write_to_port(std_logic_vector(to_unsigned(i+23, 8)), TEST_KEY(i));
end loop;`}</pre>
      </div>
    )
  },
  {
    title: "Testbench: Execution Monitoring",
    content: (
      <div>
        <p>The testbench monitors program execution using debug_instruction:</p>
        <pre>{`-- Monitor debug_instruction to track program execution
while unsigned(debug_instruction) /= x"251D" loop  -- Wait until we reach the result reading loop
    wait until rising_edge(clk);
end loop;`}</pre>
        <p>This ensures that the AES operation has completed before reading the result.</p>
      </div>
    )
  },
  {
    title: "Testbench: Result Verification",
    content: (
      <div>
        <p>The testbench reads and verifies the AES result:</p>
        <pre>{`-- Read AES result
for i in 0 to 15 loop
    read_from_port(std_logic_vector(to_unsigned(i+33, 8)), result(i));
end loop;

-- Verify result
for i in 0 to 15 loop
    assert result(i) = EXPECTED_RESULT(i)
        report "Mismatch at byte " & integer'image(i) & 
               ". Expected: " & to_hstring(EXPECTED_RESULT(i)) & 
               ", Got: " & to_hstring(result(i))
        severity error;
end loop;`}</pre>
      </div>
    )
  },
  {
    title: "Conclusion",
    content: (
      <div>
        <p>The AES implementation for PicoBlaze includes:</p>
        <ul>
          <li>Modifications to the core PicoBlaze architecture</li>
          <li>New AES-specific components (SubBytes, MixColumns, KeyExpand)</li>
          <li>Integration of AES functionality in the toplevel design</li>
          <li>Program ROM updates to support AES operations</li>
          <li>A comprehensive testbench for verification</li>
        </ul>
        <p>This implementation enables efficient AES encryption and decryption on the PicoBlaze platform, suitable for various embedded security applications.</p>
      </div>
    )
  }
];

const Slide = ({ title, content }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 m-4">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    {content}
  </div>
);

const AESPicoBlazeSlides = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Slide {...slides[currentSlide]} />
      <div className="flex justify-between w-full max-w-xl mt-4">
        <button
          onClick={prevSlide}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <ChevronLeft className="mr-2" /> Previous
        </button>
        <span className="text-xl font-bold">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={nextSlide}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          Next <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};
export default AESPicoBlazeSlides
