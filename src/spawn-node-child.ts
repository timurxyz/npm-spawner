import {ChildProcess, spawn, SpawnOptionsWithoutStdio} from 'child_process';

export type SpawnNodeChildReturnT = {
  code: number|null,
  problemCollected?: Error,
  signal?: NodeJS.Signals|null
}

export type SpawnNodeChildOptions = {
  cwd?: string,  // extracted for convenience, injected to nodeSpawnOptions.cwd
  nodeSpawnOptions?: SpawnOptionsWithoutStdio,  // the standard child_process.spawnSync options
  onClose?: (
      code: SpawnNodeChildReturnT['code'],
      problemCollected?: SpawnNodeChildReturnT['problemCollected'],
      signal?: SpawnNodeChildReturnT['signal']
  ) =>void,
  // the hook on the 'close' event which will fire anyway after error/exit/problem (except the exception probably),
  // use to finalize the run and mind not to double handle events
  // expect onProblem be emitted prior to onClose
  onProblem?: (err: Error, event: 'error'|'exit') =>void,
  // the hook on the 'error' event, and also when 'exit' returns a non-zero exit code
  // also overtakes onNodeError, but not onClose and not the thrown exceptions
  onNodeError?: (err: Error, event: 'error'|'_exception') =>void,
  // ChildProcess/'error' event which belongs to execution and not to the error events with the command
  // not reachable if onProblem is specified
  // try/catch exceptions are also sent here
  noStdioInheritance?: boolean,
  // 'inherit' is the forced setting for stdio (bound to process.std*), this resets the behaviour to undefined
  suppressShellWarning?: boolean,  // mind not to make it vulnerable
  getSpawnedProc?: (childProc: ChildProcess) =>void
  // the ChildProcess event emitter returned by the child_process.spawn
}

// Consult also: https://nodejs.org/api/child_process.html#class-childprocess

export async function spawnNodeChild (
  command: string,
  args: string|string[],  // args as an array of strings as per the spawn signature, or a string with space separated args
  options?: SpawnNodeChildOptions
) // @ts-ignore: the only normal return is in the try
: Promise<SpawnNodeChildReturnT>
{

  const greeting = "Node child spawner (npm-spawner):";
  let problemCollected: Error|undefined;
  // error event may set it and the close event will return it, persistence assumed
  // @TODO fix the Error constructor problem and handle the added signal prop

  if (options?.nodeSpawnOptions?.shell && !options?.suppressShellWarning) {
    console.warn(greeting,"If the shell option is enabled, do not pass unsanitized user input to this function. " +
        "Any input containing shell metacharacters may be used to trigger arbitrary command execution.");
  }

  try {

    const _args = Array.isArray(args)? args : args.split(' '); // might also be null which is an object

    const childProc = spawn(
      command,
      _args,
      {
        cwd: options?.cwd,
        stdio: options?.noStdioInheritance? undefined: 'inherit',
        shell: false,
        ...options?.nodeSpawnOptions
      }
    );

    options?.getSpawnedProc?.(childProc);

    childProc.on('error', err => {  // not spawned, killed, or ...
      problemCollected = err;
      _onProblem('error');
    });


    childProc.on('exit', (code,signal) => {  // quasi redundant notification prior to close in many cases

      if (code !== 0 || signal !== null) { // presumably the final code returned, which close will repeat

        // @ts-ignore @TODO Error constructor type fixing
        problemCollected = new Error("Node child spawner / "+command+" exited with error code "+code, {
          cause: code,
          signal: signal
        });

        _onProblem('exit');
        if (!options?.onProblem) {
          console.warn(greeting,"/", command,"exited with code:",code);
        }
      }
    });

    childProc.on('disconnect', ()=>{});  // @TODO placeholder
    // childProc.on('message', (message,sendHandle) =>{});  // @TODO placeholder
    childProc.on('spawn', ()=>{});  // @TODO placeholder

    // @TODO implement an option to redirect streams
    // if (!options?.noStdioInheritance) {
    //
    //   childProc.stdout.pipe(process.stdout);
    //   process.stdin.pipe(childProc.stdin);
    // }

    // reject is not handled as close is the final event even if error event happened
    return await new Promise<SpawnNodeChildReturnT>(resolve => {

      childProc.on('close', (code, signal) => {
        options?.onClose?.(code, problemCollected, signal);
        resolve({code, problemCollected, signal});
        // childProc.stdin?.end();  // just in case, see Node's example
      });
    });
  }
  catch (err) {
    problemCollected = err as Error;  // @TODO convert err to Error properly
    _onNodeError('_exception');
    return Promise.reject(problemCollected);
  }

  function _onProblem (event: 'error'|'exit') {
    if (options?.onProblem) {
      options.onProblem(problemCollected as Error, event);
    } else {
      if (event==='error') {
        _onNodeError('error');
      }
    }
  }

  function _onNodeError (event: 'error'|'_exception') {
    if (options?.onNodeError) {
      options.onNodeError(problemCollected as Error,event); // @TODO is the err value guaranteed?
    } else {
      console.error(greeting,event,":",problemCollected);  // @TODO err.message rather
    }
  }
}