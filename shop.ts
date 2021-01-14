import {Store} from "./core/service/Store";

export {Context} from "./core/platform/Context"; // for bootstrapper
import {Div} from './core/view/Div';
import {Image} from './core/view/Image';
import {Label} from './core/view/Label';
import {List} from "./core/view/List";
import {Http} from "./core/service/Http";

export class MerchantCell extends Div {

    image: Image;
    icon: Image;
    name: Label;
    offer: Label;

    body(){
        Div.New(this)
            .setBgColor("#ffffff")
            .setBounds(0,0,220,200)
            .children(()=> {
                this.image = Image.New(this)
                    .setBounds(10, 10, 200, 120)
                Image.New(this)
                    .url("https://www.cleverfocus.com/baller/tag.png")
                    .setBounds(10, 150, 20, 20)
                this.icon = Image.New(this)
                    .setBounds(20, 100, 20, 20)
                this.name = Label.New(this)
                    .setBounds(10, 132, 200, 20)
                    .font("fonts/Roboto-Regular.ttf", 14)
                this.offer = Label.New(this)
                    .setBounds(35, 151, 180, 40)
                    .font("fonts/Roboto-Regular.ttf", 9)
            })
    }

    onPopulate(i: number, parentId: string) {

        var parent = this._context.__views[parentId];
        var index = parent["_index"];
        var store = Store.Get(this);
        var merchant = store.getFromJSON("shop", "categories[$1].merchants[$2]", index, i);

        this.image.url(merchant.image + "?width=220");
        this.icon.url(merchant.icon + "?width=40");
        this.name.text(merchant.name);
        this.offer.text(merchant.offer);
    }

}

export class CategoryCell extends Div {

    _merchantList: List;
    _name: Label;

    body() {
        Div.New(this)
            .setBgColor("#ffffff")
            .setBounds(0,0,320,230)
            .children(()=> {
                this._name = Label.New(this)
                    .setBounds(10, 10, 320, 24)
                    .font("fonts/Roboto-Regular.ttf", 18)
                this._merchantList = List.New(this)
                    .setHorizontal(true)
                    .setBounds(0, 34, 320, 200)
                    .setViewSize(220, 200)
                    .setViewType(MerchantCell)
            })

    }

    onPopulate(i: number) {
        var store = Store.Get(this);
        var name = store.getFromJSON("shop", "categories[$1].name", i);
        var count = store.getArrayCount("shop", "categories[$1].merchants", i);
        this._name.text(name);
        this._merchantList["_index"] = i;
        this._merchantList.setCount(count).ready();
    }
}

export class MainView extends Div {

    _categoryList: List;

    body() {
        Http.Get(this)
            .url("https://www.cleverfocus.com/baller/shop.json")
            .storeId("shop")
            .send(this.onData, null);

            Div.New(this)
                .setBgColor("#ffffff")
                .setBounds(0, 0, 320, 800)
                .children(() => {
                    Label.New(this)
                        .text("Shop")
                        .font("fonts/Roboto-Regular.ttf", 24)
                        .setBounds(10, 10, 320, 30)
                    this._categoryList = List.New(this)
                        .setBounds(0, 40, 320, 661)
                        .setViewSize(320, 244)
                        .setViewType(CategoryCell)
                })
    }

    onData()
    {
        var store = Store.Get(this);
        var count = store.getArrayCount("shop", "categories");
        this._categoryList.setCount(count).ready();
    }

}

