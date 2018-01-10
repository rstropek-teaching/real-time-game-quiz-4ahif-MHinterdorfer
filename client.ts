declare const io: SocketIOStatic;
const server = io();

const row: number = 10;
const column: number = 10;

//Ships
const carrier: number = 5;
const battleship: number = 4;
const cruiser: number = 3;
const submarine: number = 2;
const destroyer: number = 1;
const allShips: number = (carrier + battleship + cruiser + submarine + destroyer);

//Game-Grids
let primaryGrid: number[][];
let trackingGrid: number[][];
let primaryTable: JQuery<HTMLElement>;
let trackingTable: JQuery<HTMLElement>;

let turns: number = 0;
let hits: number = 0;
let allowed: boolean;
let setShips: boolean = true;


$('index.html').ready(() => {
    $('#userNameMandatory').hide();
    let valid = false;
    $('#start').prop('disabled', true);

    $(document).change(() => {
        let userName = $('#userName').val();
        if (userName === "") {
            $('#userNameMandatory').show();
            valid = false;
        } else {
            $('#userNameMandatory').hide();
            valid = true;
        }
        if (valid) {
            $('#start').prop('disabled', false);
        } else {
            $('#start').prop('disabled', true);
        }
    });

    $('#start').on('click', () => {
        sessionStorage.setItem('name', String($('#userName').val()));
        window.location.href = 'game.html';
    });
});

$(() => {
    init();
    $('#instruction').text('Set your Ships!');
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
        $('#instruction').hide();
        $(this).hide();
        $('#counter').show();
    });

    primaryTable.on('click', 'td', function () {
        if (allowed) server.emit('attack', Number(this.getAttribute('data-r')), Number(this.getAttribute('data-c')));
    });
});

//Server-Events
server.on('attack', (row: number, column: number) => {
    attackCoordinates(row, column);
});

server.on('attackResult', (result: number, row: number, column: number) => {
    primaryGrid[row][column] = result;
    setCoordinates(row, column);
    if (hits == allShips) {
        setWinner();
    }
});

server.on('won', (winnerName: string, winnerTurns: number) => {
    window.alert(sessionStorage.getItem('name') + ', you lost after ' + turns + ' turns.');
});


function init() {
    $('.primary').hide();
    $('#counter').hide();
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
function createGrid(grid: number[][], table: JQuery<HTMLElement>) {
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

function createShip(length: number, grid: JQuery<HTMLElement>) {
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

function drawGrid(grid: number[][], table: JQuery<HTMLElement>) {
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < column; c++) {
            if (grid[r][c] == 0) {
                $(`td[data-r=${r}][data-c=${c}][id='${table.attr('id')}']`).removeClass().addClass('water');
            } else if (grid[r][c] == 1) {
                $(`td[data-r=${r}][data-c=${c}][id=${table.attr('id')}]`).removeClass().addClass('ship');
            } else if (grid[r][c] == 2) {
                $(`td[data-r=${r}][data-c=${c}][id=${table.attr('id')}]`).removeClass().addClass('destroyed');
            } else if (grid[r][c] == 3) {
                $(`td[data-r=${r}][data-c=${c}][id=${table.attr('id')}]`).removeClass().addClass('failed');
            }
        }
    }
}

//Setter
function setWater(grid: number[][], row: number, column: number) {
    grid[row][column] = 0;
}

function setShip(grid: number[][], row: number, column: number) {
    grid[row][column] = 1;
}

function setDestroyed(grid: number[][], row: number, column: number) {
    grid[row][column] = 2;
}

function setFailed(grid: number[][], row: number, column: number) {
    grid[row][column] = 3;
}

function setWinner() {
    window.alert(sessionStorage.getItem('name') + ', you won after ' + turns + ' turns.');
    server.emit('won', sessionStorage.getItem('name'), turns);
    allowed = false;
}

//Game-Functions
function attackCoordinates(row: number, column: number) {
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

function setCoordinates(row: number, column: number) {
    turns++;
    $('#counter').text('Turns: ' + turns);
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
    (async function () {
        const highscores = await $.get('http://localhost:8080/api/highscores');

        let html = '<tr><td>fett</td></tr>';
        for (const highscore of highscores.result) {
            html += `<tr> <td> ${highscore.name} </td> <td> ${highscore.turns}`;
        }
        $('#highscoreBody')[0].innerHTML = html;
    })();
}