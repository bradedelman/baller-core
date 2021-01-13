import {View} from "./View"
import {Context} from "../platform/Context";

export class Label extends View {

    constructor(context: Context) {
        super(context, "NativeLabel", Label);
    }

    text(text: string) {
        this.callNative("text", text);
        return this;
    }

    font(url: string, size: number) {
        this.callNative("font", url, size);
        return this;
    }
}



