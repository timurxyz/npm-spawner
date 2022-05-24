/// <reference types="node" />
/// <reference types="node" />
declare module "spawn-node-child" {
    import { ChildProcess, SpawnOptionsWithoutStdio } from 'node:child_process';
    export type SpawnNodeChildReturnT = {
        code: number | null;
        problemCollected?: Error;
        signal?: NodeJS.Signals | null;
    };
    export type SpawnNodeChildOptions = {
        cwd?: string;
        nodeSpawnOptions?: SpawnOptionsWithoutStdio;
        onClose?: (code: SpawnNodeChildReturnT['code'], problemCollected?: SpawnNodeChildReturnT['problemCollected'], signal?: SpawnNodeChildReturnT['signal']) => void;
        onProblem?: (err: Error, event: 'error' | 'exit') => void;
        onNodeError?: (err: Error, event: 'error' | '_exception') => void;
        noStdioInheritance?: boolean;
        suppressShellWarning?: boolean;
        getSpawnedProc?: (childProc: ChildProcess) => void;
    };
    export function spawnNodeChild(command: string, args: string | string[], // args as an array of strings as per the spawn signature, or a string with space separated args
    options?: SpawnNodeChildOptions): Promise<SpawnNodeChildReturnT>;
}
declare module "npm-spawner" {
    import { SpawnNodeChildOptions, SpawnNodeChildReturnT } from "spawn-node-child";
    export type NpmSpawnerOptions = SpawnNodeChildOptions & {
        npm?: string;
    };
    export function npmSpawner(args: string | string[], // args as an array of strings as per the spawn signature, or a string with space separated args
    options?: NpmSpawnerOptions): Promise<SpawnNodeChildReturnT>;
}
declare module "index" {
    export { npmSpawner, NpmSpawnerOptions } from "npm-spawner";
    export { spawnNodeChild } from "spawn-node-child";
    export type { SpawnNodeChildOptions, SpawnNodeChildReturnT } from "spawn-node-child";
}
