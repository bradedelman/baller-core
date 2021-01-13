import {View} from "./View"
import {Context} from "../platform/Context";

export class Button extends View {

    _handler: Function;

    constructor(context: Context) {
        super(context, "NativeButton", Button);
    }

    text(text: string) {
        this.callNative("text", text);
        return this;
    }

    font(url: string, size: number) {
        this.callNative("font", url, size);
        return this;
    }

    clicked(handler: Function) {
        this._handler = handler;
        return this;
    }

    onClick() {
        if (this._handler) {
            this._handler();
        }
    }
}



