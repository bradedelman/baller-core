import {View} from "./View"
import {Context} from "../platform/Context";

export class Field extends View {

    constructor(context: Context, parentId: string) {
        super(context, "NativeField", Field, parentId);
    }

    text(text: string) {
        this.callNative("text", text);
        return this;
    }

    value() {
        return this.callNative("value");
    }

    fontFace(url: string, bSystem: boolean = false) {
        this.callNative("fontFace", url, bSystem);
        return this;
    }

    fontSize(size: number) {
        this.callNative("fontSize", size);
        return this;
    }

}



