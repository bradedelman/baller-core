import {View} from "./View"
import {Context} from "../platform/Context";

export class Label extends View {

    constructor(context: Context, parentId: string) {
        super(context, "NativeLabel", Label, parentId);
    }

    text(text: string) {
        this.callNative("text", text);
        return this;
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



