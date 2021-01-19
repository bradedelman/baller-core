import {Context} from "../platform/Context";

type StaticThis<T> = { new (context: any, parentId: string): T };

class LayoutInfo {
    width: number = 0;
    height: number = 0;

    // use only 1 of these 3
    left: number = 0;
    right: number;
    center: number;

    // use only 1 of these 3
    top: number = 0;
    bottom: number;
    vcenter: number;

    // computed
    x: number = 0;
    y: number = 0;
}

export class View {

    _context: Context;
    _id: string;
    _parentId: string;
    _viewType: string;
    _style: Function;
    _childrenIds: string[];
    _layout: LayoutInfo = new LayoutInfo();
    _tags: {};

    static New<T extends View>(this: StaticThis<T>, view: View) {
        const that = new this(view._context, view._context._currentParent);
        view._context._native["callAPI2"]("NativeHost", "addChild", view._context._currentParent, that._id);
        var parent = that._context.__views[that._parentId];
        if (parent) {
            parent._childrenIds.push(that._id);
        }
        return that;
    }

    static Create<T extends View>(this: StaticThis<T>, context: Context, parentId: string) {
        const that = new this(context, parentId);
        // NOTE: For Create, we don't add to children list or do the native addChild - either top level, or layout is managed by Collection
        return that;
    }

    static applyStyle(that: View) {

        // process cascadng styles (deepest ancestor first)
        function doStyle(v)
        {
            var parent =  v._context.__views[v._parentId];
            if (parent) {
                doStyle(parent);
            }
            v.style(that._context.__viewTypes[that._viewType], that);
        }
        doStyle(that);
    }

    constructor(context: Context, type: string, viewType:any, parentId: string) {
        this._context = context;
        this._parentId = parentId;
        this._childrenIds = [];
        this._id = "#" + (this._context._nextViewId++);
        this._context.__views[this._id] = this;
        this._context._native["callAPI2"]("NativeHost", "create", type, this._id);
        this._viewType = this._context.registerViewType(viewType)
        View.applyStyle(this);
        this.children(this.body.bind(this));
    }

    style(viewType: any, view: View)
    {
    }

    body()
    {
    }

    tag(n: string)
    {
        this._context._tags[n] = this._id;
        return this;
    }

    getTag(n: string)
    {
        if (this._tags && this._tags[n]) {
            return this._context.__views[this._tags[n]];
        }

        if (this._parentId) {
            return this._context.__views[this._parentId].getTag(n);
        }

        return null;
    }

    callNative(method: string, ...args: any[]) {
        switch (args.length) {
            case 0: return this._context._native["call0"](this._id, method);
            case 1: return this._context._native["call1"](this._id, method, args[0]);
            case 2: return this._context._native["call2"](this._id, method, args[0], args[1]);
            case 3: return this._context._native["call3"](this._id, method, args[0], args[1], args[2]);
            case 4: return this._context._native["call4"](this._id, method, args[0], args[1], args[2], args[3]);
            case 5: return this._context._native["call5"](this._id, method, args[0], args[1], args[2], args[3], args[4]);
            case 6: return this._context._native["call6"](this._id, method, args[0], args[1], args[2], args[3], args[4], args[5]);
        }
    }

    setBounds(x: number, y: number, w: number, h:number) {
        this.size(w, h);
        this.position({left: x, top: y});
        this.callNative("setBounds", x, y, w, h); // TODO: figure out why Web List View assumes this
        return this;
    }

    size(width: number, height: number) {
        this._layout.width = width;
        this._layout.height = height;
        return this;
    }

    position(p: Object) {
        // use just 1 of left, right, center, if provided - override previous values
        if (p["left"] !== undefined) {
            this._layout.left = p["left"];
            this._layout.right = undefined;
            this._layout.center = undefined;
        } else if (p["right"] !== undefined) {
            this._layout.left = undefined;
            this._layout.right = p["right"];
            this._layout.center = undefined;
        } else if (p["center"] !== undefined) {
            this._layout.left = undefined;
            this._layout.right = undefined;
            this._layout.center = p["center"];
        }

        // use just 1 of top, bottom, vcenter, if provided - override previous values
        if (p["top"] !== undefined) {
            this._layout.top = p["top"];
            this._layout.bottom = undefined;
            this._layout.vcenter = undefined;
        } else if (p["bottom"] !== undefined) {
            this._layout.top = undefined;
            this._layout.bottom = p["bottom"];
            this._layout.vcenter = undefined;
        } else if (p["vcenter"] !== undefined) {
            this._layout.top = undefined;
            this._layout.bottom = undefined;
            this._layout.vcenter = p["vcenter"];
        }
        return this;
    }

    children(func: Function) {
        this._context.children(func.bind(this), this._id);
	    return this;
	}

	// from native when ready
    doLayout(width: number, height: number) {
        this.setBounds(0, 0, width, height);
        this.layoutChildrenOuter()
    }

    layoutChildren(){
        // for subclasses to override for further or different logic
        var len = this._childrenIds.length;
        for (var i=0; i<len; i++) {
            var child: View = this._context.__views[this._childrenIds[i]];

            // do left last, as it's default case
            if (child._layout.right !== undefined) {
                child._layout.x = this._layout.width - child._layout.width + child._layout.right;
            } else if (child._layout.center !== undefined) {
                child._layout.x = (this._layout.width - child._layout.width) / 2 + child._layout.center;
            } else {
                child._layout.x = 0;
                if (child._layout.left !== undefined) {
                    child._layout.x += child._layout.left;
                }
            }

            // do top last, as it's default case
            if (child._layout.bottom !== undefined) {
                child._layout.y = this._layout.height - child._layout.height + child._layout.bottom;
            } else if (child._layout.vcenter !== undefined) {
                child._layout.y = (this._layout.height - child._layout.height) / 2 + child._layout.vcenter;
            } else {
                child._layout.y = 0;
                if (child._layout.top !== undefined) {
                    child._layout.y += child._layout.top;
                }
            }
        }
    }

    layoutChildrenOuter() {

        this.layoutChildren(); // for subclasses to override

        // apply natively
        var len = this._childrenIds.length;
        for (var i=0; i<len; i++) {
            var child: View = this._context.__views[this._childrenIds[i]];
            child.callNative("setBounds", child._layout.x, child._layout.y, child._layout.width, child._layout.height);
            child.layoutChildrenOuter();
        }
    }
}
