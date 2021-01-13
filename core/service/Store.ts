import {Context} from "../platform/Context";
import {View} from "../view/View";

export class Store {
    _context: Context;

    static Get(view: View) {
        const that = new Store();
        that._context = view._context;
        return that;
    }

    set(key: string, value: object)
    {
        this._context._native.callAPI2("NativeStore", "set", key, JSON.stringify(value));
    }

    get(key: string)
    {
        return JSON.parse(this._context._native.callAPI1("NativeStore", "get", key))
    }

    getArrayCount(key: string, path: string, ...args: any[])
    {
        var payload = {
            _path: path,
            _args: args
        }
        return this._context._native.callAPI2("NativeStore", "getArrayCount", key, JSON.stringify(payload));
    }

    getFromJSON(key: string, path: string, ...args: any[])
    {
        var payload = {
            _path: path,
            _args: args
        }
        return JSON.parse(this._context._native.callAPI2("NativeStore", "getFromJSON", key, JSON.stringify(payload)));
    }

}
