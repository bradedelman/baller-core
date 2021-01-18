import {View} from "../view/View";
import {Context} from "../platform/Context";

class HttpInfo {
    _verb: string;
    _url: string;
    _headers: object;
    _body: string;
    _storeId: string;

    // for callbacks
    _viewId: string;
    _onSuccess: string
    _onError: string
}

export class Http {
    static _nextRequestId: number = 1;

    _context: Context;
    _view: View;
    _requestId: number;
    _info: HttpInfo = new HttpInfo();

    static New(view: View) {
        const that = new Http();
        that._context = view._context;
        that._view = view;
        that._info._viewId = view._id;
        that._requestId = Http._nextRequestId++;
        return that;
    }

    static Get(view: View) {
        const that = Http.New(view);
        that._info._verb = "GET"
        return that;
    }

    static Post(view: View) {
        const that = Http.New(view);
        that._info._verb = "POST"
        return that;
    }

    url(url: string) {
        this._info._url = url;
        return this;
    }

    headers(headers: object) {
        this._info._headers = headers;
        return this;
    }

    storeId(id: string) {
        this._info._storeId = id;
        return this;
    }

    body(body: string) {
        this._info._body = body;
    }

    send(onSuccess: Function, onError: Function) {

        if (onSuccess) onSuccess = onSuccess.bind(this._view);
        if (onError) onError = onError.bind(this._view);

        // some magic to map dynamic callbacks (no name available) to a  name
        var successCallback = "@HttpSuccess" + this._requestId;
        var errorCallback = "@HttpError" + this._requestId;
        var removeOneTimeUseCallbacks = () =>
        {
            delete this._view[successCallback]; // called once and then removed
            delete this._view[errorCallback]; // called once and then removed
        }
        this._view[successCallback] = (data) => {
            removeOneTimeUseCallbacks();
            if (onSuccess) {
                onSuccess(data);
            }
            return 0;
        }
        this._view[errorCallback] = (data) => {
            removeOneTimeUseCallbacks();
            if (onError) {
                onError(data);
            }
            return 0;
        }

        this._info._onSuccess = successCallback;
        this._info._onError = errorCallback;
        var payload = JSON.stringify(this._info);
        this._context._native["callAPI1"]("NativeHttp", "send", payload);
    }

}