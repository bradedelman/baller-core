import {Context} from "../platform/Context";
import {View} from "../view/View";

export class Host {
    _context: Context;

    static Get(view: View) {
        const that = new Host();
        that._context = view._context;
        return that;
    }

    onEvent(name: string, a: any)
    {
        this._context._native["callAPI2"]("NativeHost", "onEvent", name, a);
    }

}
