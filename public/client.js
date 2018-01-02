"use strict";
const socket = io();
//gamefield
let primaryGrid;
let trackingGrid;
let row = 10;
let column = 10;
//ships
const carrier = 5;
const battleship = 4;
const cruiser = 3;
const submarine = 2;
const destroyer = 1;
$(() => {
    $('.primary').hide();
    const primary = $('#primary');
    const tracking = $('#tracking');
    primaryGrid = createGrid(row, column, primaryGrid, primary);
    trackingGrid = createGrid(row, column, trackingGrid, tracking);
    createShip(carrier, $('#carrier'));
    createShip(battleship, $('#battleship'));
    createShip(cruiser, $('#cruiser'));
    createShip(submarine, $('#submarine'));
    createShip(destroyer, $('#destroyer'));
    /* not sure about how i set the ships

    tracking.on('click', 'td', function () {
        setShip(trackingGrid, Number(this.getAttribute('data-r')), Number(this.getAttribute('data-c')));
        drawGrid(trackingGrid, tracking);
    });*/
    $('#done').on('click', function () {
        $('.primary').show();
        $('.ships').hide();
        $(this).hide();
    });
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
        revert: true
    });
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
        tr.appendTo(table).droppable();
    }
    return grid;
}
function drawGrid(grid, table) {
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < column; c++) {
            if (grid[r][c] == 0) {
                $(`td[data-r=${r}][data-c=${c}][id='${table.attr('id')}']`).removeClass('ship').addClass('water');
            }
            if (grid[r][c] == 1) {
                $(`td[data-r=${r}][data-c=${c}][id=${table.attr('id')}]`).removeClass('water').addClass('ship');
            }
        }
    }
}
function setWater(grid, row, column) {
    grid[row][column] = 0; //water
}
function setShip(grid, row, column) {
    grid[row][column] = 1; //ship
}
$('#start').on('click', () => {
    startGame($('#name').val());
});
function startGame(name) {
    sessionStorage.setItem('name', name);
    window.location.href = 'game.html';
}
