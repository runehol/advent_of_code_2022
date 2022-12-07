import run from "aocrunner";
import _, { size } from 'lodash';

interface Interaction
{
    command: string[];
    response: string[][];
}
const parseInput = (rawInput: string) : Interaction[] => 
{
    const commands = rawInput.split("\n$ ").slice(1);
    return (_(commands)
    .map(cmd => 
        {
            const all_lines = cmd.split("\n").map(ln => ln.split(" "));
            return {command: all_lines[0], response: all_lines.slice(1)}
        })
    ).value()
}

interface File
{
    name: string;
    size: number;
}

interface Directory
{
    name: string;
    path: string;
    sub_directories: Directory[];
    files: File[]; 
}

const make_dir = (name: string, parent?: Directory) : Directory => 
{
    let path = parent !== undefined ? parent.path + "/" + name : name;
    if(path.startsWith("//")) path = path.slice(1);
    return {
        name,
        path,
        sub_directories: [],
        files: []
    }
}

const record_interaction = ({command, response} : Interaction, dir_stack: Directory[]) : void =>
{
    const curr_dir = dir_stack[dir_stack.length-1];
    const verb = command[0];
    switch(verb)
    {
        case "ls":
            response.forEach(entry => {
                const [dir_or_size, name] = entry;
                if(dir_or_size == "dir")
                {
                    curr_dir.sub_directories.push(make_dir(name, curr_dir))
                } else {
                    const size = parseInt(dir_or_size);
                    curr_dir.files.push({name, size});
                }
            });
            break;
        case "cd":
            const dest = command[1];
            if(dest == "..")
            {
                dir_stack.pop();
            } else {
                const cand = curr_dir.sub_directories.filter((dir) => dir.name == dest);
                if(cand.length != 1) throw `Cannot find subdirectory ${dest} while in ${JSON.stringify(curr_dir)}`;
                dir_stack.push(cand[0]);
            }
        
    }
}

const build_directory_structure = (interactions: Interaction[]) : Directory =>
{
    const root = make_dir("/");
    let dir_stack = [root];
    interactions.forEach(interaction => {
        record_interaction(interaction, dir_stack);
    });
    return root;
}

const recursive_find_sizes = (curr_dir: Directory, map: Map<string, number>) : number =>
{
    let size = 0;
    size += _(curr_dir.sub_directories).map(dir => recursive_find_sizes(dir, map)).sum();
    size += _(curr_dir.files).map(file => file.size).sum();

    map.set(curr_dir.name, size);
    return size;
}

const find_sizes = (root: Directory) : Map<string, number> =>
{
    let size_map = new Map<string, number>;
    recursive_find_sizes(root, size_map);
    return size_map;
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const structure = build_directory_structure(input);
    const size_map = find_sizes(structure);
    const size_entries = Array.from(size_map.entries());
    return _(size_entries).filter(e => e[1] <= 100000).map(e => e[1]).sum();
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const structure = build_directory_structure(input);
    const size_map = find_sizes(structure);
    const size_entries = Array.from(size_map.entries());
    const total_size = size_map.get("/");
    if(total_size === undefined) throw "no size for root dir";
    const curr_free = 70000000 - total_size;
    const desired_free = 30000000;
    const need_to_free = desired_free - curr_free;
    size_entries.sort((a, b) => a[1] - b[1]);
    const filtered_size_entries = size_entries.filter(e => e[1] >= need_to_free);
    return filtered_size_entries[0][1];

};

run({
    part1: {
        tests: [
            {
                input: `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`,
                expected: 95437,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`,
                expected: 24933642,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
