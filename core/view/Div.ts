import {View} from "./View"
import {Context} from "../platform/Context";

export class Div extends View {

    constructor(context: Context) {
        super(context, "NativeDiv", Div)
    }

    setBgColor(bgColor: string) {
        this.callNative("setBgColor", bgColor);
        return this;
    }

    onUp() {
    }
}
