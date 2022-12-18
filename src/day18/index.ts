import run from "aocrunner";
import { xor } from "lodash";

interface Point
{
    x: number;
    y: number;
    z: number;
}

const to_string = (p:Point) : string => p.x + " " + p.y + " " + p.z;

interface State
{
    points: Point[];
    in_points: Set<string>;
    outside: Set<string>;
    min: Point;
    max: Point
}

const has_point = (s:State, p:Point) =>
{
    return s.in_points.has(to_string(p));
}

const is_on_the_outside = (s:State, p:Point) =>
{
    return s.outside.has(to_string(p));
}


const parseInput = (rawInput: string) : State => 
{
    const points : Point[] = rawInput.split("\n").map(ln => {
        const [x, y, z] = ln.split(",").map(v => parseInt(v));
        return {x, y, z};
    });
    let min_x = 1000;
    let max_x = -1000;
    let min_y = 1000;
    let max_y = -1000;
    let min_z = 1000;
    let max_z = -1000;
    const lookup = new Set<string>();
    points.forEach(p => {
        lookup.add(to_string(p));
        min_x = Math.min(min_x, p.x);
        max_x = Math.max(max_x, p.x);
        min_y = Math.min(min_y, p.y);
        max_y = Math.max(max_y, p.y);
        min_z = Math.min(min_z, p.z);
        max_z = Math.max(max_z, p.z);
    });
    --min_x;
    --min_y;
    --min_z;
    ++max_x;
    ++max_y;
    ++max_z;
    return {points, in_points: lookup, min: {x:min_x, y:min_z, z:min_z}, max: {x:max_x, y:max_y, z:max_z}, outside: new Set<string>()};
}

const surface_area_naive = (s:State) : number =>
{
    let area = 0;
    s.points.forEach(({x, y, z}) => {
        if(!has_point(s, {x:x-1, y, z})) ++area;
        if(!has_point(s, {x:x+1, y, z})) ++area;
        if(!has_point(s, {x, y:y-1, z})) ++area;
        if(!has_point(s, {x, y:y+1, z})) ++area;
        if(!has_point(s, {x, y, z:z-1})) ++area;
        if(!has_point(s, {x, y, z:z+1})) ++area;
    });
    return area;
}

const flood_fill = (s:State, p:Point) =>
{
    if(has_point(s, p)) return;
    if(s.outside.has(to_string(p))) return;
    const {x, y, z} = p;
    if(x < s.min.x || y < s.min.y || z < s.min.z || x > s.max.x || y > s.max.y || z > s.max.z) return;
    s.outside.add(to_string(p));

    flood_fill(s, {x:x-1, y, z});
    flood_fill(s, {x:x+1, y, z});
    flood_fill(s, {x, y:y-1, z});
    flood_fill(s, {x, y:y+1, z});
    flood_fill(s, {x, y, z:z-1});
    flood_fill(s, {x, y, z:z+1});
}





const surface_area = (s:State) : number =>
{
    flood_fill(s, s.min);
    let area = 0;
    s.points.forEach(({x, y, z}) => {
        if(is_on_the_outside(s, {x:x-1, y, z})) ++area;
        if(is_on_the_outside(s, {x:x+1, y, z})) ++area;
        if(is_on_the_outside(s, {x, y:y-1, z})) ++area;
        if(is_on_the_outside(s, {x, y:y+1, z})) ++area;
        if(is_on_the_outside(s, {x, y, z:z-1})) ++area;
        if(is_on_the_outside(s, {x, y, z:z+1})) ++area;
    });
    return area;
}


const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);

    return surface_area_naive(input);
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return surface_area(input);
};

run({
    part1: {
        tests: [
            {
                input: `2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5`,
                expected: 64,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5`,
                expected: 58,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
