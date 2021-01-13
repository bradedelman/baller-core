import {View} from "./View"
import {Context} from "../platform/Context";

export class Image extends View {

    constructor(context: Context) {
        super(context, "NativeImage", Image);
    }

    url(url: string) {
        this.callNative("url", url);
        return this;
    }

}
