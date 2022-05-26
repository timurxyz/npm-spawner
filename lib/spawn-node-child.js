import { spawn } from 'node:child_process';
// Consult also: https://nodejs.org/api/child_process.html#class-childprocess
export async function spawnNodeChild(command, args, // args as an array of strings as per the spawn signature, or a string with space separated args
options) {
    const greeting = "Node child spawner (npm-spawner):";
    let problemCollected;
    // error event may set it and the close event will return it, persistence assumed
    // @TODO fix the Error constructor problem and handle the added signal prop
    if (options?.nodeSpawnOptions?.shell && !options?.suppressShellWarning) {
        console.warn(greeting, "If the shell option is enabled, do not pass unsanitized user input to this function. " +
            "Any input containing shell metacharacters may be used to trigger arbitrary command execution.");
    }
    try {
        const _args = Array.isArray(args) ? args : args.split(' '); // might also be null which is an object
        const childProc = spawn(command, _args, {
            cwd: options?.cwd,
            stdio: options?.noStdioInheritance ? undefined : 'inherit',
            shell: false,
            ...options?.nodeSpawnOptions
        });
        options?.getSpawnedProc?.(childProc);
        childProc.on('error', err => {
            problemCollected = err;
            _onProblem('error');
        });
        childProc.on('exit', (code, signal) => {
            if (code !== 0 || signal !== null) { // presumably the final code returned, which close will repeat
                // @ts-ignore @TODO Error constructor type fixing
                problemCollected = new Error("Node child spawner / " + command + " exited with error code " + code, {
                    cause: code,
                    signal: signal
                });
                _onProblem('exit');
                if (!options?.onProblem) {
                    console.warn(greeting, "/", command, "exited with code:", code);
                }
            }
        });
        childProc.on('disconnect', () => { }); // @TODO placeholder
        // childProc.on('message', (message,sendHandle) =>{});  // @TODO placeholder
        childProc.on('spawn', () => { }); // @TODO placeholder
        // @TODO implement an option to redirect streams
        // if (!options?.noStdioInheritance) {
        //
        //   childProc.stdout.pipe(process.stdout);
        //   process.stdin.pipe(childProc.stdin);
        // }
        // reject is not handled as close is the final event even if error event happened
        return await new Promise(resolve => {
            childProc.on('close', (code, signal) => {
                options?.onClose?.(code, problemCollected, signal);
                resolve({ code, problemCollected, signal });
                // childProc.stdin?.end();  // just in case, see Node's example
            });
        });
    }
    catch (err) {
        problemCollected = err; // @TODO convert err to Error properly
        _onNodeError('_exception');
        return Promise.reject(problemCollected);
    }
    function _onProblem(event) {
        if (options?.onProblem) {
            options.onProblem(problemCollected, event);
        }
        else {
            if (event === 'error') {
                _onNodeError('error');
            }
        }
    }
    function _onNodeError(event) {
        if (options?.onNodeError) {
            options.onNodeError(problemCollected, event); // @TODO is the err value guaranteed?
        }
        else {
            console.error(greeting, event, ":", problemCollected); // @TODO err.message rather
        }
    }
}
