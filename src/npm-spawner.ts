import {spawnNodeChild, SpawnNodeChildOptions, SpawnNodeChildReturnT} from './spawn-node-child.js';

export type NpmSpawnerOptions = SpawnNodeChildOptions & {
  npm?: string, // let's you specify 'yarn'
}

export async function npmSpawner (
  args: string|string[],  // args as an array of strings as per the spawn signature, or a string with space separated args
  options?: NpmSpawnerOptions
)
: Promise<SpawnNodeChildReturnT>
{

  return spawnNodeChild(
      options?.npm || "npm",
      args,
      options
    );
}