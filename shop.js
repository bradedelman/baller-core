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
            this._tags = {};
            this._native = native;
        }
        Context.prototype.registerViewType = function (viewType) {
            var viewTypeName = viewType.name;
            this.__viewTypes[viewTypeName] = viewType;
            return viewTypeName;
        };
        Context.prototype.create = function (viewTypeId) {
            this._tags = {};
            var type = this.__viewTypes[viewTypeId];
            var view = type.Create(this);
            view._tags = this._tags;
            this._tags = {};
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
        View.prototype.tag = function (n) {
            this._context._tags[n] = this._id;
            return this;
        };
        View.prototype.getTag = function (n) {
            if (this._tags && this._tags[n]) {
                return this._context.__views[this._tags[n]];
            }
            if (this._parentId) {
                return this._context.__views[this._parentId].getTag(n);
            }
            return null;
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
define("core/view/Div", ["require", "exports", "core/view/View"], function (require, exports, View_1) {
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
    }(View_1.View));
    exports.Div = Div;
});
define("core/view/Image", ["require", "exports", "core/view/View"], function (require, exports, View_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Image = void 0;
    var Image = /** @class */ (function (_super) {
        __extends(Image, _super);
        function Image(context) {
            return _super.call(this, context, "NativeImage", Image) || this;
        }
        Image.prototype.url = function (url) {
            this.callNative("url", url);
            return this;
        };
        return Image;
    }(View_2.View));
    exports.Image = Image;
});
define("core/view/Label", ["require", "exports", "core/view/View"], function (require, exports, View_3) {
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
    }(View_3.View));
    exports.Label = Label;
});
define("core/view/List", ["require", "exports", "core/view/View"], function (require, exports, View_4) {
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
    }(View_4.View));
    exports.List = List;
});
define("core/service/Http", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Http = void 0;
    var HttpInfo = /** @class */ (function () {
        function HttpInfo() {
        }
        return HttpInfo;
    }());
    var Http = /** @class */ (function () {
        function Http() {
            this._info = new HttpInfo();
        }
        Http.New = function (view) {
            var that = new Http();
            that._context = view._context;
            that._view = view;
            that._info._viewId = view._id;
            that._requestId = Http._nextRequestId++;
            return that;
        };
        Http.Get = function (view) {
            var that = Http.New(view);
            that._info._verb = "GET";
            return that;
        };
        Http.Post = function (view) {
            var that = Http.New(view);
            that._info._verb = "POST";
            return that;
        };
        Http.prototype.url = function (url) {
            this._info._url = url;
            return this;
        };
        Http.prototype.headers = function (headers) {
            this._info._headers = headers;
            return this;
        };
        Http.prototype.storeId = function (id) {
            this._info._storeId = id;
            return this;
        };
        Http.prototype.body = function (body) {
            this._info._body = body;
        };
        Http.prototype.send = function (onSuccess, onError) {
            var _this = this;
            if (onSuccess)
                onSuccess = onSuccess.bind(this._view);
            if (onError)
                onError = onError.bind(this._view);
            // some magic to map dynamic callbacks (no name available) to a  name
            var successCallback = "@HttpSuccess" + this._requestId;
            var errorCallback = "@HttpError" + this._requestId;
            var removeOneTimeUseCallbacks = function () {
                delete _this._view[successCallback]; // called once and then removed
                delete _this._view[errorCallback]; // called once and then removed
            };
            this._view[successCallback] = function (data) {
                removeOneTimeUseCallbacks();
                if (onSuccess) {
                    onSuccess(data);
                }
                return 0;
            };
            this._view[errorCallback] = function (data) {
                removeOneTimeUseCallbacks();
                if (onError) {
                    onError(data);
                }
                return 0;
            };
            this._info._onSuccess = successCallback;
            this._info._onError = errorCallback;
            var payload = JSON.stringify(this._info);
            this._context._native["callAPI1"]("NativeHttp", "send", payload);
        };
        Http._nextRequestId = 1;
        return Http;
    }());
    exports.Http = Http;
});
define("core/service/Store", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Store = void 0;
    var Store = /** @class */ (function () {
        function Store() {
        }
        Store.Get = function (view) {
            var that = new Store();
            that._context = view._context;
            return that;
        };
        Store.prototype.set = function (key, value) {
            this._context._native["callAPI2"]("NativeStore", "set", key, JSON.stringify(value));
        };
        Store.prototype.get = function (key) {
            return JSON.parse(this._context._native["callAPI1"]("NativeStore", "get", key));
        };
        Store.prototype.getArrayCount = function (key, path) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var payload = {
                _path: path,
                _args: args
            };
            return this._context._native["callAPI2"]("NativeStore", "getArrayCount", key, JSON.stringify(payload));
        };
        Store.prototype.getFromJSON = function (key, path) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var payload = {
                _path: path,
                _args: args
            };
            return JSON.parse(this._context._native["callAPI2"]("NativeStore", "getFromJSON", key, JSON.stringify(payload)));
        };
        return Store;
    }());
    exports.Store = Store;
});
define("shop", ["require", "exports", "core/platform/Context", "core/view/Div", "core/view/Image", "core/view/Label", "core/view/List", "core/service/Http", "core/service/Store"], function (require, exports, Context_1, Div_1, Image_1, Label_1, List_1, Http_1, Store_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainView = exports.CategoryCell = exports.MerchantCell = exports.Context = void 0;
    Object.defineProperty(exports, "Context", { enumerable: true, get: function () { return Context_1.Context; } });
    var MerchantCell = /** @class */ (function (_super) {
        __extends(MerchantCell, _super);
        function MerchantCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MerchantCell.prototype.body = function () {
            var _this = this;
            Div_1.Div.New(this)
                .setBgColor("#ffffff")
                .setBounds(0, 0, 220, 200)
                .children(function () {
                Image_1.Image.New(_this)
                    .setBounds(10, 10, 200, 120)
                    .tag("image");
                Image_1.Image.New(_this)
                    .url("https://www.cleverfocus.com/baller/tag.png")
                    .setBounds(10, 150, 20, 20);
                Image_1.Image.New(_this)
                    .setBounds(20, 100, 20, 20)
                    .tag("icon");
                Label_1.Label.New(_this)
                    .setBounds(10, 132, 200, 20)
                    .font("fonts/Roboto-Regular.ttf", 14)
                    .tag("name");
                Label_1.Label.New(_this)
                    .setBounds(35, 151, 180, 40)
                    .font("fonts/Roboto-Regular.ttf", 9)
                    .tag("offer");
            });
        };
        MerchantCell.prototype.onPopulate = function (i, parentId) {
            var parent = this._context.__views[parentId];
            var index = parent["_index"];
            var store = Store_1.Store.Get(this);
            var merchant = store.getFromJSON("shop", "categories[$1].merchants[$2]", index, i);
            this.getTag("image").url(merchant.image + "?width=220");
            this.getTag("icon").url(merchant.icon + "?width=40");
            this.getTag("name").text(merchant.name);
            this.getTag("offer").text(merchant.offer);
        };
        return MerchantCell;
    }(Div_1.Div));
    exports.MerchantCell = MerchantCell;
    var CategoryCell = /** @class */ (function (_super) {
        __extends(CategoryCell, _super);
        function CategoryCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CategoryCell.prototype.body = function () {
            var _this = this;
            Div_1.Div.New(this)
                .setBgColor("#ffffff")
                .setBounds(0, 0, 320, 230)
                .children(function () {
                Label_1.Label.New(_this)
                    .setBounds(10, 10, 320, 24)
                    .font("fonts/Roboto-Regular.ttf", 18)
                    .tag("name");
                List_1.List.New(_this)
                    .setHorizontal(true)
                    .setBounds(0, 34, 320, 200)
                    .setViewSize(220, 200)
                    .setViewType(MerchantCell)
                    .tag("merchantList");
            });
        };
        CategoryCell.prototype.onPopulate = function (i) {
            var store = Store_1.Store.Get(this);
            var name = store.getFromJSON("shop", "categories[$1].name", i);
            var count = store.getArrayCount("shop", "categories[$1].merchants", i);
            this.getTag("name").text(name);
            this.getTag("merchantList")["_index"] = i;
            this.getTag("merchantList").setCount(count).ready();
        };
        return CategoryCell;
    }(Div_1.Div));
    exports.CategoryCell = CategoryCell;
    var MainView = /** @class */ (function (_super) {
        __extends(MainView, _super);
        function MainView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MainView.prototype.body = function () {
            var _this = this;
            Http_1.Http.Get(this)
                .url("https://www.cleverfocus.com/baller/shop.json")
                .storeId("shop")
                .send(this.onData, null);
            Div_1.Div.New(this)
                .setBgColor("#ffffff")
                .setBounds(0, 0, 320, 800)
                .children(function () {
                Label_1.Label.New(_this)
                    .text("Shop")
                    .font("fonts/Roboto-Regular.ttf", 24)
                    .setBounds(10, 10, 320, 30);
                List_1.List.New(_this)
                    .setBounds(0, 40, 320, 661)
                    .setViewSize(320, 244)
                    .setViewType(CategoryCell)
                    .tag("categoryList");
            });
        };
        MainView.prototype.onData = function () {
            var store = Store_1.Store.Get(this);
            var count = store.getArrayCount("shop", "categories");
            this.getTag("categoryList").setCount(count).ready();
        };
        return MainView;
    }(Div_1.Div));
    exports.MainView = MainView;
});
