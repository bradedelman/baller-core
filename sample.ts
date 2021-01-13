export {Context} from "./core/platform/Context"; // for bootstrapper

import {Label} from "./core/view/Label";
import {Div} from "./core/view/Div";
import {List} from "./core/view/List";

class Cell extends Div {

	a: Label;

	body() {
		this.a = Label.New(this)
			.setBounds(5, 5, 290, 30)
	}

	onPopulate(i: number) {
		let colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
		this.setBgColor(colors[i%colors.length]);
		this.a.text("Item " + i);
	}
}

export class MainView extends Div {

	body() {

		Label.New(this)
			.setBounds(10, 10, 300, 30)
			.text("Hello Baller!")

		List.New(this)
			.setBounds(10, 50, 300, 400)
			.setViewSize(300, 40)
			.setViewType(Cell)
			.setCount(1000)
			.ready()

	}

}
