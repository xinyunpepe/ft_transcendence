export class Rectangle {
	constructor(public ctx: CanvasRenderingContext2D, private width: number, private height: number, public xPos: number, public yPos: number) {}

	draw(color: string) {
		// if (this.xPos < 0 || this.yPos < 0)
		// 	return ;
		// console.log('draw: ' + this.yPos.toString() + ' ' + this.height.toString());
    	this.ctx.fillStyle = color;
		// console.log(this.xPos.toString() + ' ' + this.yPos.toString() + ' ' + this.width.toString() + ' ' + this.height.toString());
    	this.ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
  	}

	clean() {
		// if (this.xPos < 0 || this.yPos < 0)
		// 	return ;
		// console.log('clean: ' + this.yPos.toString() + ' ' + this.height.toString());
		this.ctx.clearRect(this.xPos, this.yPos, this.width, this.height);
	}

	clean2(x:number, y:number, w:number, h:number) {
		this.ctx.clearRect(x, y, w, h);
	}

}