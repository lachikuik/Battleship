/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,
        miniGridIA: null,
        winner: null,
        // liste des joueurs
        players: [],
        //etat du bateau
        isVertical: false,
        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');
            this.miniGridIA = document.querySelector('.mini-grid-2');

            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            //this.playerTurnPhaseIndex = 0;
            this.isVertical = false;
            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }
            console.log(this.currentPhase);
            switch (this.currentPhase) {
            case this.PHASE_GAME_OVER:
                // detection de la fin de partie
                if (!this.gameIsOver()) {
                    // le jeu n'est pas terminé on recommence un tour de jeu
                    console.log(this.arrayIncludesNumber(this.players[0].grid, 1))
                    this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                    utils.info("Votre tour!");
                } else {
                    utils.info(`${this.winner} a gagné !`);
                }
                break;
            case this.PHASE_INIT_PLAYER:
                utils.info("Placez vos bateaux");
                break;
            case this.PHASE_INIT_OPPONENT:
                this.wait();
                utils.info("En attente de votre adversaire");
                this.players[1].isShipOk(function () {
                    self.stopWaiting();
                    console.log(self.players[1].grid);
                    self.goNextPhase();
                });
                break;
            case this.PHASE_PLAY_PLAYER:
                utils.info("A vous de jouer, choisissez une case !");
                break;
            case this.PHASE_PLAY_OPPONENT:
                utils.info("A votre adversaire de jouer...");
                this.players[1].play();
                break;
            }

        },
        arrayIncludesNumber: function (array, number) {
            for (let i = 0;i < 10; i++) {
                if (array[i].includes(number)) {
                    return true;
                }
            }
            return false;
        },
        arrayIsCleared: function (grid, number) {
            return grid.every(row => row.every(cell => cell === number))
          },
        gameIsOver: function () {
            if (this.arrayIsCleared(this.players[0].grid, 0)) {
                this.winner = "Joueur 1";
                return true;
            }
            if (this.arrayIsCleared(this.players[1].grid, 0)) {
                this.winner = "Joueur 2";
                return true;
            }
            return false;
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
                return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('contextmenu', _.bind(this.handleRightClick, this));
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;

                }
                let height = 0;
                if (ship.getId() > 1) {
                    for (let i = 1; i < ship.getId(); i++) {
                        height += parseInt(this.players[0].fleet[this.players[0].activeShip - i].dom.style.height)
                    }
                }
                if (this.isVertical == false) {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + height) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                } else {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + height) - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE + "px";  
                }
            }
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;
            console.log(this.getPhase());
            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode), this.isVertical, this.players[0].fleet[this.players[0].activeShip])) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {

                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        } else {
                            if (this.isVertical = true) {
                                this.isVertical = false;
                                var ship = this.players[0].fleet[this.players[0].activeShip];
                                ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
                                ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                                ship.dom.style.height = "" + utils.CELL_SIZE + "px";
                                ship.dom.style.width = "" + utils.CELL_SIZE * ship.life + "px";
                            }                          
                        }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                        if (!this.players[0].fireAvailable(utils.eq(e.target.parentNode), utils.eq(e.target), this.players[0].tries)) {
                            utils.info("MM CASE");
                            return;
                        }
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                    this.players[0].renderTries(this.grid);
                }
            }
        },
        // gérer le rightclick
        handleRightClick: function (e) {
            e.preventDefault();
            if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                var ship = this.players[0].fleet[this.players[0].activeShip];
                this.isVertical == false ? this.isVertical = true : this.isVertical = false;
                let width = 0;
                let height = 0;
                if (ship.getId() > 1) {
                    for (let i = 1; i < ship.getId(); i++) {
                        width += parseInt(this.players[0].fleet[this.players[0].activeShip - i].dom.style.width);
                        height += parseInt(this.players[0].fleet[this.players[0].activeShip - i].dom.style.height)
                    }
                }
                if (this.isVertical == false) {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + height) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                    ship.dom.style.height = "" + utils.CELL_SIZE + "px";
                    ship.dom.style.width = "" + utils.CELL_SIZE * ship.life + "px";
                } else {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + height) - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE + "px";
                    ship.dom.style.height = "" + utils.CELL_SIZE * ship.life + "px";
                    ship.dom.style.width = "" + utils.CELL_SIZE + "px"; 
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                //opponent
                ? this.players[1]
                //player
                : this.players[0];


            var delay = ( function() {
                var timer = 0;  
                return function(callback, ms) {
                    clearTimeout (timer);
                    timer = setTimeout(callback, ms);
                };
            })();
            let shoot = new Audio("./audio/fire.mp3");
            shoot.play();

            delay((function(){


                if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                    msg += "Votre adversaire vous a... ";
                }

                // on demande à l'attaqué si il a un bateaux à la position visée
                // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
                target.receiveAttack(col, line, (function (hasSucceed) {
                    //let pick =  document.querySelector('.main-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')');
                if (hasSucceed) {
                    msg += "Touché !";
                    if (target === this.players[0]){
                        let underAttack =  new Audio("./audio/under_attack.mp3");
                        underAttack.play();
                    }
                } else {
                    msg += "Manqué...";
                }
                    // <div class="ship battleship active"></div>
                    // <div class="ship destroyer"></div>
                    // <div class="ship submarine"></div>
                    // <div class="ship small-ship"></div>
                let battleship = document.querySelector(".ship.battleship.active");
                let destroyer = document.querySelector(".ship.destroyer");
                let submarine = document.querySelector(".ship.submarine");
                let smallship = document.querySelector(".ship.small-ship");
                let array = [battleship, destroyer, submarine, smallship];

                for (let i = 0; i < 4; i++) {

                    if (!this.arrayIncludesNumber(this.players[0].grid, i + 1)) {
                        console.log(array[i]);
                        array[i].classList.add("sunk");
                    }
                }
                utils.info(msg);


                    if (hasSucceed) {
                        msg += "Touché !";
                        if (target === this.players[0]){
                            let underAttack =  new Audio("./audio/under_attack.mp3");
                            underAttack.play();
                        } else {
                            let hit = new Audio("./audio/Hit.mp3");
                            hit.play();
                        }
                    } else {
                        msg += "Manqué...";
                            let plouf =  new Audio("./audio/plouf.mp3");
                            plouf.play();
                    }

                    if (target.tries[col][line] != 0){
                        msg = "Au même endroit...";
                    }

                    utils.info(msg);

                    // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                    // pour transmettre à l'attaquant le résultat de l'attaque
                    callback(hasSucceed);
                    this.renderMap();

                    // on fait une petite pause avant de continuer...
                    // histoire de laisser le temps au joueur de lire les message affiché
                    setTimeout(function () {
                        self.stopWaiting();
                        self.goNextPhase();
                    }, 1000);
                }).bind(this));
                //bind de l'instance de l'objet game a la fonction receiveAttack
            }).bind(this), 3000 );
        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
            this.players[1].renderTries(this.miniGrid);
            console.log(this.players[1].grid);
        },
        renderMiniMap: function () {
            this.players[0].renderShips(this.miniGrid);
  
        },

    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());