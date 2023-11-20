/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var ship = {dom: {parentNode: {removeChild: function () {}}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        setGame: function (truc) {
            this.game = truc;

        },

        isShipOk : function(bidule) {
            console.log(bidule);
        },

        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            console.log(col + '' + line);
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;

            if (this.grid[line][col] !== 0) {
                succeed = true;
                this.grid[line][col] = 0;
            }
            callback.call(undefined, succeed);
        },
        fireAvailable: function(x, y, grid) {
            if (grid[x][y] === 0) {
                return true;
            }
            return false;
        },
        setActiveShipPosition: function (x, y, isVertical, ship) {
            var i = 0;
            if (isVertical == false) {
                if (ship.getLife() % 2 == 0) {
                    if (x - Math.floor(ship.getLife() / 2) < 0 || x + 1 > 9) {
                        utils.info("Le bateau doit etre dans la grille !");
                        return false;
                    }
                    for (let i = - Math.floor(ship.getLife() / 2); i < Math.floor(ship.getLife() / 2); i++) {
                        if (x + i <= 9) {
                            if (this.grid[y][x + i] != 0 ) {
                                utils.info("Case deja utilisée");
                                return false;
                            }
                        }
                        
                    }
                } else {
                    if (x - Math.floor(ship.getLife() / 2) < 0 || x + Math.floor(ship.getLife() / 2) > 9) {
                        utils.info("Le bateau doit etre dans la grille !");
                        return false;
                    }
                    for (let i = - Math.floor(ship.getLife() / 2); i <= Math.floor(ship.getLife() / 2); i++) {
                        if (x + i <= 9) {
                            if (this.grid[y][x + i] != 0 ) {
                                utils.info("Case deja utilisée");
                                return false;
                            }
                        }
                        
                    }
                }
                while (i < ship.getLife()) {
                    this.grid[y][x + i - Math.floor(ship.getLife() / 2)] = ship.getId();
                    i += 1;
                }
            } else if (isVertical == true) {
                if (ship.getLife() % 2  == 0) {
                    if (y - Math.floor(ship.getLife() / 2) < 0 || y + 1 > 9) {
                        utils.info("Le bateau doit etre dans la grille !");
                        return false;
                    }
                    for (let i = - Math.floor(ship.getLife() / 2); i < Math.floor(ship.getLife() / 2); i++) {
                        if (y + i <= 9) {
                            if (this.grid[y + i][x] != 0 ) {
                                utils.info("Case deja utilisée");
                                return false;
                            }
                        }
                        
                    }
                } else {
                    if (y - Math.floor(ship.getLife() / 2) < 0 || y + Math.floor(ship.getLife() / 2) > 9) {
                        utils.info("Le bateau doit etre dans la grille !");
                        return false;
                    }
                    for (let i = - Math.floor(ship.getLife() / 2); i <= Math.floor(ship.getLife() / 2); i++) {
                        if (y + i <= 9) {
                            if (this.grid[y + i][x] != 0 ) {
                                utils.info("Case deja utilisée");
                                return false;
                            }
                        }
                        
                    }
                }
                
                while (i < ship.getLife()) {
                    this.grid[y + i - Math.floor(ship.getLife() / 2)][x] = ship.getId();
                    console.log(ship.getId());
                    i += 1;
                }
            }
            return true;
        },
        
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');

                    if (val === true) {
                        node.style.backgroundColor = 'yellow';
                    } else if (val === false) {
                        node.style.backgroundColor = '#aeaeae';
                    }
                });
            });
        },

        renderShips: function (grid) {
            this.grid.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                    if (val == 1) {
                        node.style.backgroundColor = refType[shipFactory.TYPE_BATTLESHIP].color;
                    } else if (val == 2) {
                        node.style.backgroundColor = refType[shipFactory.TYPE_DESTROYER].color;
                    } else if (val == 3) {
                        node.style.backgroundColor = refType[shipFactory.TYPE_SUBMARINE].color;
                    }  else if (val == 4) {
                        node.style.backgroundColor = refType[shipFactory.TYPE_SMALL_SHIP].color;
                    }
                });
            });
        }
    };

    global.player = player;

}(this));