import { SpawnNodeChildOptions, SpawnNodeChildReturnT } from './spawn-node-child.js';
export declare type NpmSpawnerOptions = SpawnNodeChildOptions & {
    npm?: string;
};
export declare function npmSpawner(args: string | string[], // args as an array of strings as per the spawn signature, or a string with space separated args
options?: NpmSpawnerOptions): Promise<SpawnNodeChildReturnT>;
