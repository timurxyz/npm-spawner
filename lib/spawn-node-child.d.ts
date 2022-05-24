/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { ChildProcess, SpawnOptionsWithoutStdio } from 'node:child_process';
export declare type SpawnNodeChildReturnT = {
    code: number | null;
    problemCollected?: Error;
    signal?: NodeJS.Signals | null;
};
export declare type SpawnNodeChildOptions = {
    cwd?: string;
    nodeSpawnOptions?: SpawnOptionsWithoutStdio;
    onClose?: (code: SpawnNodeChildReturnT['code'], problemCollected?: SpawnNodeChildReturnT['problemCollected'], signal?: SpawnNodeChildReturnT['signal']) => void;
    onProblem?: (err: Error, event: 'error' | 'exit') => void;
    onNodeError?: (err: Error, event: 'error' | '_exception') => void;
    noStdioInheritance?: boolean;
    suppressShellWarning?: boolean;
    getSpawnedProc?: (childProc: ChildProcess) => void;
};
export declare function spawnNodeChild(command: string, args: string | string[], // args as an array of strings as per the spawn signature, or a string with space separated args
options?: SpawnNodeChildOptions): Promise<SpawnNodeChildReturnT>;
