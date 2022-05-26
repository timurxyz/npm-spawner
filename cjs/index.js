var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  npmSpawner: () => npmSpawner,
  spawnNodeChild: () => spawnNodeChild
});
module.exports = __toCommonJS(src_exports);

// src/spawn-node-child.ts
var import_node_child_process = require("node:child_process");
async function spawnNodeChild(command, args, options) {
  const greeting = "Node child spawner (npm-spawner):";
  let problemCollected;
  if (options?.nodeSpawnOptions?.shell && !options?.suppressShellWarning) {
    console.warn(greeting, "If the shell option is enabled, do not pass unsanitized user input to this function. Any input containing shell metacharacters may be used to trigger arbitrary command execution.");
  }
  try {
    const _args = Array.isArray(args) ? args : args.split(" ");
    const childProc = (0, import_node_child_process.spawn)(command, _args, {
      cwd: options?.cwd,
      stdio: options?.noStdioInheritance ? void 0 : "inherit",
      shell: false,
      ...options?.nodeSpawnOptions
    });
    options?.getSpawnedProc?.(childProc);
    childProc.on("error", (err) => {
      problemCollected = err;
      _onProblem("error");
    });
    childProc.on("exit", (code, signal) => {
      if (code !== 0 || signal !== null) {
        problemCollected = new Error("Node child spawner / " + command + " exited with error code " + code, {
          cause: code,
          signal
        });
        _onProblem("exit");
        if (!options?.onProblem) {
          console.warn(greeting, "/", command, "exited with code:", code);
        }
      }
    });
    childProc.on("disconnect", () => {
    });
    childProc.on("spawn", () => {
    });
    return await new Promise((resolve) => {
      childProc.on("close", (code, signal) => {
        options?.onClose?.(code, problemCollected, signal);
        resolve({ code, problemCollected, signal });
      });
    });
  } catch (err) {
    problemCollected = err;
    _onNodeError("_exception");
    return Promise.reject(problemCollected);
  }
  function _onProblem(event) {
    if (options?.onProblem) {
      options.onProblem(problemCollected, event);
    } else {
      if (event === "error") {
        _onNodeError("error");
      }
    }
  }
  function _onNodeError(event) {
    if (options?.onNodeError) {
      options.onNodeError(problemCollected, event);
    } else {
      console.error(greeting, event, ":", problemCollected);
    }
  }
}

// src/npm-spawner.ts
async function npmSpawner(args, options) {
  return spawnNodeChild(options?.npm || "npm", args, options);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  npmSpawner,
  spawnNodeChild
});
