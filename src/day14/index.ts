import run from "aocrunner";
import _, { floor } from 'lodash';

const parseInput = (rawInput: string) => 
{
    return rawInput.split("\n").map(path => 
        path.split(" -> ").map(point => point.split(",").map(v => parseInt(v))));
}


interface M
{
    xstart: number;
    xend: number;
    ystart: number;
    yend: number;
    m: string[][];
}

const extents = (points : number[][][]) =>
{
    const xs = _.flatMap(points, path => _.flatMap(path, p => p[0]));
    const ys = _.flatMap(points, path => _.flatMap(path, p => p[1]));
    return [_.min(xs)??0, _.max(xs)??0, Math.min(_.min(ys)??0, 0), _.max(ys)??0]
}
const init_map = (xstart:number, xmax:number, ystart:number, ymax: number) : M =>
{
    const xend = xmax+1, yend = ymax+1;
    const m = _.range(ystart, yend).map(l => _.range(xstart, xend).map(p => "."));
    return {
        xstart,
        xend,
        ystart,
        yend,
        m
    }
}

const within_map = (map: M, x:number, y:number) : boolean => 
{
    return x >= map.xstart && x < map.xend && y >= map.ystart && y < map.yend;
}

const read = (map: M, x: number, y:number) : string => 
{
    return map.m[y - map.ystart][x - map.xstart];
}

const obstacle = (map: M, x: number, y:number) : boolean => 
{
    if(!within_map(map, x, y)) return false;
    return read(map, x, y) !== '.';
}

const write = (map: M, x: number, y:number, p: string) => 
{
    map.m[y - map.ystart][x - map.xstart] = p;
}

const write_segment = (m: M, x0: number, y0: number, x1: number, y1: number) =>
{
    let x = x0, y = y0;
    while(x != x1 || y != y1)
    {
        write(m, x, y, '#');
        x += Math.sign(x1-x);
        y += Math.sign(y1-y);
    }
    write(m, x1, y1, '#');
}

const write_path = (m: M, path: number[][]) =>
{
    for(let i = 1; i < path.length; ++i)
    {
        write_segment(m, path[i-1][0], path[i-1][1], path[i][0], path[i][1]);
    }
}


const display = (map: M) =>
{
    console.log("Origo:", map.xstart, ",", map.ystart)
    console.log(map.m.map(l => l.join("")).join("\n"));
}

const make_map = (paths : number[][][], add_floor: boolean) =>
{
    if(add_floor)
    {
        const [xmin, xmax, ymin, ymax] = extents(paths);
        const floor_y = ymax + 2;
        const margin = 2;
        paths.push([[500-floor_y-margin, floor_y], [500+floor_y+margin, floor_y]])
    }
    const [xmin, xmax, ymin, ymax] = extents(paths);
    const m = init_map(xmin, xmax, ymin, ymax)

    paths.forEach(p => write_path(m, p));

    return m;
}

const drop_sand = (m: M, x: number, y: number) : boolean =>
{
    while(within_map(m, x, y) && (!obstacle(m, x, y)))
    {
        if(!obstacle(m, x, y+1)) ++y;
        else if(!obstacle(m, x-1, y+1)) { ++y, --x; }
        else if(!obstacle(m, x+1, y+1)) { ++y; ++x; }
        else {
            // we're at rest here
            write(m, x, y, 'o');
            return true;
        }

    }
    return false;
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const m = make_map(input, false);

    let n_sand_units = 0;
    while(drop_sand(m, 500, 0)) { ++n_sand_units;  }
    display(m);
    return n_sand_units;
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const m = make_map(input, true);

    let n_sand_units = 0;
    while(drop_sand(m, 500, 0)) { ++n_sand_units;  }
    display(m);
    return n_sand_units;
};

run({
    part1: {
        tests: [
            {
                input: `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`,
                expected: 24,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`,
                expected: 93,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
