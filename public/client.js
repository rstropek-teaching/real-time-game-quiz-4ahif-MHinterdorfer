"use strict";
const server = io();
//gamefield
// *** 0 = water, 1 = ship, 2 = destroyed, 3 = failed *** //
let primaryGrid;
let trackingGrid;
let primaryTable;
let trackingTable;
let row = 10;
let column = 10;
//ships
const carrier = 5;
const battleship = 4;
const cruiser = 3;
const submarine = 2;
const destroyer = 1;
let stopCoordinate;
$(() => {
    $('.primary').hide();
    primaryTable = $('#primary');
    trackingTable = $('#tracking');
    primaryGrid = createGrid(row, column, primaryGrid, primaryTable);
    trackingGrid = createGrid(row, column, trackingGrid, trackingTable);
    createShip(carrier, $('#carrier'));
    createShip(battleship, $('#battleship'));
    createShip(cruiser, $('#cruiser'));
    createShip(submarine, $('#submarine'));
    createShip(destroyer, $('#destroyer'));
    trackingTable.on('click', 'td', function () {
        setShip(trackingGrid, Number(this.getAttribute('data-r')), Number(this.getAttribute('data-c')));
        drawGrid(trackingGrid, trackingTable);
    });
    primaryTable.on('click', 'td', function () {
        server.emit('attack', Number(this.getAttribute('data-r')), Number(this.getAttribute('data-c')));
        setCoordinates(Number(this.getAttribute('data-r')), Number(this.getAttribute('data-c')));
    });
    $('#done').on('click', function () {
        $('.primary').show();
        $('.ships').hide();
        $(this).hide();
    });
});
server.on('attack', (row, column) => {
    attackCoordinates(row, column);
    window.alert('empfangen');
});
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
function attackCoordinates(row, column) {
    if (trackingGrid[row][column] == 0) {
        setFailed(trackingGrid, row, column);
        drawGrid(trackingGrid, trackingTable);
    }
    if (trackingGrid[row][column] == 1) {
        setDestroyed(trackingGrid, row, column);
        drawGrid(trackingGrid, trackingTable);
    }
}
function setCoordinates(row, column) {
    if (trackingGrid[row][column] == 0) {
        setFailed(primaryGrid, row, column);
        drawGrid(primaryGrid, primaryTable);
    }
    if (trackingGrid[row][column] == 1) {
        setDestroyed(primaryGrid, row, column);
        drawGrid(primaryGrid, primaryTable);
    }
}
function createGrid(row, column, grid, table) {
    grid = [];
    for (let r = 0; r < row; r++) {
        grid[r] = [];
        const tr = $('<tr>');
        for (let c = 0; c < column; c++) {
            grid[r][c] = 0;
            $(`<td id="${table.attr('id')}">`).addClass('water').attr('data-r', r).attr('data-c', c).appendTo(tr);
        }
        tr.appendTo(table).droppable({});
    }
    return grid;
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
$('#start').on('click', () => {
    startGame($('#name').val());
});
function startGame(name) {
    sessionStorage.setItem('name', name);
    window.location.href = 'game.html';
}
