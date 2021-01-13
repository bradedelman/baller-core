// NOTE: using raw Objects for __views and __viewTypes because dukTape doesn't implement Map

export class Context {

    _native: Object;
    _nextViewId: number = 1;
    __views = {};
    __viewTypes = {};
    _currentParent: string; // if it starts with # then it's an integer View id after that (enables easier UI build pattern)

    constructor(native: Object) {
        this._native = native;
    }

    registerViewType(viewType:any) {
        let viewTypeName = viewType.name;
        this.__viewTypes[viewTypeName] = viewType;
        return viewTypeName;
    }

    create(viewTypeId: string):void {
        let type = this.__viewTypes[viewTypeId];
        let view = type.Create(this);
        return view._id;
    }

    call(id: string, method: string, ...args: any[]) {
        let view = this.__views[id];
        // @ts-ignore
        return view[method](...args);
    }

    children(func: Object, parent: string) {
        let save = this._currentParent;
        this._currentParent = parent;
        // @ts-ignore
        let result = func();
        this._currentParent = save;
        return result;
    }
}
