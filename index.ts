export {Context} from "./core/platform/Context"; // for bootstrapper

import {Button} from "./core/view/Button";
import {Div} from './core/view/Div';
import {Image} from './core/view/Image';
import {Label} from './core/view/Label';
import {Field} from "./core/view/Field";
import {Host} from "./core/service/Host";

export class DualImage extends Div {

	bState: boolean = false;
	a: Image;
	b: Image;

	body(){
		this.a = Image.New(this)
			.setBounds(0, 0, 50, 50)
		this.b = Image.New(this)
			.setBounds(50, 0, 50, 50)
		this.update();
	}

	onUp() {
		console.log("DualImage onUp called")
		this.bState = !this.bState;
		this.update();
	}

	update()
	{
		if (this.bState) {
			this.a.url("https://www.google.com/logos/doodles/2020/december-holidays-days-2-30-6753651837108830.5-s.png")
			this.b.url("https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg")
		} else {
			this.b.url("https://www.google.com/logos/doodles/2020/december-holidays-days-2-30-6753651837108830.5-s.png")
			this.a.url("https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg")
		}
	}
}

export class MainView extends Div {

	 _input: Field;

	body()
	{
		Div.New(this)
			.setBounds(10, 10, 300, 680)
			.setBgColor("#00ff00")
			.style((type, v) => {
				switch (type) {
					case Label:
					case Field:
						v.font("fonts/Bullpen3D.ttf", 14)
						break;
				}
			})
			.children(() => {
				Div.New(this)
					.setBounds(10, 10, 100, 30)
					.setBgColor("#ff00ff")
				Image.New(this)
					.setBounds(120, 10, 60, 60)
					.url("https://images-na.ssl-images-amazon.com/images/I/811Rs3D6T%2BL._AC_UL160_.jpg")
				Label.New(this)
					.setBounds(190, 10, 60, 30)
					.text("Baller!")
				DualImage.New(this)
					.setBounds(10, 100, 100, 50)
				this._input = Field.New(this)
					.setBounds(10, 180, 200, 30)
					.text("Baller!")
				Field.New(this)
					.setBounds(10, 500, 200, 30)
					.text("Baller!")
				Button.New(this)
					.text("Next")
					.font("fonts/Bullpen3D.ttf", 14)
					.setBounds(10, 220, 140, 30)
					.clicked(()=>{
						Host.Get(this).onEvent("next", this._input.value());
						})

				Div.New(this)
					.setBounds(10, 260, 250, 150)
					.setBgColor("#ff00ff")
					.style((type, v) => {
						switch (type) {
							case Label:
								v.font("fonts/Nobile-Regular.ttf", 14)
								break;
						}
					})
					.children(() => {
						Label.New(this)
							.setBounds(10, 10, 60, 30)
							.text("Baller!")

					})

			})
	}

}

