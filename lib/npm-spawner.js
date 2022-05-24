var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawnNodeChild } from './spawn-node-child.js';
export function npmSpawner(args, // args as an array of strings as per the spawn signature, or a string with space separated args
options) {
    return __awaiter(this, void 0, void 0, function* () {
        return spawnNodeChild((options === null || options === void 0 ? void 0 : options.npm) || "npm", args, options);
    });
}
