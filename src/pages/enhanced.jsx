import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EnhancedPicoBlazeSimulator = () => {
  // State for PicoBlaze components
  const [registers, setRegisters] = useState(Array(16).fill(0));
  const [programCounter, setProgramCounter] = useState(0);
  const [instruction, setInstruction] = useState('0000000000000000');
  const [carryFlag, setCarryFlag] = useState(false);
  const [zeroFlag, setZeroFlag] = useState(false);
  const [interruptEnabled, setInterruptEnabled] = useState(false);
  const [output, setOutput] = useState('');
  const [memory, setMemory] = useState(Array(256).fill(0));
  const [program, setProgram] = useState([]);
  const [programLines, setProgramLines] = useState([]);

  // State for AES functionality
  const [aesKey, setAesKey] = useState(new Array(16).fill(0));
  const [aesPlaintext, setAesPlaintext] = useState(new Array(16).fill(0));
  const [aesCiphertext, setAesCiphertext] = useState(new Array(16).fill(0));
  const [aesOperation, setAesOperation] = useState('');
  const [aesOperationComplete, setAesOperationComplete] = useState(false);

  // State for debugging
  const [isRunning, setIsRunning] = useState(false);
  const [breakpoints, setBreakpoints] = useState([]);

  const decodeInstruction = (instr) => {
    const opcode = instr.slice(0, 5);
    const regX = parseInt(instr.slice(8, 11), 2);
    const regY = parseInt(instr.slice(5, 8), 2);
    const immediate = parseInt(instr.slice(8), 2);

    switch (opcode) {
      case '00000': return `LOAD s${regX}, ${immediate}`;
      case '00001': return `LOAD s${regX}, s${regY}`;
      case '00010': return `AND s${regX}, s${regY}`;
      case '00011': return `AND s${regX}, ${immediate}`;
      case '00100': return `OR s${regX}, s${regY}`;
      case '00101': return `OR s${regX}, ${immediate}`;
      case '00110': return `XOR s${regX}, s${regY}`;
      case '00111': return `XOR s${regX}, ${immediate}`;
      case '01000': return `ADD s${regX}, s${regY}`;
      case '01001': return `ADD s${regX}, ${immediate}`;
      case '01010': return `ADDCY s${regX}, s${regY}`;
      case '01011': return `ADDCY s${regX}, ${immediate}`;
      case '01100': return `SUB s${regX}, s${regY}`;
      case '01101': return `SUB s${regX}, ${immediate}`;
      case '01110': return `SUBCY s${regX}, s${regY}`;
      case '01111': return `SUBCY s${regX}, ${immediate}`;
      case '10000': return `INPUT s${regX}, (s${regY})`;
      case '10001': return `INPUT s${regX}, ${immediate}`;
      case '10010': return `OUTPUT s${regX}, (s${regY})`;
      case '10011': return `OUTPUT s${regX}, ${immediate}`;
      case '11000': return `JUMP ${immediate}`;
      case '11001': return `JUMP Z, ${immediate}`;
      case '11010': return `JUMP NZ, ${immediate}`;
      case '11011': return `JUMP C, ${immediate}`;
      case '11100': return `JUMP NC, ${immediate}`;
      case '11101': return `CALL ${immediate}`;
      case '11110': return `RETURN`;
      case '11111': return 'AES_ENCRYPT';
      case '11110': return 'AES_DECRYPT';
      default: return 'Unknown instruction';
    }
  };

  const executeInstruction = () => {
    const opcode = instruction.slice(0, 5);
    const regX = parseInt(instruction.slice(8, 11), 2);
    const regY = parseInt(instruction.slice(5, 8), 2);
    const immediate = parseInt(instruction.slice(8), 2);

    let newRegisters = [...registers];
    let newPC = (programCounter + 1) % 256;
    let newCarryFlag = carryFlag;
    let newZeroFlag = zeroFlag;
    let newInterruptEnabled = interruptEnabled;
    let newMemory = [...memory];

    switch (opcode) {
      case '00000': // LOAD sX, kk
      case '00001': // LOAD sX, sY
        newRegisters[regX] = opcode === '00000' ? immediate : newRegisters[regY];
        break;
      case '00010': // AND sX, sY
      case '00011': // AND sX, kk
        newRegisters[regX] &= opcode === '00010' ? newRegisters[regY] : immediate;
        break;
      case '00100': // OR sX, sY
      case '00101': // OR sX, kk
        newRegisters[regX] |= opcode === '00100' ? newRegisters[regY] : immediate;
        break;
      case '00110': // XOR sX, sY
      case '00111': // XOR sX, kk
        newRegisters[regX] ^= opcode === '00110' ? newRegisters[regY] : immediate;
        break;
      case '01000': // ADD sX, sY
      case '01001': // ADD sX, kk
        {
          const sum = newRegisters[regX] + (opcode === '01000' ? newRegisters[regY] : immediate);
          newRegisters[regX] = sum & 255;
          newCarryFlag = sum > 255;
        }
        break;
      case '01010': // ADDCY sX, sY
      case '01011': // ADDCY sX, kk
        {
          const sum = newRegisters[regX] + (opcode === '01010' ? newRegisters[regY] : immediate) + (carryFlag ? 1 : 0);
          newRegisters[regX] = sum & 255;
          newCarryFlag = sum > 255;
        }
        break;
      case '01100': // SUB sX, sY
      case '01101': // SUB sX, kk
        {
          const operand = opcode === '01100' ? newRegisters[regY] : immediate;
          newCarryFlag = newRegisters[regX] >= operand;
          newRegisters[regX] = (newRegisters[regX] - operand + 256) & 255;
        }
        break;
      case '01110': // SUBCY sX, sY
      case '01111': // SUBCY sX, kk
        {
          const operand = opcode === '01110' ? newRegisters[regY] : immediate;
          const borrow = carryFlag ? 0 : 1;
          newCarryFlag = newRegisters[regX] >= (operand + borrow);
          newRegisters[regX] = (newRegisters[regX] - operand - borrow + 256) & 255;
        }
        break;
      case '10000': // INPUT sX, (sY)
      case '10001': // INPUT sX, pp
        setOutput(`Input: Register s${regX} from port ${opcode === '10000' ? newRegisters[regY] : immediate}`);
        break;
      case '10010': // OUTPUT sX, (sY)
      case '10011': // OUTPUT sX, pp
        {
          const port = opcode === '10010' ? newRegisters[regY] : immediate;
          if (port >= 129 && port <= 144) {
            // AES Key
            const newKey = [...aesKey];
            newKey[port - 129] = newRegisters[regX];
            setAesKey(newKey);
          } else if (port >= 145 && port <= 160) {
            // AES Plaintext/Ciphertext
            const newData = [...aesPlaintext];
            newData[port - 145] = newRegisters[regX];
            setAesPlaintext(newData);
          } else {
            setOutput(`Output: Register s${regX} (${newRegisters[regX]}) to port ${port}`);
          }
        }
        break;
      case '11000': // JUMP nnn
        newPC = immediate;
        break;
      case '11001': // JUMP Z, nnn
        if (zeroFlag) newPC = immediate;
        break;
      case '11010': // JUMP NZ, nnn
        if (!zeroFlag) newPC = immediate;
        break;
      case '11011': // JUMP C, nnn
        if (carryFlag) newPC = immediate;
        break;
      case '11100': // JUMP NC, nnn
        if (!carryFlag) newPC = immediate;
        break;
      case '11101': // CALL nnn
        setOutput(`Call to address ${immediate}`);
        newPC = immediate;
        break;
      case '11110': // RETURN
        setOutput('Return from call');
        break;
      case '11111': // AES_ENCRYPT
        setAesOperation('encrypt');
        setOutput('AES Encryption started');
        performAESOperation('encrypt');
        break;
      case '11110': // AES_DECRYPT
        setAesOperation('decrypt');
        setOutput('AES Decryption started');
        performAESOperation('decrypt');
        break;
    }

    newZeroFlag = newRegisters[regX] === 0;

    setRegisters(newRegisters);
    setProgramCounter(newPC);
    setCarryFlag(newCarryFlag);
    setZeroFlag(newZeroFlag);
    setInterruptEnabled(newInterruptEnabled);
    setMemory(newMemory);
  };

  const performAESOperation = (operation) => {
    setTimeout(() => {
      if (operation === 'encrypt') {
        setAesCiphertext(aesPlaintext.map(byte => (byte + 1) % 256));
      } else {
        setAesPlaintext(aesCiphertext.map(byte => (byte - 1 + 256) % 256));
      }
      setAesOperationComplete(true);
      setOutput(`AES ${operation} completed`);
    }, 1000);
  };

  const loadProgram = (programText) => {
    const lines = programText.split('\n');
    const newProgram = [];
    const newProgramLines = [];

    lines.forEach((line, index) => {
      // Remove comments
      const commentIndex = line.indexOf(';');
      const codeLine = commentIndex !== -1 ? line.slice(0, commentIndex) : line;
      
      // Trim whitespace
      const trimmedLine = codeLine.trim();
      
      // Extract the 16-bit instruction if present
      const parts = trimmedLine.split(/\s+/);
      const instruction = parts.find(part => /^[01]{16}$/.test(part));

      if (instruction) {
        newProgram.push(instruction);
        newProgramLines.push({ 
          number: index + 1, 
          original: line.trim(), 
          instruction: instruction 
        });
      } else if (trimmedLine) {
        // If there's content but no valid instruction, still add the line for display
        newProgramLines.push({ 
          number: index + 1, 
          original: line.trim(), 
          instruction: null 
        });
      }
    });

    setProgram(newProgram);
    setProgramLines(newProgramLines);
    setProgramCounter(0);
    setOutput('Program loaded. Ready to execute.');
  };

  const runStep = () => {
    if (programCounter < program.length) {
      setInstruction(program[programCounter]);
      executeInstruction();
      setOutput(`Executed instruction at line ${programCounter + 1}`);
    } else {
      setOutput('Program finished');
      setIsRunning(false);
    }
  };

  const runAll = () => {
    setIsRunning(true);
    const runLoop = () => {
      if (programCounter < program.length && isRunning) {
        runStep();
        if (!breakpoints.includes(programCounter + 1)) {
          setTimeout(runLoop, 100); // Adjust delay as needed
        } else {
          setOutput(`Breakpoint hit at line ${programCounter + 1}`);
          setIsRunning(false);
        }
      } else {
        setIsRunning(false);
      }
    };
    runLoop();
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput('Execution stopped');
  };

  const toggleBreakpoint = (lineNumber) => {
    setBreakpoints(prev => 
      prev.includes(lineNumber)
        ? prev.filter(bp => bp !== lineNumber)
        : [...prev, lineNumber]
    );
  };

  const handleAESInput = (type, index, value) => {
    const newValue = parseInt(value) || 0;
    if (type === 'key') {
      const newKey = [...aesKey];
      newKey[index] = newValue;
      setAesKey(newKey);
    } else if (type === 'plaintext') {
      const newPlaintext = [...aesPlaintext];
      newPlaintext[index] = newValue;
      setAesPlaintext(newPlaintext);
    }
  };

  return (
    <div className="flex p-4 max-w-6xl mx-auto">
      <div className="w-3/4 pr-4">
        <h2 className="text-2xl font-bold mb-4">PicoBlaze Simulator with AES</h2>
        <div className="mb-4">
          <p>Program Counter: {programCounter}</p>
          <p>Carry Flag: {carryFlag ? '1' : '0'}</p>
          <p>Zero Flag: {zeroFlag ? '1' : '0'}</p>
          <p>Interrupt: {interruptEnabled ? 'Enabled' : 'Disabled'}</p>
        </div>
        <div className="mb-4">
          <p>Registers:</p>
          <div className="grid grid-cols-4 gap-2">
            {registers.map((value, index) => (
              <div key={index} className="border p-2">
                s{index}: {value}
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Enter 16-bit instruction"
            className="mb-2"
          />
          <p>Decoded: {decodeInstruction(instruction)}</p>
        </div>
        <div className="mb-4">
          <p>{output}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">AES Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold">Key</h4>
              {aesKey.map((byte, index) => (
                <Input
                  key={index}
                  type="number"
                  value={byte}
                  onChange={(e) => handleAESInput('key', index, e.target.value)}
                  className="mb-1"
                  placeholder={`Key byte ${index}`}
                />
              ))}
            </div>
            <div>
              <h4 className="font-bold">Plaintext</h4>
              {aesPlaintext.map((byte, index) => (
                <Input
                  key={index}
                  type="number"
                  value={byte}
                  onChange={(e) => handleAESInput('plaintext', index, e.target.value)}
                  className="mb-1"
                  placeholder={`Plaintext byte ${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">AES Result</h3>
          <div>
            <h4 className="font-bold">Ciphertext</h4>
            <div className="grid grid-cols-4 gap-2">
              {aesCiphertext.map((byte, index) => (
                <div key={index} className="border p-2">
                  Byte {index}: {byte}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Program</h3>
          <div className="border rounded p-2 bg-gray-100 overflow-y-auto max-h-60">
            {programLines.map((line, index) => (
              <div key={index} className="flex items-center mb-1">
                <span className="w-8 text-right mr-2 text-gray-500">{line.number}:</span>
                <span className={`font-mono ${line.instruction ? '' : 'text-gray-500'}`}>
                  {line.original}
                </span>
              </div>
            ))}
          </div>
        </div>
        <textarea
          className="w-full h-40 p-2 border rounded"
          placeholder="Paste your program here"
          onChange={(e) => loadProgram(e.target.value)}
        />
      </div>
      <div className="w-1/4 pl-4 border-l">
        <h3 className="text-xl font-bold mb-4">Debugger</h3>
        <Button onClick={runStep} className="mb-2 w-full">Step</Button>
        <Button onClick={runAll} className="mb-2 w-full" disabled={isRunning}>Run All</Button>
        <Button onClick={stopExecution} className="mb-2 w-full" disabled={!isRunning}>Stop</Button>
        <div className="mt-4">
          <h4 className="font-bold mb-2">Breakpoints</h4>
          <div className="overflow-y-auto max-h-60">
            {programLines.map((line, index) => (
              <div key={index} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={breakpoints.includes(line.number)}
                  onChange={() => toggleBreakpoint(line.number)}
                  className="mr-2"
                  disabled={!line.instruction}
                />
                <span className={line.instruction ? '' : 'text-gray-500'}>
                  Line {line.number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPicoBlazeSimulator;