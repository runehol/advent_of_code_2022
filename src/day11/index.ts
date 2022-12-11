import run from "aocrunner";
import _ from 'lodash';

interface Monkey
{
    items: number[];
    operation: string;
    divisor: number;
    targets: [number, number]; //true, false
    n_inspected: number;
}

interface State
{
    monkeys: Monkey[];
    round: number;
    turn: number;
    worry_divider: number;
    common_divisor: number;
}

const parseInput = (rawInput: string) : Monkey[] => 
{
    return rawInput.split("\n\n").map((chunk:string):Monkey =>
        {
            const lines = chunk.split("\n");
            const items = lines[1].split(": ")[1].split(", ").map(elm => parseInt(elm));
            let operation = lines[2].split(": ")[1].replace("new", "new_item");
            const divisor = parseInt(lines[3].split("by ")[1]);
            const true_target = parseInt(lines[4].split("throw to monkey")[1]);
            const false_target = parseInt(lines[5].split("throw to monkey")[1]);
            const targets : [number, number] = [true_target, false_target];
            const n_inspected = 0;
            return {
                items, operation, divisor, targets, n_inspected
            }
        });
}

const common_multiple = (nums: number[]) : number =>
{
    return nums.reduce((a, b) => a*b);
}


const make_monkey_state = (monkeys:Monkey[], worry_divider: number) : State =>
{
    let common_divisor = common_multiple(monkeys.map(monkey => monkey.divisor));
    return {
        monkeys,
        round: 0,
        turn: 0,
        worry_divider,
        common_divisor
    }
}

const log_items = (state: State) : void =>
{
    console.log("After round num", state.round);
    state.monkeys.forEach((monkey, idx) => {
        console.log("Monkey", idx, monkey.items);        
    });
}


const step = (state:State) =>
{
    const monkey = state.monkeys[state.turn];

    while(monkey.items.length)
    {
        const old : number = monkey.items.shift()||0;
        let new_item = old;
        eval(monkey.operation); // reassigns new_item
        let new_bored_item = new_item;
        if(state.worry_divider != 1)
        {
            new_bored_item = Math.floor(new_item/state.worry_divider);
        }
        new_bored_item = new_bored_item % state.common_divisor; // reduce so they don't blow up
        const dest = monkey.targets[new_bored_item % monkey.divisor != 0? 1: 0]
        ++monkey.n_inspected;
        state.monkeys[dest].items.push(new_bored_item);
    }

    state.turn += 1;
    if(state.turn >= state.monkeys.length)
    {
        state.round += 1;
        state.turn -= state.monkeys.length;
        //log_items(state);
    }
}

const step_until = (state: State, past_round: number) =>
{
    while(state.round < past_round)
    {
        step(state);
    }
}


const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const state = make_monkey_state(input, 3);
    step_until(state, 20);
    const inspected_array = state.monkeys.map(monkey=>monkey.n_inspected);
    inspected_array.sort((a, b) => b-a)
    const monkey_business = inspected_array[0]*inspected_array[1];
    return monkey_business;
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const state = make_monkey_state(input, 1);
    step_until(state, 10000);
    const inspected_array = state.monkeys.map(monkey=>monkey.n_inspected);
    inspected_array.sort((a, b) => b-a)
    const monkey_business = inspected_array[0]*inspected_array[1];
    return monkey_business;
};

run({
    part1: {
        tests: [
            {
                input: `Monkey 0:
Starting items: 79, 98
Operation: new = old * 19
Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
Starting items: 54, 65, 75, 74
Operation: new = old + 6
Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
Starting items: 79, 60, 97
Operation: new = old * old
Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
Starting items: 74
Operation: new = old + 3
Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1`,
                expected: 10605,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            //{
            //    input: ``,
            //    expected: "",
            //},
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
