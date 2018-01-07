"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const server = io();
const row = 10;
const column = 10;
//Ships
const carrier = 5;
const battleship = 4;
const cruiser = 3;
const submarine = 2;
const destroyer = 1;
const allShips = (carrier + battleship + cruiser + submarine + destroyer);
//Game-Grids
let primaryGrid;
let trackingGrid;
let primaryTable;
let trackingTable;
let turns = 0;
let hits = 0;
let allowed;
let setShips = true;
$('index.html').ready(() => {
    $('#start').on('click', () => {
        sessionStorage.setItem('name', String($('#name').val()));
        window.location.href = 'game.html';
    });
});
$(() => {
    init();
    trackingTable.on('click', 'td', function () {
        if (setShips) {
            setShip(trackingGrid, Number(this.getAttribute('data-r')), Number(this.getAttribute('data-c')));
            drawGrid(trackingGrid, trackingTable);
        }
    });
    $('#done').on('click', function () {
        allowed = true;
        setShips = false;
        $('.primary').show();
        $('.ships').hide();
        $(this).hide();
    });
    primaryTable.on('click', 'td', function () {
        if (allowed)
            server.emit('attack', Number(this.getAttribute('data-r')), Number(this.getAttribute('data-c')));
    });
});
//Server-Events
server.on('attack', (row, column) => {
    attackCoordinates(row, column);
});
server.on('attackResult', (result, row, column) => {
    primaryGrid[row][column] = result;
    setCoordinates(row, column);
    if (hits == allShips) {
        setWinner();
    }
});
server.on('won', (winnerName, winnerTurns) => {
    window.alert(sessionStorage.getItem('name') + ', you lost after ' + turns + ' turns.');
});
function init() {
    $('.primary').hide();
    primaryTable = $('#primary');
    trackingTable = $('#tracking');
    primaryGrid = createGrid(primaryGrid, primaryTable);
    trackingGrid = createGrid(trackingGrid, trackingTable);
    createShip(carrier, $('#carrier'));
    createShip(battleship, $('#battleship'));
    createShip(cruiser, $('#cruiser'));
    createShip(submarine, $('#submarine'));
    createShip(destroyer, $('#destroyer'));
}
//Init-Functions
function createGrid(grid, table) {
    grid = [];
    for (let r = 0; r < row; r++) {
        grid[r] = [];
        const tr = $('<tr>');
        for (let c = 0; c < column; c++) {
            grid[r][c] = 0;
            $(`<td id="${table.attr('id')}">`).addClass('water').attr('data-r', r).attr('data-c', c).appendTo(tr);
        }
        tr.appendTo(table); //make droppable
    }
    return grid;
}
function createShip(length, grid) {
    const tr = $('<tr>');
    for (let r = 0; r < length; r++) {
        $(`<td id="${grid.attr('id')}">`).addClass('ship').appendTo(tr);
    }
    tr.appendTo(grid);
    //make the ships draggable inside the tracking grid
    grid.draggable({
        containment: '#tracking',
        cursor: 'move',
        stack: '#tracking',
        revert: true,
    });
}
function drawGrid(grid, table) {
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < column; c++) {
            if (grid[r][c] == 0) {
                $(`td[data-r=${r}][data-c=${c}][id='${table.attr('id')}']`).removeClass().addClass('water');
            }
            else if (grid[r][c] == 1) {
                $(`td[data-r=${r}][data-c=${c}][id=${table.attr('id')}]`).removeClass().addClass('ship');
            }
            else if (grid[r][c] == 2) {
                $(`td[data-r=${r}][data-c=${c}][id=${table.attr('id')}]`).removeClass().addClass('destroyed');
            }
            else if (grid[r][c] == 3) {
                $(`td[data-r=${r}][data-c=${c}][id=${table.attr('id')}]`).removeClass().addClass('failed');
            }
        }
    }
}
//Setter
function setWater(grid, row, column) {
    grid[row][column] = 0;
}
function setShip(grid, row, column) {
    grid[row][column] = 1;
}
function setDestroyed(grid, row, column) {
    grid[row][column] = 2;
}
function setFailed(grid, row, column) {
    grid[row][column] = 3;
}
function setWinner() {
    window.alert(sessionStorage.getItem('name') + ', you won after ' + turns + ' turns.');
    server.emit('won', sessionStorage.getItem('name'), turns);
    allowed = false;
}
//Game-Functions
function attackCoordinates(row, column) {
    if (trackingGrid[row][column] == 0) {
        setFailed(trackingGrid, row, column);
        drawGrid(trackingGrid, trackingTable);
        server.emit('attackResult', 0, row, column);
        allowed = true;
    }
    if (trackingGrid[row][column] == 1) {
        setDestroyed(trackingGrid, row, column);
        drawGrid(trackingGrid, trackingTable);
        server.emit('attackResult', 1, row, column);
        allowed = false;
    }
}
function setCoordinates(row, column) {
    turns++;
    if (primaryGrid[row][column] == 0) {
        setFailed(primaryGrid, row, column);
        drawGrid(primaryGrid, primaryTable);
        allowed = false;
    }
    if (primaryGrid[row][column] == 1) {
        setDestroyed(primaryGrid, row, column);
        drawGrid(primaryGrid, primaryTable);
        hits++;
        allowed = true;
    }
}
function listHighscores() {
    (function () {
        return __awaiter(this, void 0, void 0, function* () {
            const highscores = yield $.get('http://localhost:8080/api/highscores');
            let html = '<tr><td>fett</td></tr>';
            for (const highscore of highscores.result) {
                html += `<tr> <td> ${highscore.name} </td> <td> ${highscore.turns}`;
            }
            $('#highscoreBody')[0].innerHTML = html;
        });
    })();
}
