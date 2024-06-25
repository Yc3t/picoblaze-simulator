import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Slide = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    {children}
  </div>
);

const CodeBlock = ({ code }) => (
  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
    <code>{code}</code>
  </pre>
);

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    // Slide 1
    <Slide title="Overview of the VHDL Design">
      <ul className="list-disc pl-6">
        <li>Implements a system with PicoBlaze microcontroller</li>
        <li>Includes Program ROM, RAM, and UART interface</li>
        <li>Main entity: 'toplevel'</li>
      </ul>
      <CodeBlock code={`
entity toplevel is
    Port ( port_id : out std_logic_vector(7 downto 0);
           write_strobe, read_strobe : out std_logic;
           out_port, in_port : out std_logic_vector(7 downto 0);
           reset, clk, rx : in std_logic;
           tx : out std_logic;
           LED : out std_logic);
end toplevel;
      `}/>
    </Slide>,

    // Slide 2
    <Slide title="PicoBlaze and Program ROM">
      <ul className="list-disc pl-6">
        <li>PicoBlaze: 8-bit soft microcontroller</li>
        <li>Program ROM: Stores instructions for PicoBlaze</li>
        <li>Connected via address and instruction signals</li>
      </ul>
      <CodeBlock code={`
processor: picoblaze
    port map ( address => address,
               instruction => instruction,
               port_id => pb_port_id,
               write_strobe => pb_write_strobe,
               out_port => pb_out_port,
               read_strobe => pb_read_strobe,
               in_port => pb_in_port,
               interrupt => interrupt,
               reset => reset,
               clk => clk );

program: programa_helloworld_int_FLIP
    port map ( address => address,
               dout => instruction,
               clk => clk );
      `}/>
    </Slide>,

    // Slide 3
    <Slide title="RAM Implementation">
      <ul className="list-disc pl-6">
        <li>64-byte RAM (addresses 0x00 to 0x3F)</li>
        <li>Synchronous write, asynchronous read</li>
        <li>Special handling for port 0xFF (UART)</li>
      </ul>
      <CodeBlock code={`
-- RAM read process
process(pb_port_id, RAM, rxbuff_out)
begin
    if (to_integer(unsigned(pb_port_id)) < 64) then
        RAM_out <= RAM(to_integer(unsigned(pb_port_id)));
    elsif (pb_port_id = x"FF") then
        RAM_out <= rxbuff_out;  -- UART receive data
    else
        RAM_out <= (others => '0');  -- Default value
    end if;
end process;

-- RAM write process
process(clk)
begin
    if rising_edge(clk) then
        if pb_write_strobe = '1' then
            if to_integer(unsigned(pb_port_id)) < 64 then
                RAM(to_integer(unsigned(pb_port_id))) <= pb_out_port;
            elsif pb_port_id = x"FF" then
                tx_data <= pb_out_port;
                tx_start <= '1';
            end if;
        else
            tx_start <= '0';
        end if;
    end if;
end process;
      `}/>
    </Slide>,

    // Slide 4
    <Slide title="UART Interface">
      <ul className="list-disc pl-6">
        <li>Simple UART implementation</li>
        <li>RX: Input on port 0xFF</li>
        <li>TX: Output from port 0xFF</li>
        <li>Interrupt triggered on RX (active low)</li>
      </ul>
      <CodeBlock code={`
-- UART receive process
process(clk, reset)
begin
    if reset = '1' then
        rxbuff_out <= (others => '1');
    elsif rising_edge(clk) then
        if pb_read_strobe = '1' and pb_port_id = x"FF" then
            rxbuff_out <= rx & "0000000";
        end if;
    end if;
end process;

-- UART transmit process (simplified)
process(clk, reset)
begin
    if reset = '1' then
        tx <= '1';
    elsif rising_edge(clk) then
        if tx_start = '1' then
            tx <= tx_data(0);  -- Simplification: only transmitting LSB
        else
            tx <= '1';  -- Idle state
        end if;
    end if;
end process;

-- Interrupt logic
interrupt <= not rx;
      `}/>
    </Slide>,

    // Slide 5
    <Slide title="Testbench Overview">
      <ul className="list-disc pl-6">
        <li>Verifies functionality of the toplevel entity</li>
        <li>Simulates clock, reset, and UART communication</li>
        <li>Monitors outputs and UART transmission</li>
      </ul>
      <CodeBlock code={`
entity toplevel_tb is
end toplevel_tb;

architecture Behavioral of toplevel_tb is
    -- Component declaration
    -- Signal declarations
    -- Constants
    -- UART procedures
begin
    -- UUT instantiation
    -- Clock process
    -- Stimulus process
    -- UART transmit monitor
    -- Assertions and monitoring
end Behavioral;
      `}/>
    </Slide>,

    // Slide 6
    <Slide title="Testbench: UART Simulation">
      <ul className="list-disc pl-6">
        <li>UART_WRITE_BYTE: Simulates sending data</li>
        <li>UART_READ_BYTE: Decodes received data</li>
        <li>Proper idle state (RX = '1')</li>
      </ul>
      <CodeBlock code={`
procedure UART_WRITE_BYTE (
    data_in : in std_logic_vector(7 downto 0);
    signal serial_out : out std_logic
) is
begin
    serial_out <= '0';  -- Start bit
    wait for bit_period;
    for i in 0 to 7 loop
        serial_out <= data_in(i);
        wait for bit_period;
    end loop;
    serial_out <= '1';  -- Stop bit
    wait for bit_period;
end procedure;

procedure UART_READ_BYTE (
    signal serial_in : in std_logic;
    data_out : out std_logic_vector(7 downto 0)
) is
begin
    wait until falling_edge(serial_in);  -- Wait for start bit
    wait for bit_period * 1.5;  -- Wait to middle of first data bit
    for i in 0 to 7 loop
        data_out(i) := serial_in;
        wait for bit_period;
    end loop;
end procedure;
      `}/>
    </Slide>,

    // Slide 7
    <Slide title="Testbench: Stimulus and Monitoring">
      <ul className="list-disc pl-6">
        <li>Applies reset and waits for stabilization</li>
        <li>Sends multiple UART characters</li>
        <li>Monitors UART transmission</li>
        <li>Checks port operations and signal states</li>
      </ul>
      <CodeBlock code={`
-- Stimulus process (excerpt)
stim_proc: process
begin
    -- Initialize and reset
    -- Test UART receive
    UART_WRITE_BYTE(x"41", rx);  -- Send 'A'
    wait for 2 ms;
    -- More UART tests...
    -- End simulation
end process;

-- UART transmit monitor
tx_monitor: process
    variable rx_data : std_logic_vector(7 downto 0);
begin
    wait until falling_edge(tx);
    UART_READ_BYTE(tx, rx_data);
    report "TX Data: " & integer'image(to_integer(unsigned(rx_data)));
end process;

-- Assertions and monitoring
assert_proc: process
begin
    -- Monitor various signals and report states
end process;
      `}/>
    </Slide>,

    // Slide 8
    <Slide title="Verification Points">
      <ul className="list-disc pl-6">
        <li>Reset functionality</li>
        <li>UART receive and transmit operations</li>
        <li>RAM read and write operations</li>
        <li>PicoBlaze instruction execution</li>
        <li>Interrupt handling</li>
      </ul>
      <p className="mt-4">
        The testbench verifies these points by:
      </p>
      <ul className="list-disc pl-6 mt-2">
        <li>Simulating UART communication</li>
        <li>Monitoring port operations</li>
        <li>Checking signal states at various points</li>
        <li>Reporting key events and data transfers</li>
      </ul>
    </Slide>,

    // Slide 9
    <Slide title="Conclusion and Next Steps">
      <ul className="list-disc pl-6">
        <li>Comprehensive verification of the toplevel design</li>
        <li>Covers main functionalities: PicoBlaze, RAM, UART</li>
        <li>Improved error handling and boundary checks</li>
      </ul>
      <p className="mt-4">
        Potential improvements:
      </p>
      <ul className="list-disc pl-6 mt-2">
        <li>Implement full UART transmitter logic</li>
        <li>Add more specific test cases for PicoBlaze instructions</li>
        <li>Extend RAM testing with various patterns</li>
        <li>Implement coverage-driven verification</li>
      </ul>
    </Slide>
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {slides[currentSlide]}
      <div className="flex justify-between mt-4">
        <button onClick={prevSlide} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          <ChevronLeft size={24} />
          Previous
        </button>
        <button onClick={nextSlide} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          Next
          <ChevronRight size={24} />
        </button>
      </div>
      <p className="text-center mt-4">
        Slide {currentSlide + 1} of {slides.length}
      </p>
    </div>
  );
};

export default Presentation;