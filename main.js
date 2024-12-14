const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

        // Canvas dimensions and grid settings
const gridRows = 40;
const gridCols = 80;
const cellSize = 15;
canvas.width = gridCols * cellSize;
canvas.height = gridRows * cellSize;

        // Track cell states (0 = white, 1 = gradient blue)
let grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
let running = false;
let intervalId;
let speed = 80; // Initial speed (ms per frame)

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width; // Set the internal width based on the rendered width
    canvas.height = rect.height; // Set the internal height based on the rendered height
    drawGrid(); // Redraw the grid after resizing
}

// Call resizeCanvas on window resize
window.addEventListener('resize', resizeCanvas);
        // Draw the grid
function drawGrid() {
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            if (grid[row][col] === 1) {
                        // Create a linear gradient
                const gradient = ctx.createLinearGradient(
                    col * cellSize,
                    row * cellSize,
                            (col + 1) * cellSize,
                            (row + 1) * cellSize
                        );
                        gradient.addColorStop(0, "lightblue");
                        gradient.addColorStop(1, "darkblue");
                        ctx.fillStyle = gradient;
                    } else {
                        ctx.fillStyle = "#FFFFC5";
                    }
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

                    // Draw grid lines
                    ctx.strokeStyle = "gray";
                    ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }function placePattern(pattern, startX, startY) {
            pattern.forEach(([x, y]) => {
                const row = startY + y;
                const col = startX + x;
                if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
                    grid[row][col] = 1;
                }
            });
            drawGrid();
        }
        const patterns = {
            block: [[0, 0], [0, 1], [1, 0], [1, 1]],
            beeHive: [[1, 0], [0, 1], [2, 1], [0, 2], [2, 2], [1, 3]],
            loaf: [[1, 0], [0, 1], [2, 1], [0, 2], [3, 2], [1, 3], [2, 3]],
            boat: [[0, 0], [0, 1], [1, 0], [2, 1], [1, 2]],
            tub: [[1, 0], [0, 1], [2, 1], [1, 2]],
            blinker: [[0, 0], [1, 0], [2, 0]],
            toad: [[1, 0], [1, 1], [1, 2], [2, 1], [2, 2], [2, 3]],
            beacon: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]],
            pulsar: [
                [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
                [0, 2], [5, 2], [7, 2], [12, 2], [0, 3], [5, 3],
                [7, 3], [12, 3], [0, 4], [5, 4], [7, 4], [12, 4],
                [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
                [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
                [0, 8], [5, 8], [7, 8], [12, 8], [0, 9], [5, 9],
                [7, 9], [12, 9], [0, 10], [5, 10], [7, 10], [12, 10],
                [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12]
            ],
            pentaDecathlon: [
                [1,1],[1,2],[1,3],[0,3],[2,3],[0,6],[1,6],[2,6],[1,7],[1,8],[1,9],[1,10],[1,11],[0,11],[2,11],[0,14],[1,14],[2,14],
                [1,15],[1,16]
            ],
            glider: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
            lwss: [[1, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4], [3, 3],[3,0]],
            mwss: [[1, 0], [0, 1],[4,2], [0, 2], [0, 3], [0, 4],[0,5] ,[1, 5], [2, 5], [3, 4],[3,0]],
            hwss: [[1, 0], [0, 1],[4,2],[4,3], [0, 2], [0, 3], [0, 4],[0,5],[0,6] ,[1, 6], [2, 6], [3, 5],[3,0]],
        };

        // Get cell coordinates based on click position
        function getCellCoordinates(x, y) {
            const col = Math.floor(x / cellSize);
            const row = Math.floor(y / cellSize);
            return { row, col };
        }

        // Handle cell toggling on click
        canvas.addEventListener("click", (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const { row, col } = getCellCoordinates(x, y);

            if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
                grid[row][col] = 1 - grid[row][col];
                drawGrid();
            }
        });

        // Calculate the next generation of the grid
        function nextGeneration() {
            const newGrid = grid.map(arr => [...arr]); // Clone the grid

            for (let row = 0; row < gridRows; row++) {
                for (let col = 0; col < gridCols; col++) {
                    const liveNeighbors = getLiveNeighbors(row, col);
                    if (grid[row][col] === 1) {
                        // Any live cell with fewer than 2 or more than 3 neighbors dies
                        if (liveNeighbors < 2 || liveNeighbors > 3) {
                            newGrid[row][col] = 0;
                        }
                    } else {
                        // Any dead cell with exactly 3 live neighbors becomes alive
                        if (liveNeighbors === 3) {
                            newGrid[row][col] = 1;
                        }
                    }
                }
            }
            grid = newGrid;
            drawGrid();
        }

        // Get the count of live neighbors for a cell, with wrapping
        function getLiveNeighbors(row, col) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue; // Skip the cell itself
                    const r = (row + dr + gridRows) % gridRows; // Wrap rows
                    const c = (col + dc + gridCols) % gridCols; // Wrap columns
                    count += grid[r][c];
                }
            }
            return count;
        }

        // Start the game loop
        function startGame() {
            if (!running) {
                running = true;
                intervalId = setInterval(nextGeneration, speed);
            }
        }

        // Pause the game loop
        function pauseGame() {
            if (running) {
                running = false;
                clearInterval(intervalId);
            }
        }

        // Reset the grid
        function resetGrid() {
            pauseGame();
            grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
            drawGrid();
        }

        // Event listeners for buttons
        document.getElementById("play").addEventListener("click", ()=>{
            speed=75;
            startGame()
        });
        document.getElementById("pause").addEventListener("click", pauseGame);
        document.getElementById("reset").addEventListener("click", resetGrid);
        document.getElementById("speed1").addEventListener("click", () => {
            speed = 75; // 1x speed
            if (running) {
                pauseGame();
                startGame();
            }
        });
        document.getElementById("speed2").addEventListener("click", () => {
            speed = 40; // 2x speed
            if (running) {
                pauseGame();
                startGame();
            }
        });
        document.getElementById("speed4").addEventListener("click", () => {
            speed = 20; // 4x speed
            if (running) {
                pauseGame();
                startGame();
            }
        });
        document.getElementById("beeHive").addEventListener("click", () =>placePattern(patterns.beeHive,30,15));
        
        document.getElementById("block").addEventListener("click", () => placePattern(patterns.block,30,15));

document.getElementById("loaf").addEventListener("click", () => placePattern(patterns.loaf, 30, 15));
document.getElementById("boat").addEventListener("click", () => placePattern(patterns.boat, 30, 15));
document.getElementById("tub").addEventListener("click", () => placePattern(patterns.tub, 30, 15));
document.getElementById("blinker").addEventListener("click", () => placePattern(patterns.blinker, 30, 15));
document.getElementById("toad").addEventListener("click", () => placePattern(patterns.toad, 30, 15));
document.getElementById("beacon").addEventListener("click", () => placePattern(patterns.beacon, 30, 15));
document.getElementById("pulsar").addEventListener("click", () => placePattern(patterns.pulsar, 30, 15));
document.getElementById("pentadecathlon").addEventListener("click", () => placePattern(patterns.pentaDecathlon, 30, 15));
document.getElementById("glider").addEventListener("click", () => placePattern(patterns.glider, 30, 15));
document.getElementById("lwss").addEventListener("click", () => placePattern(patterns.lwss, 30, 15));
document.getElementById("mwss").addEventListener("click", () => placePattern(patterns.mwss, 30, 15));
document.getElementById("hwss").addEventListener("click", () => placePattern(patterns.hwss, 30, 15));

document.getElementById("random").addEventListener("click", () => {
    // Reset the grid first
    resetGrid();

    // Define the number of random live cells you want to create
    const numberOfLiveCells = 1500; // You can change this number as needed

    for (let i = 0; i < numberOfLiveCells; i++) {
        const randomRow = Math.floor(Math.random() * gridRows);
        const randomCol = Math.floor(Math.random() * gridCols);
        grid[randomRow][randomCol] = 1; // Set the cell to alive
    }

    drawGrid(); // Redraw the grid with the new live cells
});

const buton = document.querySelectorAll('.scrolll');

buton.forEach(button => {
        button.onclick = function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
    });
    drawGrid();

// document.getElementById("glidergun").addEventListener("click", () => placePattern(patterns.glidergun, 15, 15));
