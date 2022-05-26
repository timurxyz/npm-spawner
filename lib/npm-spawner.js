import { spawnNodeChild } from './spawn-node-child.js';
export async function npmSpawner(args, // args as an array of strings as per the spawn signature, or a string with space separated args
options) {
    return spawnNodeChild(options?.npm || "npm", args, options);
}
