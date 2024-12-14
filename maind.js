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
            rpento: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]],
            diehard: [[0, 0], [1, 0], [1, 1], [5, 1], [6, 1], [7, 1], [6, -1]],
            acorn: [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]],
            glidergun: [
                [24, 0], [22, 1], [24, 1], [12, 2], [13, 2], [20, 2], [21, 2], [34, 2],
                [35, 2], [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3], [0, 4],
                [1, 4], [10, 4], [16, 4], [20, 4], [21, 4], [0, 5], [1, 5], [10, 5],
                [14, 5], [16, 5], [17, 5], [22, 5], [24, 5], [10, 6], [16, 6], [24, 6],
                [11, 7], [15, 7], [12, 8], [13, 8]
            ],
            simkin: [  [0, 0], [0, 1], [1, 0], [1, 1],
            [7, 0], [7, 1], [8, 0], [8, 1],  
            [4, 3], [4, 4], [5, 3], [5, 4],
            
            [22,9],[23,9],[21,10],[25,9],[26,9],[21,11],[27,10],[21,12],[28,11],[31,11],[22,12],[27,12],[32,11]
            ,[31,12],[23,12],[26,13],[32,12],[21,17],[20,17],[20,18],[21,19],[22,19],[23,19],[23,20]
          ]

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

document.getElementById("glidergun").addEventListener("click", () => placePattern(patterns.glidergun, 15, 15));
document.getElementById("simkin").addEventListener("click", () => placePattern(patterns.simkin, 15, 15));
document.getElementById("rpento").addEventListener("click", () => placePattern(patterns.rpento, 30, 15));
document.getElementById("diehard").addEventListener("click", () => placePattern(patterns.diehard, 15, 15));
document.getElementById("acorn").addEventListener("click", () => placePattern(patterns.acorn, 15, 15));


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
