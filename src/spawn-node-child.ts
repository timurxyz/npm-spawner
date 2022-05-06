import { spawn, ChildProcess, SpawnOptionsWithoutStdio } from 'child_process';

export type SpawnNodeChildOptions = {
  cwd?: string,
  nodeSpawnOptions?: SpawnOptionsWithoutStdio,
  onErrorEvent?: (err: Error) => void,
  onException?: (err: Error) => void,
}

export function spawnNodeChild (
  command: string,
  args: string|string[],  // args as an array of strings as per the spawn signature, or a string with space separated args
  options?: SpawnNodeChildOptions
) // @ts-ignore: the only normal return is in the try
  : ChildProcess {

  try {

    const _args = Array.isArray(args)? args : args.split(' '); // might also be null which is an object

    const childProc = spawn(
      command,
      _args,
      options?.cwd? {
          cwd: options.cwd,
          ...options.nodeSpawnOptions }
        :
        options?.nodeSpawnOptions
    );

    childProc.on('error', err =>
      options?.onErrorEvent? options.onErrorEvent(err) : onError(err)
    );

    childProc.stdout.pipe(process.stdout);
    process.stdin.pipe(childProc.stdin);

    return childProc;
  }
  catch (err) {
    options?.onException? options.onException(err as Error) : onError(err as Error);
  }

  function onError (err: Error|string) {
    console.error("Node child spawner error: ",err);
  }
}