import {View} from "./View"
import {Context} from "../platform/Context";

export class Field extends View {

    constructor(context: Context) {
        super(context, "NativeField", Field);
    }

    text(text: string) {
        this.callNative("text", text);
        return this;
    }

    value() {
        return this.callNative("value");
    }

    font(url: string, size: number) {
        this.callNative("font", url, size);
        return this;
    }
}



