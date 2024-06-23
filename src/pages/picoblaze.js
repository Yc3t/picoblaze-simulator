import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EnhancedPicoBlazeSimulator = () => {
  const [registers, setRegisters] = useState(Array(16).fill(0));
  const [programCounter, setProgramCounter] = useState(0);
  const [instruction, setInstruction] = useState('0000000000000000');
  const [carryFlag, setCarryFlag] = useState(false);
  const [zeroFlag, setZeroFlag] = useState(false);
  const [interruptEnabled, setInterruptEnabled] = useState(false);
  const [output, setOutput] = useState('');
  const [memory, setMemory] = useState(Array(256).fill(0));
  const [program, setProgram] = useState([]);

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
      case '11111': return interruptEnabled ? 'DISABLE INTERRUPT' : 'ENABLE INTERRUPT';
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
        setOutput(`Output: Register s${regX} (${newRegisters[regX]}) to port ${opcode === '10010' ? newRegisters[regY] : immediate}`);
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
        // Simplified call without stack
        setOutput(`Call to address ${immediate}`);
        newPC = immediate;
        break;
      case '11110': // RETURN
        // Simplified return without stack
        setOutput('Return from call');
        break;
      case '11111': // ENABLE/DISABLE INTERRUPT
        newInterruptEnabled = !interruptEnabled;
        setOutput(`Interrupt ${newInterruptEnabled ? 'Enabled' : 'Disabled'}`);
        break;
    }

    newZeroFlag = newRegisters[regX] === 0;

    setRegisters(newRegisters);
    setProgramCounter(newPC);
    setCarryFlag(newCarryFlag);
    setZeroFlag(newZeroFlag);
    setInterruptEnabled(newInterruptEnabled);
  };

  const loadProgram = (programText) => {
    const lines = programText.split('\n');
    const newProgram = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        return parts[1]; // Assumes the second part is the instruction
      }
      return '';
    }).filter(instr => instr.length === 16);
    setProgram(newProgram);
    setProgramCounter(0);
  };

  const runProgram = () => {
    if (programCounter < program.length) {
      setInstruction(program[programCounter]);
      executeInstruction();
    } else {
      setOutput('Program finished');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">PicoBlaze Simulator</h2>
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
      <Button onClick={executeInstruction} className="mb-4 mr-2">Execute Instruction</Button>
      <Button onClick={runProgram} className="mb-4">Run Next Instruction</Button>
      <div>
        <p>{output}</p>
      </div>
      <textarea
        className="w-full h-40 p-2 border rounded"
        placeholder="Paste your program here"
        onChange={(e) => loadProgram(e.target.value)}
      />
    </div>
  );
};

export default EnhancedPicoBlazeSimulator;