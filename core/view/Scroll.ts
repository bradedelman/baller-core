import {View} from "./View"
import {Context} from "../platform/Context";

export class Scroll extends View {

    constructor(context: Context, parentId: string) {
        super(context, "NativeScroll", Scroll, parentId);
    }

    layoutChildren() {
        super.layoutChildren();

        // give native a chance too
        this.callNative("layoutChildren");
    }
}

