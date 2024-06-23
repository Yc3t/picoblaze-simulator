class LFSR:
    def __init__(self, initial_state):
        if len(initial_state) != 8 or not all(bit in (0, 1) for bit in initial_state):
            raise ValueError("Initial state must be a list of 8 binary digits (0 or 1)")
        self.state = initial_state
        self.output = []
        self.cycles = 0

    def step(self):
        new_bit = self.state[7] ^ self.state[2] ^ self.state[1] ^ self.state[0]
        output_bit = self.state.pop()
        self.state.insert(0, new_bit)
        self.output.append(output_bit)
        self.cycles += 1
        return output_bit

    def run(self, num_cycles):
        return [self.step() for _ in range(num_cycles)]

    def __str__(self):
        return f"Current state: {self.state}\nOutput: {self.output}\nCycles: {self.cycles}"


def main():
    # Initialize LFSR with a default state
    lfsr = LFSR([1, 0, 0, 0, 0, 0, 0, 0])

    while True:
        print("\nLFSR Simulator Menu:")
        print("1. Show current state")
        print("2. Run one step")
        print("3. Run multiple steps")
        print("4. Reset LFSR")
        print("5. Set custom initial state")
        print("6. Exit")

        choice = input("Enter your choice (1-6): ")

        if choice == '1':
            print(lfsr)
        elif choice == '2':
            output = lfsr.step()
            print(f"Step output: {output}")
            print(lfsr)
        elif choice == '3':
            num_steps = int(input("Enter number of steps to run: "))
            output = lfsr.run(num_steps)
            print(f"Output sequence: {output}")
            print(lfsr)
        elif choice == '4':
            lfsr = LFSR([1, 0, 0, 0, 0, 0, 0, 0])
            print("LFSR reset to initial state")
        elif choice == '5':
            try:
                new_state = [int(bit) for bit in input("Enter 8-bit initial state (e.g., 10000000): ")]
                lfsr = LFSR(new_state)
                print("New initial state set")
            except ValueError as e:
                print(f"Error: {e}")
        elif choice == '6':
            print("Exiting simulator")
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 6.")

if __name__ == "__main__":
    main()