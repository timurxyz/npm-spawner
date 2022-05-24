var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  npmSpawner: () => npmSpawner,
  spawnNodeChild: () => spawnNodeChild
});
module.exports = __toCommonJS(src_exports);

// src/spawn-node-child.ts
var import_node_child_process = require("node:child_process");
function spawnNodeChild(command, args, options) {
  return __async(this, null, function* () {
    var _a, _b;
    const greeting = "Node child spawner (npm-spawner):";
    let problemCollected;
    if (((_a = options == null ? void 0 : options.nodeSpawnOptions) == null ? void 0 : _a.shell) && !(options == null ? void 0 : options.suppressShellWarning)) {
      console.warn(greeting, "If the shell option is enabled, do not pass unsanitized user input to this function. Any input containing shell metacharacters may be used to trigger arbitrary command execution.");
    }
    try {
      const _args = Array.isArray(args) ? args : args.split(" ");
      const childProc = (0, import_node_child_process.spawn)(command, _args, __spreadValues({
        cwd: options == null ? void 0 : options.cwd,
        stdio: (options == null ? void 0 : options.noStdioInheritance) ? void 0 : "inherit",
        shell: false
      }, options == null ? void 0 : options.nodeSpawnOptions));
      (_b = options == null ? void 0 : options.getSpawnedProc) == null ? void 0 : _b.call(options, childProc);
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
          if (!(options == null ? void 0 : options.onProblem)) {
            console.warn(greeting, "/", command, "exited with code:", code);
          }
        }
      });
      childProc.on("disconnect", () => {
      });
      childProc.on("spawn", () => {
      });
      return yield new Promise((resolve) => {
        childProc.on("close", (code, signal) => {
          var _a2;
          (_a2 = options == null ? void 0 : options.onClose) == null ? void 0 : _a2.call(options, code, problemCollected, signal);
          resolve({ code, problemCollected, signal });
        });
      });
    } catch (err) {
      problemCollected = err;
      _onNodeError("_exception");
      return Promise.reject(problemCollected);
    }
    function _onProblem(event) {
      if (options == null ? void 0 : options.onProblem) {
        options.onProblem(problemCollected, event);
      } else {
        if (event === "error") {
          _onNodeError("error");
        }
      }
    }
    function _onNodeError(event) {
      if (options == null ? void 0 : options.onNodeError) {
        options.onNodeError(problemCollected, event);
      } else {
        console.error(greeting, event, ":", problemCollected);
      }
    }
  });
}

// src/npm-spawner.ts
function npmSpawner(args, options) {
  return __async(this, null, function* () {
    return spawnNodeChild((options == null ? void 0 : options.npm) || "npm", args, options);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  npmSpawner,
  spawnNodeChild
});
