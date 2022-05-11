[![npm version](https://badge.fury.io/js/npm-spawner.svg)](https://badge.fury.io/js/npm-spawner)

This async TS/JS code is to programmatically execute/fork external/shell commands and npm/yarn scripts from Node. The major assumed case is smart repo maintenance, running npm/yarn/pnpm scripts, when your Node app/script launches a script from ``package.json`` like ``yarn deploy:moduleX`` -- hence the ``npm-spawner`` package name. Also it provides a general mean (``spawnNodeChild``) to execute anything the async (standard version) ``spawn`` method of the Node's ``child_process`` can. In a callback/event handler/hook fashion it exposes the events, the ``ChildProcess`` event emitter itself and returns a promise to the final status of the execution (a less detailed one than the spawnSync version would). 

> In Node ``spawn`` is the variant of ``exec`` that one would use for external processes emitting stuff to stdio. This by default does not create a shell so is less vulnerable.

### Motivation

The reason is to circumvent "The programmatic API was removed in npm v8.0.0" problem. The other motivation was to find a workaround with the current state of the 'concurrently' module when recursive use of it resulted in loss of stdout.

### Usage examples

```typescript
errors.build6 = false;
greeting = "Repo manager: building module #6";
await npmSpawner( "run build:module-6", {
    npm: "yarn",    // may you prefer yarn over npm
    onProblem: (err,event) => { // 'problem', since it's not necesseraly an error
        errors.build6 = true;
        console.warn(greeting,"failed on",event,"and says:",err.message);
    },
    onClose: code => console.log(greeting,"closed with:",code),
});
if (!errors.build6) {
    await npmSpawner( "run depoloy");
} 
```

You also get a more general "spawner", ``spawnNodeChild`` for launching any system command or binary:
```typescript
const {code:testResult} = await spawnNodeChild(
    "test", // the command-line unix utility
    "-f $FILENAME42",   // the args, which can now be in space-separated normal form
    {
        cwd: process.cwd(), // redundant, just illustrating the separate cwd option
        suppressShellWarning: true,
        nodeSpawnOptions: {
            shell: true,  // executing shell commands require a child shell many times
            env: {
                ...process.env,
                FILENAME42: "package.json"
            },
        }
    }
);
console.log("Package.json:",testResult===0? "exists.":"is missing or we otherwise failed to test it.");

```

### Explainer 

* ```spawnNodeChild``` (and the ``npmSpawner`` which just wraps the former) are using the normal async version of ``child_process.spawn``, or rather convert the '``spawn():<ChildProcess>`` + event hooks' model to the ``async`` form, so it's more intuitive to use while the benefits of lifecycle events are still available via the ``ChildProcess`` event hooks.
* When not awaiting, the execution will take the async/concurrent flow. And the ``ChildProcess`` event emitter is available from the ``getSpawnedProc`` callback (the emitter otherwise returned by the ``child_process.spawn``).
* Unlike with pure ``spawn`` you can provide args as a space-separated single string.
* The resolved returned shape holds the 'exit' ``code`` (returned by the ``close`` event), the signal if terminated and the error/problem code if previously exit or error events dropped one.
* Note: this package delivers a pure ``ESM`` module.
* By default ``stdin``,``stdout`` and ``stderr`` are inherited from the calling Node process.
* ``shell`` is by default set to false, and if enabled one needs to set an additional flag to mute a warning reminding us about the vulnarable nature of this choice.

### Shapes



```typescript
async function spawnNodeChild (
  command: string,
  args: string|string[],  // args as an array of strings as per the spawn signature, or a string with space separated args
  options?: SpawnNodeChildOptions
): Promise<SpawnNodeChildReturnT>

async function npmSpawner (
  args: string|string[],  // args as an array of strings as per the spawn signature, or a string with space separated args
  options?: NpmSpawnerOptions
): Promise<SpawnNodeChildReturnT>

type SpawnNodeChildReturnT = {
  code: number|null,
  problemCollected?: Error,
  signal?: NodeJS.Signals|null
}

type SpawnNodeChildOptions = {
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
}

type NpmSpawnerOptions = SpawnNodeChildOptions & {
    npm?: string, // lets you specify 'yarn'
}
```

> "If the ``shell`` option is enabled, do not pass unsanitized user input to this function. Any input containing shell metacharacters may be used to trigger arbitrary command execution."
> 
Consult also: https://nodejs.org/api/child_process.html#class-childprocess

### Security

* This module uses no dependencies except Node itself. The small code is simple to review.
* The functionality it opens up may have serious security implications so implement carefully and submit for code review by a competent person (eg. security engineer/champion or pentester).
* If the use case remains within the frame of local CLI then exposing utilities/scripts via this code will not extend the existing risks (as compared to the user launching codes via npm/node directly).
* If this code bridges access to the machine hosted scripts (running with local user privileges) from a webinterface available from the outside then containment (jailing), strict user authentication and security code review is necessary.

### Feedback
* issue submission
* twitter: timurxyz
