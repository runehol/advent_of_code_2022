import run from "aocrunner";
import _, { flow, min } from 'lodash';

interface Valve
{
    name: string;
    flow_rate: number;
    tunnels: string[];
}


const parseInput = (rawInput: string) : Map<string, Valve> => 
{
    const map = new Map<string, Valve>();
    const regex = /Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.*)/;
    rawInput.split("\n").forEach(line => 
        {
            const m = regex.exec(line);
            if(m === null) throw "zomg";
            const name = m[1];
            const flow_rate = parseInt(m[2]);
            const tunnels = m[3].split(", ");
            const valve = {
                name,
                flow_rate,
                tunnels
            };
            map.set(name, valve);
        });
    return map;
}

interface State
{
    position: string;
    valves_opened: Set<string>;

}

const do_search = (valves: Map<string, Valve>) => 
{

    const been_here = new Map<string, number>();
    const search = (pos:string, valves_opened: Set<string>, flow_released: number, minutes_left: number) : number =>
    {
        const key = pos + flow_released;
        if((been_here.get(key) || 0) >= minutes_left) return flow_released;
        been_here.set(key, minutes_left);

        let best_flow_released = flow_released;


        if(minutes_left > 0)
        {
            const new_minutes_left = minutes_left-1;
            const valve = valves.get(pos);
            if(valve === undefined) throw "invalid map position " + pos;

            // I could decide to open a valve
            if(valve.flow_rate > 0 && !valves_opened.has(pos))
            {
                const new_flow_released = flow_released + valve.flow_rate*new_minutes_left;
                const new_valves_opened = new Set(valves_opened);
                new_valves_opened.add(pos);

                best_flow_released = Math.max(best_flow_released, search(pos, new_valves_opened, new_flow_released, new_minutes_left));
            }

            // or I could decide to go down a tunnel
            valve.tunnels.forEach(new_pos => {
                best_flow_released = Math.max(best_flow_released, search(new_pos, valves_opened, flow_released, new_minutes_left));            
            });

        }
        return best_flow_released;
    }
    return search("AA", new Set<string>(), 0, 30);
}


const do_search2 = (valves: Map<string, Valve>) => 
{

    const been_here = new Map<string, number>();

    
    const search_elephant = (person_pos:string, elephant_pos:string, valves_opened: Set<string>, flow_released: number, minutes_left: number) : number =>
    {

        let best_flow_released = flow_released;


        if(minutes_left > 0)
        {
            const new_minutes_left = minutes_left-1;
            const valve = valves.get(elephant_pos);
            if(valve === undefined) throw "invalid map position " + elephant_pos;

            // I could decide to open a valve
            if(valve.flow_rate > 0 && !valves_opened.has(elephant_pos))
            {
                const new_flow_released = flow_released + valve.flow_rate*(minutes_left-1);
                const new_valves_opened = new Set(valves_opened);
                new_valves_opened.add(elephant_pos);

                best_flow_released = Math.max(best_flow_released, search_person(person_pos, elephant_pos, new_valves_opened, new_flow_released, new_minutes_left));
            }

            // or I could decide to go down a tunnel
            valve.tunnels.forEach(new_pos => {
                best_flow_released = Math.max(best_flow_released, search_person(person_pos, new_pos, valves_opened, flow_released, new_minutes_left));            
            });

        }
        return best_flow_released;
    }

    const search_person = (person_pos:string, elephant_pos:string, valves_opened: Set<string>, flow_released: number, minutes_left: number) : number =>
    {

        let key = person_pos + elephant_pos + flow_released;
        if(person_pos > elephant_pos) key = elephant_pos + person_pos + flow_released;

        if((been_here.get(key) || 0) >= minutes_left) return flow_released;
        been_here.set(key, minutes_left);

        let best_flow_released = flow_released;


        if(minutes_left > 0)
        {
            const new_minutes_left = minutes_left;
            const valve = valves.get(person_pos);
            if(valve === undefined) throw "invalid map position " + person_pos;

            // I could decide to open a valve
            if(valve.flow_rate > 0 && !valves_opened.has(person_pos))
            {
                const new_flow_released = flow_released + valve.flow_rate*(minutes_left-1);
                const new_valves_opened = new Set(valves_opened);
                new_valves_opened.add(person_pos);

                best_flow_released = Math.max(best_flow_released, search_elephant(person_pos, elephant_pos, new_valves_opened, new_flow_released, new_minutes_left));
            }

            // or I could decide to go down a tunnel
            valve.tunnels.forEach(new_pos => {
                best_flow_released = Math.max(best_flow_released, search_elephant(new_pos, elephant_pos, valves_opened, flow_released, new_minutes_left));            
            });

        }
        return best_flow_released;
    }
    return search_person("AA", "AA", new Set<string>(), 0, 26);
}




const part1 = (rawInput: string) => {
    const valves = parseInput(rawInput);
    return do_search(valves);
};





const part2 = (rawInput: string) => {
    const valves = parseInput(rawInput);

    return do_search2(valves);
};

run({
    part1: {
        tests: [
            {
                input: `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`,
                expected: 1651,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
    Valve BB has flow rate=13; tunnels lead to valves CC, AA
    Valve CC has flow rate=2; tunnels lead to valves DD, BB
    Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
    Valve EE has flow rate=3; tunnels lead to valves FF, DD
    Valve FF has flow rate=0; tunnels lead to valves EE, GG
    Valve GG has flow rate=0; tunnels lead to valves FF, HH
    Valve HH has flow rate=22; tunnel leads to valve GG
    Valve II has flow rate=0; tunnels lead to valves AA, JJ
    Valve JJ has flow rate=21; tunnel leads to valve II`,
                            expected: 1707,
            }
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
