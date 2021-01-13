import {View} from "./View"
import {Div} from "./Div";

export class Stack extends Div {

    layoutChildren(){
        var y = 0;
        var len = this._childrenIds.length;
        for (var i=0; i<len; i++) {
            var child: View = this._context.__views[this._childrenIds[i]];
            child.position({left: 0, top: y});
            y+=child._layout.height;
        }
        super.layoutChildren();
    }
}



