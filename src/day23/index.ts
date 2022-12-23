import run from "aocrunner";
import _, { map } from 'lodash';
import { stringify } from "querystring";

interface Position
{
    x: number;
    y: number;
}

const to_string = (p:Position) => p.x + "_" + p.y;

const add = (a:Position, b:Position) : Position => { return {x:a.x+b.x, y:a.y+b.y} }

const parseInput = (rawInput: string) : Position[] => 
{
    const positions : Position[] = [];
    rawInput.split("\n").map((ln, y) => ln.split("").map((v, x) => {
        if(v == "#")
        {
            positions.push({x, y});
        }
    }));
    return positions;
}
const deltas: Position[] = [
    {x:-1, y:-1}, //0 -> NW
    {x: 0, y:-1}, //1 -> N
    {x:+1, y:-1}, //2 -> NE
    {x:+1, y: 0}, //3 -> E
    {x:+1, y:+1}, //4 -> SE
    {x: 0, y:+1}, //5 -> S
    {x:-1, y:+1}, //6 -> SW
    {x:-1, y: 0}  //7 -> W
]

const proposals : number[][] = [
    [1, 0, 2], // North
    [5, 4, 6], // South
    [7, 6, 0], // West
    [3, 2, 4], // East
]

const step = (curr_positions: Position[], round_idx: number) : Position[] => 
{
    const curr_positions_set = new Set<string>(curr_positions.map(to_string));

    const proposal_count = new Map<string, Position[]>();

    const new_proposals : (Position|undefined)[] = curr_positions.map(p => 
        {
            const neighbours = deltas.map(d => add(p, d));
            const present = neighbours.map(n => curr_positions_set.has(to_string(n)));
            if(_.compact(present).length == 0)
            {
                //nothing nearby, we'll stay here
                return undefined;
            } else {
                for(let i = 0; i < 4; ++i)
                {
                    let proposal_idx = (round_idx + i)%4;
                    let proposal = proposals[proposal_idx];
                    const present_in_proposal = proposal.map(idx => present[idx]);
                    if(_.compact(present_in_proposal).length == 0)
                    {
                        const chosen = neighbours[proposal[0]];
                        const hash = to_string(chosen);
                        const k = (proposal_count.get(hash) ?? []);
                        k.push(p);
                        proposal_count.set(hash, k);
                        return chosen;
                    }

                }
                return undefined;
            }
        });

    if(proposal_count.size === 0) return curr_positions;

    const new_positions : Position[] = curr_positions.map((curr_pos, idx) => 
    {
        const proposal = new_proposals[idx];
        if(proposal !== undefined)
        {
            if(proposal_count.get(to_string(proposal))?.length === 1)
            {
                return proposal;
            }
        }
        return curr_pos;
    })
    return new_positions;
}

const extents = (positions: Position[]) => 
{
    const xs = positions.map(p => p.x);
    const ys = positions.map(p => p.y);
    return [_.min(xs)||0, _.max(xs)||0, _.min(ys)||0, _.max(ys)||0];
}

const draw = (positions: Position[]) => 
{
    let [xmin, xmax, ymin, ymax] = extents(positions);
    xmin = Math.min(xmin, 0);
    ymin = Math.min(ymin, 0);
    const curr_positions_set = new Set<string>(positions.map(to_string));
    const str = _.range(ymin, ymax+1).map(y => _.range(xmin, xmax+1).map((x:number) : string => curr_positions_set.has(to_string({x, y})) ?  "#" : ".").join("")).join("\n");
    console.log(str);
    console.log();

}

const step_n = (positions: Position[], n: number) =>
{
    for(let i = 0; i < n; ++i)
    {
        positions = step(positions, i);
    }
    return positions;
}


const step_until = (positions: Position[]) =>
{
    for(let i = 0; true; ++i)
    {
        const new_positions = step(positions, i);
        if(positions === new_positions) return i+1;
        positions = new_positions;
    }
}

const score = (positions: Position[]) =>
{
    const [xmin, xmax, ymin, ymax] = extents(positions);
    const non_empty = (xmax - xmin + 1) * (ymax - ymin + 1) - positions.length;
    return non_empty;
}


const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const pos = step_n(input, 10);
    return score(pos);

};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return step_until(input);
};

run({
    part1: {
        tests: [
            {
                input: `..............
..............
.......#......
.....###.#....
...#...#.#....
....#...##....
...#.###......
...##.#.##....
....#..#......
..............
..............
..............`,
                expected: 110,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `..............
..............
.......#......
.....###.#....
...#...#.#....
....#...##....
...#.###......
...##.#.##....
....#..#......
..............
..............
..............`,
                expected: 20,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
