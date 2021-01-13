var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// NOTE: using raw Objects for __views and __viewTypes because dukTape doesn't implement Map
define("core/platform/Context", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Context = void 0;
    var Context = /** @class */ (function () {
        function Context(native) {
            this._nextViewId = 1;
            this.__views = {};
            this.__viewTypes = {};
            this._native = native;
        }
        Context.prototype.registerViewType = function (viewType) {
            var viewTypeName = viewType.name;
            this.__viewTypes[viewTypeName] = viewType;
            return viewTypeName;
        };
        Context.prototype.create = function (viewTypeId) {
            var type = this.__viewTypes[viewTypeId];
            var view = type.Create(this);
            return view._id;
        };
        Context.prototype.call = function (id, method) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var view = this.__views[id];
            // @ts-ignore
            return view[method].apply(view, args);
        };
        Context.prototype.children = function (func, parent) {
            var save = this._currentParent;
            this._currentParent = parent;
            // @ts-ignore
            var result = func();
            this._currentParent = save;
            return result;
        };
        return Context;
    }());
    exports.Context = Context;
});
define("core/view/View", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.View = void 0;
    var LayoutInfo = /** @class */ (function () {
        function LayoutInfo() {
            this.width = 0;
            this.height = 0;
            // use only 1 of these 3
            this.left = 0;
            // use only 1 of these 3
            this.top = 0;
            // computed
            this.x = 0;
            this.y = 0;
        }
        return LayoutInfo;
    }());
    var View = /** @class */ (function () {
        function View(context, type, viewType) {
            this._layout = new LayoutInfo();
            this._context = context;
            this._childrenIds = [];
            this._id = "#" + (this._context._nextViewId++);
            this._context.__views[this._id] = this;
            this._context._native["callAPI2"]("NativeHost", "create", type, this._id);
            this._viewType = this._context.registerViewType(viewType);
            this.children(this.body.bind(this));
        }
        View.New = function (view) {
            var that = new this(view._context);
            view._context._native["callAPI2"]("NativeHost", "addChild", view._context._currentParent, that._id);
            that._parentId = view._context._currentParent;
            var parent = that._context.__views[that._parentId];
            if (parent) {
                parent._childrenIds.push(that._id);
            }
            // process cascadng styles (deepest ancestor first)
            function doStyle(v) {
                var parent = v._context.__views[v._parentId];
                if (parent) {
                    doStyle(parent);
                }
                if (v["_style"]) {
                    v["_style"](that._context.__viewTypes[that._viewType], that);
                }
            }
            doStyle(that);
            return that;
        };
        View.Create = function (context) {
            var that = new this(context);
            return that;
        };
        View.prototype.style = function (style) {
            this._style = style;
            return this;
        };
        View.prototype.body = function () {
        };
        View.prototype.callNative = function (method) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            switch (args.length) {
                case 0: return this._context._native["call0"](this._id, method);
                case 1: return this._context._native["call1"](this._id, method, args[0]);
                case 2: return this._context._native["call2"](this._id, method, args[0], args[1]);
                case 3: return this._context._native["call3"](this._id, method, args[0], args[1], args[2]);
                case 4: return this._context._native["call4"](this._id, method, args[0], args[1], args[2], args[3]);
                case 5: return this._context._native["call5"](this._id, method, args[0], args[1], args[2], args[3], args[4]);
                case 6: return this._context._native["call6"](this._id, method, args[0], args[1], args[2], args[3], args[4], args[5]);
            }
        };
        View.prototype.setBounds = function (x, y, w, h) {
            this.size(w, h);
            this.position({ left: x, top: y });
            this.callNative("setBounds", x, y, w, h); // TODO: figure out why Web List View assumes this
            return this;
        };
        View.prototype.size = function (width, height) {
            this._layout.width = width;
            this._layout.height = height;
            return this;
        };
        View.prototype.position = function (p) {
            // use just 1 of left, right, center, if provided - override previous values
            if (p["left"] !== undefined) {
                this._layout.left = p["left"];
                this._layout.right = undefined;
                this._layout.center = undefined;
            }
            else if (p["right"] !== undefined) {
                this._layout.left = undefined;
                this._layout.right = p["right"];
                this._layout.center = undefined;
            }
            else if (p["center"] !== undefined) {
                this._layout.left = undefined;
                this._layout.right = undefined;
                this._layout.center = p["center"];
            }
            // use just 1 of top, bottom, vcenter, if provided - override previous values
            if (p["top"] !== undefined) {
                this._layout.top = p["top"];
                this._layout.bottom = undefined;
                this._layout.vcenter = undefined;
            }
            else if (p["bottom"] !== undefined) {
                this._layout.top = undefined;
                this._layout.bottom = p["bottom"];
                this._layout.vcenter = undefined;
            }
            else if (p["vcenter"] !== undefined) {
                this._layout.top = undefined;
                this._layout.bottom = undefined;
                this._layout.vcenter = p["vcenter"];
            }
            return this;
        };
        View.prototype.children = function (func) {
            this._context.children(func.bind(this), this._id);
            return this;
        };
        // from native when ready
        View.prototype.doLayout = function (width, height) {
            this.setBounds(0, 0, width, height);
            this.layoutChildrenOuter();
        };
        View.prototype.layoutChildren = function () {
            // for subclasses to override for further or different logic
            var len = this._childrenIds.length;
            for (var i = 0; i < len; i++) {
                var child = this._context.__views[this._childrenIds[i]];
                // do left last, as it's default case
                if (child._layout.right !== undefined) {
                    child._layout.x = this._layout.width - child._layout.width + child._layout.right;
                }
                else if (child._layout.center !== undefined) {
                    child._layout.x = (this._layout.width - child._layout.width) / 2 + child._layout.center;
                }
                else {
                    child._layout.x = 0;
                    if (child._layout.left !== undefined) {
                        child._layout.x += child._layout.left;
                    }
                }
                // do top last, as it's default case
                if (child._layout.bottom !== undefined) {
                    child._layout.y = this._layout.height - child._layout.height + child._layout.bottom;
                }
                else if (child._layout.vcenter !== undefined) {
                    child._layout.y = (this._layout.height - child._layout.height) / 2 + child._layout.vcenter;
                }
                else {
                    child._layout.y = 0;
                    if (child._layout.top !== undefined) {
                        child._layout.y += child._layout.top;
                    }
                }
            }
        };
        View.prototype.layoutChildrenOuter = function () {
            this.layoutChildren(); // for subclasses to override
            // apply natively
            var len = this._childrenIds.length;
            for (var i = 0; i < len; i++) {
                var child = this._context.__views[this._childrenIds[i]];
                child.callNative("setBounds", child._layout.x, child._layout.y, child._layout.width, child._layout.height);
                child.layoutChildrenOuter();
            }
        };
        return View;
    }());
    exports.View = View;
});
define("core/view/Label", ["require", "exports", "core/view/View"], function (require, exports, View_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Label = void 0;
    var Label = /** @class */ (function (_super) {
        __extends(Label, _super);
        function Label(context) {
            return _super.call(this, context, "NativeLabel", Label) || this;
        }
        Label.prototype.text = function (text) {
            this.callNative("text", text);
            return this;
        };
        Label.prototype.font = function (url, size) {
            this.callNative("font", url, size);
            return this;
        };
        return Label;
    }(View_1.View));
    exports.Label = Label;
});
define("core/view/Div", ["require", "exports", "core/view/View"], function (require, exports, View_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Div = void 0;
    var Div = /** @class */ (function (_super) {
        __extends(Div, _super);
        function Div(context) {
            return _super.call(this, context, "NativeDiv", Div) || this;
        }
        Div.prototype.setBgColor = function (bgColor) {
            this.callNative("setBgColor", bgColor);
            return this;
        };
        Div.prototype.onUp = function () {
        };
        return Div;
    }(View_2.View));
    exports.Div = Div;
});
define("core/view/List", ["require", "exports", "core/view/View"], function (require, exports, View_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.List = void 0;
    var List = /** @class */ (function (_super) {
        __extends(List, _super);
        function List(context) {
            return _super.call(this, context, "NativeList", List) || this;
        }
        List.prototype.setHorizontal = function (bHorizontal) {
            this.callNative("setHorizontal", bHorizontal);
            return this;
        };
        List.prototype.setViewSize = function (width, height) {
            this.callNative("setViewSize", width, height);
            return this;
        };
        List.prototype.setViewType = function (viewType) {
            this.callNative("setViewType", this._context.registerViewType(viewType));
            return this;
        };
        List.prototype.setCount = function (count) {
            this.callNative("setCount", count);
            return this;
        };
        List.prototype.ready = function () {
            this.callNative("ready");
            return this;
        };
        return List;
    }(View_3.View));
    exports.List = List;
});
define("sample", ["require", "exports", "core/platform/Context", "core/view/Label", "core/view/Div", "core/view/List"], function (require, exports, Context_1, Label_1, Div_1, List_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainView = exports.Context = void 0;
    Object.defineProperty(exports, "Context", { enumerable: true, get: function () { return Context_1.Context; } });
    var Cell = /** @class */ (function (_super) {
        __extends(Cell, _super);
        function Cell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Cell.prototype.body = function () {
            this.a = Label_1.Label.New(this)
                .setBounds(5, 5, 290, 30);
        };
        Cell.prototype.onPopulate = function (i) {
            var colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
            this.setBgColor(colors[i % colors.length]);
            this.a.text("Item " + i);
        };
        return Cell;
    }(Div_1.Div));
    var MainView = /** @class */ (function (_super) {
        __extends(MainView, _super);
        function MainView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MainView.prototype.body = function () {
            Label_1.Label.New(this)
                .setBounds(10, 10, 300, 30)
                .text("Hello Baller!");
            List_1.List.New(this)
                .setBounds(10, 50, 300, 400)
                .setViewSize(300, 40)
                .setViewType(Cell)
                .setCount(1000)
                .ready();
        };
        return MainView;
    }(Div_1.Div));
    exports.MainView = MainView;
});
