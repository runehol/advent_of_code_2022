import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';

type Command = number|"L"|"R";

type Direction = 0|1|2|3;

interface Position
{
    y: number;
    x: number;
}

interface PositionDir
{
    x: number;
    y: number,
    dir: Direction
}

interface Board
{
    lines: string[];
    width: number;
    height: number;
    side: number;
}

const dir_delta : Position[] = [{y:0, x:1}, {y:1, x:0}, {y:0, x:-1}, {y:-1, x:0}]

const iterate_pos_one = (pos:PositionDir) : PositionDir =>
{
    const delta = dir_delta[pos.dir];
    return {x:pos.x+delta.x, y:pos.y+delta.y, dir:pos.dir}
}


const lookup = (pos:Position, board:Board) : string =>
{
    if(pos.y < 0 || pos.y >= board.lines.length) return ' ';
    const line = board.lines[pos.y];
    if(pos.x < 0 || pos.x >= line.length) return ' ';
    return line[pos.x];
}

type NextPosAndTile = (pos:PositionDir, board:Board) => [PositionDir, string];

const next_pos_and_tile_flat : NextPosAndTile = (pos:PositionDir, board:Board) : [PositionDir, string] =>
{
    let next = iterate_pos_one(pos);
    if(pos.dir == 0 && next.x >= board.width) next.x = 0;
    if(pos.dir == 1 && next.y >= board.height) next.y = 0;
    if(pos.dir == 2 && next.x < 0) next.x = board.width-1;
    if(pos.dir == 3 && next.y < 0) next.y = board.height-1;

    let v = lookup(next, board);
    if(v == ' ') return next_pos_and_tile_flat(next, board);
    return [next, v];
}


const step_one = (pos:PositionDir, board:Board, next_pos_and_tile: NextPosAndTile) : PositionDir =>
{
    const [next, tile] = next_pos_and_tile(pos, board);
    if(tile == '#') return pos; //crashed into wall
    else {
        assert(tile == '.')
        return next;
    }
}




const parseInput = (rawInput: string) : [Board, Command[]] => 
{
    const [m, path] = rawInput.split("\n\n");
    const map = m.split("\n");
    const regex = /\d+|L|R/g;
    const height = map.length;
    const width = _(map).map(ln => ln.length).max()||0;
    const commands: Command[] = [...path.matchAll(regex)].map(m => {
        if(m[0] == "L" || m[0] == "R")
        {
            return m[0];
        } else {
            return parseInt(m[0]);
        }
    });
    return [{ lines: map, height, width, side:50}, commands];
}

const move = (pos:PositionDir, cmd:Command, board:Board, next_pos_and_tile: NextPosAndTile) : PositionDir =>
{
    if(cmd === 'L')
    {
        const dir = ((pos.dir+3)%4) as Direction;
        return {x:pos.x, y:pos.y, dir}
    } else if(cmd === 'R')
    {
        const dir = ((pos.dir+1)%4) as Direction;
        return {x:pos.x, y:pos.y, dir}
    } else {
        for(let i = 0; i < cmd; ++i)
        {
            pos = step_one(pos, board, next_pos_and_tile);
        }
        return pos;
    }
}

const move_sequence = (pos:PositionDir, cmds:Command[], board:Board, next_pos_and_tile: NextPosAndTile)  : PositionDir =>
{
    cmds.forEach(cmd => {
        pos = move(pos, cmd, board, next_pos_and_tile);
    });
    return pos;
}

const part1 = (rawInput: string) => {
    const [board, commands] = parseInput(rawInput);
    const initial_pos = step_one({x:0, y:0, dir:0}, board, next_pos_and_tile_flat);
    const final_pos = move_sequence(initial_pos, commands, board, next_pos_and_tile_flat)
    return (final_pos.y+1)*1000 + (final_pos.x+1)*4 + final_pos.dir;
};

const pos_eq = (a:PositionDir, b:PositionDir): boolean => a.x === b.x && a.y === b.y && a.dir === b.dir;

const next_pos_and_tile_cube : NextPosAndTile = (pos:PositionDir, board:Board) : [PositionDir, string] =>
{
    const side = board.side;

    const rotate_left = (p:PositionDir) : PositionDir =>
    {
        let tile_x = Math.floor(p.x / side)*side;
        let tile_y = Math.floor(p.y / side)*side;
        let xs = p.x % side;
        let ys = p.y % side;
        let new_dir = (p.dir+3)%4 as Direction;
        return {x:tile_x + ys, y: tile_y + side - 1 - xs, dir:new_dir}
    }

    const rotate_right = (p:PositionDir) : PositionDir =>
    {
        let tile_x = Math.floor(p.x / side)*side;
        let tile_y = Math.floor(p.y / side)*side;
        let xs = p.x % side;
        let ys = p.y % side;
        let new_dir = (p.dir+1)%4 as Direction;
        return {x:tile_x + side - 1 - ys, y: tile_y + xs, dir:new_dir}
    }
    const rotate_180 = (p:PositionDir) => rotate_right(rotate_right(p));

    let test_p : PositionDir = pos;
    assert(pos_eq(rotate_left(rotate_right(test_p)), test_p), "turn left then right -> straight ahead");
    assert(pos_eq(rotate_180(rotate_180(test_p)), test_p), "turn 180 twice");
    assert(pos_eq(rotate_left(rotate_left(rotate_left(test_p))), rotate_right(test_p)), "RL 3x -> RR");
    assert(pos_eq(rotate_right(rotate_right(rotate_right(test_p))), rotate_left(test_p)), "RR 3x -> RL");

    const shift_tile = (dx: number, dy: number, p: PositionDir) : PositionDir =>
    {
        return {x:p.x+dx*side, y:p.y+dy*side, dir:p.dir};
    }

    let xs = pos.x % side;
    let ys = pos.y % side;
    let p = pos;
    if(pos.dir == 0) // right
    {
        if(pos.x == 3*side-1)
        {
            // F -> C
            p = shift_tile(0, 2, rotate_180(pos));
        } else if(pos.x == 2*side-1 && pos.y >= side && pos.y < 2*side)
        {
            // B -> F
            p = shift_tile(1, 0, rotate_left(pos));
        } else if(pos.x == 2*side-1 && pos.y >= 2*side && pos.y < 3*side)
        {
            // C -> F
            p = shift_tile(2, -2, rotate_180(pos));
        } else if(pos.x == side-1 && pos.y >= 3*side)
        {
            //D -> C
            p = shift_tile(1, 0, rotate_left(pos));
        }
    } else if(pos.dir == 1) // down
    {
        if(pos.y == 4*side-1)
        {
            //D -> F
            p = shift_tile(2, -4, pos);
        } else if(pos.x >= side && pos.x < 2*side && pos.y == 3*side-1)
        {
            //C -> D
            p = shift_tile(0, 1, rotate_right(pos));
        } else if(pos.x >= 2*side && pos.y == side-1)
        {
            // F -> B
            p = shift_tile(0, 1, rotate_right(pos));
        }
    } else if(pos.dir == 2) // left
    {
        if(pos.x == side && pos.y < side)
        {
            //A -> E
            p = shift_tile(-2, 2, rotate_180(pos))
        } else if(pos.x == side && pos.y >= side && pos.x < 2*side)
        {
            //B -> E
            p = shift_tile(-1, 0, rotate_left(pos))
        } else if(pos.x == 0 && pos.y >= 2*side && pos.y < 3*side)
        {
            //E -> A
            p = shift_tile(0, -2, rotate_180(pos));
        } else if(pos.x == 0 && pos.y >= 3*side)
        {
            //D -> A
            p = shift_tile(1, -4, rotate_left(pos));
        }
    } else if(pos.dir == 3) // up
    {
        if(pos.y == 2*side && pos.x < side)
        {
            // E -> B
            p = shift_tile(0, -1, rotate_right(pos));
        } else if(pos.y == 0 && pos.x >= side && pos.x < 2*side)
        {
            // A -> D
            p = shift_tile(-2, 3, rotate_right(pos));
        } else if(pos.y == 0 && pos.x >= 2*side)
        {
            // F -> D
            p = shift_tile(-2, 4, pos);
        }
    }


    let next = iterate_pos_one(p);

    let v = lookup(next, board);
    if(v == ' ')
    {
        console.log(pos, p, next, v);
        throw `Did not expect to end outside of board ${JSON.stringify(pos)}, ${JSON.stringify(next)}, ${v}`
    }
    return [next, v];
}


const part2 = (rawInput: string) => {
    const [board, commands] = parseInput(rawInput);
    const initial_pos = {x:50, y:0, dir:0};
    const final_pos = move_sequence(initial_pos, commands, board, next_pos_and_tile_cube)
    return (final_pos.y+1)*1000 + (final_pos.x+1)*4 + final_pos.dir;
};

run({
    part1: {
        tests: [
            {
                input: `        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`,
                expected: 6032,
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
    trimTestInputs: false,
    onlyTests: false,
});
