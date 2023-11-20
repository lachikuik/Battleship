/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        play: function () {
            var self = this;
            setTimeout(function () {
                let loop = "";
                // let x = -1;
                do {
                    // x++;
                    // let y = 0;
                    let x = self.randomizer("number");
                    let y = self.randomizer("number");
                    console.log(x + " " + y)
                    if (self.fireAvailable(x, y, self.tries)) {
                        //console.log(self.fireAvailable(y,x))
                        loop = "finished";
                        self.game.fire(this, y, x, function (hasSucced) {
                            self.tries[x][y] = hasSucced;
                        })
                    }
                } while (loop != "finished");
            }, 2000);
        },
        isShipOk: function (callback) {
            var j;
            this.fleet.forEach(function (ship) {
                j = 0;
                let loop = "";
                do {
                    let x = this.randomizer("number");
                    let y = this.randomizer("number");
                    let isVertical = this.randomizer("bool");
                    if (this.setActiveShipPosition(x, y, isVertical, ship)) {
                        j = ship.life
                        loop = "finished";
                    }
                } while (loop != "finished")
                // this.miniGrid = document.querySelector('.mini-grid');
                // computer.renderShips(this.miniGrid);
            }, this);


            setTimeout(function () {
                callback();
            }, 500);
            return true;
        },
        randomizer: function (type) {
            var random_boolean = Math.random() < 0.5;
            var random_number = Math.floor(Math.random() * (10 - 0));
            return type == "bool" ? random_boolean : random_number;

        }
    });

    global.computer = computer;

}(this));