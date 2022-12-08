import run from "aocrunner";
import _ from 'lodash';


interface TreeMap
{
    height: number;
    width: number;
    pos_to_altitude: Map<string, number>;
}

const make_coord = (x: number, y: number) : string => x.toString() + "/" + y.toString();

const altitude_at = (map: TreeMap, x: number, y: number) =>
{
    const res = map.pos_to_altitude.get(make_coord(x, y))
    if(res === undefined) return -1;
    return res;
}

const parseInput = (rawInput: string) : TreeMap => 
{
    const lines = rawInput.split("\n");
    const height = lines.length;
    const width = lines[0].length;
    const pos_to_altitude = new Map<string, number>()
    lines.forEach((ln, y) =>
            ln.split("").forEach((c, x) =>
            pos_to_altitude.set(make_coord(x, y), parseInt(c))
        ))
    return {height, width, pos_to_altitude}
}

const visible_query = (map: TreeMap, ox: number, oy: number, dx: number, dy: number) : boolean =>
{
    const altitude = altitude_at(map, ox, oy);
    const height = map.height;
    const width = map.width;
    let x = ox + dx;
    let y = oy + dy;
    while(x >= 0 && x < width && y >= 0 && y < width)
    {
        if(altitude_at(map, x, y) >= altitude)
        {
            return false;
        }
        x += dx;
        y += dy;
    }
    return true;
}

const is_visible = (map: TreeMap, ox: number, oy: number) : boolean =>
{
    const height = map.height;
    const width = map.width;
    const altitude = altitude_at(map, ox, oy);

    if(visible_query(map, ox, oy, -1,  0)) return true;
    if(visible_query(map, ox, oy,  1,  0)) return true;
    if(visible_query(map, ox, oy,  0, -1)) return true;
    if(visible_query(map, ox, oy,  0,  1)) return true;
    return false;
}



const count_visible = (map: TreeMap) : number => 
{
    const height = map.height;
    const width = map.width;
    let n_visible = 0;
    for(let y = 0; y < height; ++y)
    {
        for(let x = 0; x < width; ++x)
        {
            let res = is_visible(map, x, y);
            if(res)
            {
                ++n_visible;
            }
        }
    }
    return n_visible;
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return count_visible(input);
};


const sightline = (map: TreeMap, ox: number, oy: number, dx: number, dy: number) : number =>
{
    const altitude = altitude_at(map, ox, oy);
    const height = map.height;
    const width = map.width;
    let x = ox + dx;
    let y = oy + dy;
    let sight = 0;
    while(x >= 0 && x < width && y >= 0 && y < width)
    {
        sight += 1;
        if(altitude_at(map, x, y) >= altitude)
        {
            break;
        }
        x += dx;
        y += dy;
    }
    return sight;
}

const sight_score = (map: TreeMap, x: number, y: number) : number => 
{
    return (
        sightline(map, x, y, -1,  0) *
        sightline(map, x, y,  1,  0) *
        sightline(map, x, y,  0, -1) *
        sightline(map, x, y,  0,  1)
    );
}
const best_sight_score = (map: TreeMap) : number => 
{
    const height = map.height;
    const width = map.width;
    let best = 0;
    for(let y = 0; y < height; ++y)
    {
        for(let x = 0; x < width; ++x)
        {
            let res = sight_score(map, x, y);
            best = Math.max(res, best);
        }
    }
    return best;
}
const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return best_sight_score(input);
};

run({
    part1: {
        tests: [
            {
                input: `30373
25512
65332
33549
35390`,
                expected: 21,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `30373
25512
65332
33549
35390`,
                expected: 8,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
