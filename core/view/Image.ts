import {View} from "./View"
import {Context} from "../platform/Context";

export class Image extends View {

    constructor(context: Context, parentId: string) {
        super(context, "NativeImage", Image, parentId);
    }

    url(url: string) {
        this.callNative("url", url);
        return this;
    }

}
