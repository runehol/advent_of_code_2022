import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import run from "aocrunner";
import _ from 'lodash';

type Position = [number, number];

interface Candidate {
    position: Position;
    f_score: number;
}

const compare_candidates: ICompare<Candidate> = (a: Candidate, b: Candidate) => 
{
    // lowest g scores first
    return a.f_score < b.f_score ? -1 : 1;
};


interface Terrain
{
    raw_map: string;
    start: Position;
    end: Position;
    heights: number[][];
}

const neighbour_moves : Position[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

const parseInput = (rawInput: string) : Terrain => 
{
    let start : Position = [-1, -1];
    let end : Position = [-1, -1];
    const heights = rawInput.split("\n").map((ln, y) => ln.split("").map((c, x) => 
    {
        if(c == 'S')
        {
            start = [y, x];
            return 0;
        } else if(c == 'E')
        {
            end = [y, x];
            return 25;
        }
        return c.charCodeAt(0)-'a'.charCodeAt(0);
    }));
    return { raw_map: rawInput, start, end, heights }
}

type H = (p: Position) => number;
type D = (from: Position, to: Position) => number;

const infinity = 1<<30;

const stringify_key = (pos:Position) =>
{
    return pos[0] + "_" + pos[1];
}

const lookup = (map:Map<string, number>, key:Position) =>
{
    return map.get(stringify_key(key)) ?? infinity;
}

const insert = (map:Map<string, number>, key:Position, value:number) =>
{
    map.set(stringify_key(key), value);
}

const manhattan_distance = (a:Position, b:Position) => 
{
    return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
}


const reconstruct_path = (end: Position, came_from: Map<string, Position>) : Position[] =>
{
    const path : Position[] = [];
    let curr = end;
    while(1)
    {
        path.push(curr);
        const cand = came_from.get(stringify_key(curr));
        if(cand === undefined) break;
        curr = cand;
    }
    return path.reverse();
}

const a_star = (starts: Position[], goal: Position, h:H, d:D) =>
{
    const open_set = new PriorityQueue<Candidate>(compare_candidates);
    const g_score = new Map<string, number>;
    starts.forEach(start => {
        open_set.enqueue({position:start, f_score:h(start)});        
        insert(g_score, start, 0);
    });



    const came_from = new Map<string, Position>;


    while(!open_set.isEmpty())
    {
        const {position: current} = open_set.pop();
        if(manhattan_distance(current, goal) == 0)
        {
            return reconstruct_path(goal, came_from);
        }


        neighbour_moves.forEach(move => {
            const neighbour : Position = [current[0]+move[0], current[1]+move[1]];
            const tentative_g_score = lookup(g_score, current) + d(current, neighbour);
            if(tentative_g_score < lookup(g_score, neighbour))
            {
                came_from.set(stringify_key(neighbour), current);
                insert(g_score, neighbour, tentative_g_score);
                const neighbour_f = tentative_g_score + h(neighbour);
                open_set.push({position: neighbour, f_score: neighbour_f});
            }
            
        });
    }

}


const build_path_illustration = (map: Terrain, path:Position[]) =>
{
    const chars : string[][] = map.heights.map((h => new Array(h.length).fill(".")));
    chars[map.end[0]][map.end[1]] = 'E';
    for(let i = 1; i < path.length; ++i)
    {
        const from = path[i-1];
        const to = path[i];
        let c = '.';
        if(from[0] == to[0]-1) c = 'v';
        else if(from[0] == to[0]+1) c = '^';
        else if(from[1] == to[1]-1) c = '>';
        else if(from[1] == to[1]+1) c = '<';
        chars[from[0]][from[1]] = c;
    }
    return chars.map(row => row.join("")).join("\n")


}

const read_height = (map:Terrain, pos:Position) =>
{
    const row = map.heights[pos[0]];
    if(row === undefined) return infinity;
    const column = row[pos[1]];
    if(column === undefined) return infinity;
    return column;
}

const find_route = (map: Terrain, starts: Position[]) : number =>
{
    const h:H = (pos:Position) =>
    {
        return manhattan_distance(pos, map.end)
    }


    const d:D = (from: Position, to: Position) =>
    {
        //assumes we'll only be called for neighbouring positions
        const from_height = read_height(map, from);
        const to_height = read_height(map, to);
        if(to_height - from_height > 1) return infinity;
        return 1;
    }


    const path = a_star(starts, map.end, h, d)
    if(path === undefined) return -1;
/*
    console.log(map.raw_map);
    console.log();
    console.log(build_path_illustration(map, path));
  */  
    return path.length-1;

}


const part1 = (rawInput: string) => {
    const map = parseInput(rawInput);
    return find_route(map, [map.start]);
};


const part2 = (rawInput: string) => {
    const map = parseInput(rawInput);
    const all_starts: Position[] = [];
    map.heights.forEach((row, y) => row.forEach((h, x) => {
        if(h == 0)
        {
            all_starts.push([y, x]);
        }
    }));
    return find_route(map, all_starts);
};

run({
    part1: {
        tests: [
            {
                input: `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`,
                expected: 31
            }
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`,
                expected: 29
            }
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
