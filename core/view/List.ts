import {View} from "./View"
import {Context} from "../platform/Context";

export class List extends View {

    constructor(context: Context) {
        super(context, "NativeList", List);
    }

    setHorizontal(bHorizontal: boolean)
    {
        this.callNative("setHorizontal", bHorizontal);
        return this;
    }

    setViewSize(width: number, height: number)
    {
        this.callNative("setViewSize", width, height);
        return this;
    }

    setViewType(viewType: any)
    {
        this.callNative("setViewType", this._context.registerViewType(viewType));
        return this;
    }

    setCount(count: number)
    {
        this.callNative("setCount", count);
        return this;
    }

    ready()
    {
        this.callNative("ready");
        return this;
    }

}


