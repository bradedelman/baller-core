import {View} from "./View"
import {Context} from "../platform/Context";

export class Div extends View {

    constructor(context: Context, parentId: string) {
        super(context, "NativeDiv", Div, parentId)
    }

    setBgColor(bgColor: string) {
        this.callNative("setBgColor", bgColor);
        return this;
    }

    onUp() {
    }
}
