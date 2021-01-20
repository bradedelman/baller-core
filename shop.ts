export {Context} from "./core/platform/Context"; // for bootstrapper

import {View} from "./core/view/View";
import {Div} from './core/view/Div';
import {Image} from './core/view/Image';
import {Label} from './core/view/Label';
import {List} from "./core/view/List";
import {Http} from "./core/service/Http";
import {Store} from "./core/service/Store";

export class MerchantCell extends Div {

    body(){
        Div.New(this)
            .setBgColor("#ffffff")
            .setBounds(0,0,220,200)
            .children(()=> {
                Image.New(this)
                    .setBounds(10, 10, 200, 120)
                    .tag("image")
                Image.New(this)
                    .url("https://www.cleverfocus.com/baller/tag.png")
                    .setBounds(10, 150, 20, 20)
                Image.New(this)
                    .setBounds(20, 100, 20, 20)
                    .tag("icon")
                Label.New(this)
                    .setBounds(10, 132, 200, 20)
                    .fontSize(14)
                    .tag("name")
                Label.New(this)
                    .setBounds(35, 151, 180, 40)
                    .fontSize(9)
                    .tag("offer")
            })
    }

    onPopulate(i: number, parentId: string) {

        var index = this.getInfo();
        var store = Store.Get(this);
        var merchant = store.getFromJSON("shop", "categories[$1].merchants[$2]", index, i);

        this.getTag("image").url(merchant.image + "?width=220");
        this.getTag("icon").url(merchant.icon + "?width=40");
        this.getTag("name").text(merchant.name);
        this.getTag("offer").text(merchant.offer);
    }

}

export class CategoryCell extends Div {

    body() {
        Div.New(this)
            .setBgColor("#ffffff")
            .setBounds(0,0,320,230)
            .children(()=> {
                Label.New(this)
                    .setBounds(10, 10, 320, 24)
                    .fontSize(18)
                    .tag("name")
                List.New(this)
                    .setHorizontal(true)
                    .setBounds(0, 34, 320, 200)
                    .setViewSize(220, 200)
                    .setViewType(MerchantCell)
                    .tag("merchantList")
            })

    }

    onPopulate(i: number) {
        var store = Store.Get(this);
        var name = store.getFromJSON("shop", "categories[$1].name", i);
        var count = store.getArrayCount("shop", "categories[$1].merchants", i);

        this.getTag("name").text(name);
        this.getTag("merchantList").info(i);
        this.getTag("merchantList").setCount(count).ready();
    }
}

export class MainView extends Div {

    style(viewType: any, view: View) {
        switch (viewType) {
            case Label:
                (view as Label).fontFace("fonts/Roboto-Regular.ttf", true);
                break;
        }
    };

    body() {
        Http.Get(this)
            .url("https://s3.amazonaws.com/www.cleverfocus.com/baller/shop.json")
            .storeId("shop")
            .send(this.onData, null);

        Div.New(this)
            .setBgColor("#ffffff")
            .setBounds(0, 0, 320, 800)
            .children(() => {
                Label.New(this)
                    .text("Shop")
                    .fontSize(24)
                    .setBounds(10, 10, 320, 30)
                List.New(this)
                    .setBounds(0, 40, 320, 661)
                    .setViewSize(320, 244)
                    .setViewType(CategoryCell)
                    .tag("categoryList")
            })
    }

    onData()
    {
        var store = Store.Get(this);
        var count = store.getArrayCount("shop", "categories");
        this.getTag("categoryList").setCount(count).ready();
    }

}

