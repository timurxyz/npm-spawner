import { ChildProcess } from 'child_process';
import { spawnNodeChild, SpawnNodeChildOptions } from './spawn-node-child.js';

export type NpmSpawnerOptions = SpawnNodeChildOptions & {
  npm?: string,
}

export function npmSpawner (
  args: string|string[],  // args as an array of strings as per the spawn signature, or a string with space separated args
  options?: NpmSpawnerOptions
  // @ts-ignore: the only normal return is in the try
  ): ChildProcess {

  return spawnNodeChild(
      options?.npm || "npm",
      args,
      options
    );
}