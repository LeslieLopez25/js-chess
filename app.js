const gameBoard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const width = 8;
let playerGo = "black";
playerDisplay.textContent = "black";

const startPieces = [
  rook,
  knight,
  bishop,
  queen,
  king,
  bishop,
  knight,
  rook,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  rook,
  knight,
  bishop,
  queen,
  king,
  bishop,
  knight,
  rook,
];

function createBoard() {
  startPieces.forEach((startPiece, i) => {
    const square = document.createElement("div");
    square.classList.add("square");
    square.innerHTML = startPiece;
    square.firstChild?.setAttribute("draggable", true);
    square.setAttribute("square-id", i);
    square.classList.add("beige");
    const row = Math.floor((63 - i) / 8) + 1;
    if (row % 2 === 0) {
      square.classList.add(i % 2 === 0 ? "beige" : "brown");
    } else {
      square.classList.add(i % 2 === 0 ? "brown" : "beige");
    }

    if (i <= 15) {
      square.firstChild.firstChild.classList.add("black");
    }

    if (i >= 48) {
      square.firstChild.firstChild.classList.add("white");
    }

    gameBoard.append(square);
  });
}

createBoard();

const allSquares = document.querySelectorAll(".square");

allSquares.forEach((square) => {
  square.addEventListener("dragstart", dragStart);
  square.addEventListener("dragover", dragOver);
  square.addEventListener("drop", dragDrop);
});

let startPositionId;
let draggedElement;

function dragStart(e) {
  startPositionId = e.target.parentNode.getAttribute("square-id");
  draggedElement = e.target;
}

function dragOver(e) {
  e.preventDefault();
}

function dragDrop(e) {
  e.stopPropagation();
  const correctGo = draggedElement.firstChild.classList.contains(playerGo);
  const taken = e.target.classList.contains("piece");
  const valid = checkIfValid(e.target);
  const opponentGo = playerGo === "white" ? "black" : "white";
  const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo);

  if (correctGo) {
    if (takenByOpponent && valid) {
      e.target.parentNode.append(draggedElement);
      e.target.remove();
      checkForWin();
      changePlayer();
      return;
    }
    if (taken && !takenByOpponent) {
      infoDisplay.textContent = "You can't go here!";
      setTimeout(() => (infoDisplay.textContent = ""), 2000);
      return;
    }
    if (valid) {
      e.target.append(draggedElement);
      checkForWin();
      changePlayer();
      return;
    }
  }
}

function checkIfValid(target) {
  // Extracting targetId and startId using the ternary operator
  const targetId =
    Number(target.getAttribute("square-id")) ||
    Number(target.parentNode.getAttribute("square-id"));
  const startId = Number(startPositionId);
  const piece = draggedElement.id;

  switch (piece) {
    case "pawn":
      // Pawn can move forward two squares on its first move from the starting row
      if (
        startId + width * 2 === targetId &&
        !document.querySelector(`[square-id="${startId + width * 2}"]`)
          .firstChild
      ) {
        return true;
      }
      // Pawn can move forward one square if the target square is empty
      if (
        startId + width === targetId &&
        !document.querySelector(`[square-id="${startId + width}"]`).firstChild
      ) {
        return true;
      }
      // Pawn captures diagonally
      if (
        (startId + width - 1 === targetId ||
          startId + width + 1 === targetId) &&
        document.querySelector(`[square-id="${targetId}"]`).firstChild
      ) {
        return true;
      }
      break;
    case "knight":
      // Define possible knight moves relative to the starting position
      const knightMoves = [
        startId + width * 2 + 1,
        startId + width * 2 - 1,
        startId + width - 2,
        startId + width + 2,
        startId - width * 2 + 1,
        startId - width * 2 - 1,
        startId - width - 2,
        startId - width + 2,
      ];

      // Check if the targetId is among the valid knight moves
      if (knightMoves.includes(targetId)) {
        return true;
      }
      break;
    case "bishop":
      // Define the direction and step for diagonal moves
      const directions = [-1, 1];
      const step = width + 1;

      // Check if the targetId is a valid diagonal move
      for (const direction of directions) {
        for (let i = 1; i <= width; i++) {
          const validMove = startId + direction * i * step === targetId;

          if (validMove) {
            // Check for obstructions in the diagonal path
            for (let j = 1; j < i; j++) {
              const obstructionId = startId + direction * j * step;
              const obstructionSquare = document.querySelector(
                `[square-id="${obstructionId}"]`
              );

              if (obstructionSquare.firstChild) {
                return false; // Invalid move if there is an obstruction
              }
            }

            return true; // Valid move if the path is clear
          }
        }
      }
      break;
    case "rook":
      // Define the directions for horizontal and vertical moves
      const rookDirections = [-1, 1, -width, width];
      // Check if the targetId is a valid horizontal or vertical move
      for (const direction of rookDirections) {
        for (let i = 1; i <= width; i++) {
          const validMove = startId + direction * i === targetId;
          if (validMove) {
            // Check for obstructions in the horizontal or vertical path
            for (let j = 1; j < i; j++) {
              const obstructionId = startId + direction * j;
              const obstructionSquare = document.querySelector(
                `[square-id="${obstructionId}"]`
              );
              if (obstructionSquare.firstChild) {
                return false; // Invalid move if there is an obstruction
              }
            }
            return true; // Valid move if the path is clear
          }
        }
      }
      break;
    case "queen":
      const queenDirections = [
        -1,
        1,
        -width,
        width,
        -width - 1,
        -width + 1,
        width - 1,
        width + 1,
      ];
      for (const direction of queenDirections) {
        for (let i = 1; i <= width; i++) {
          const targetSquareId = startId + direction * i;
          const targetSquare = document.querySelector(
            `[square-id="${targetSquareId}"]`
          );
          if (!targetSquare) {
            break; // Stop if we go out of bounds
          }
          if (targetSquareId === targetId) {
            // Check for obstructions along the path
            for (let j = 1; j < i; j++) {
              const obstructionId = startId + direction * j;
              const obstructionSquare = document.querySelector(
                `[square-id="${obstructionId}"]`
              );
              if (obstructionSquare.firstChild) {
                return false; // Invalid move if there is an obstruction
              }
            }
            return true; // Valid move if the path is clear
          }
        }
      }
      break;
    case "king":
      const kingMoves = [
        -1,
        1,
        -width,
        width,
        -width - 1,
        -width + 1,
        width - 1,
        width + 1,
      ];
      for (const move of kingMoves) {
        const targetSquareId = startId + move;
        const targetSquare = document.querySelector(
          `[square-id="${targetSquareId}"]`
        );
        if (targetSquareId === targetId && targetSquare) {
          // Check for obstructions
          if (!targetSquare.firstChild) {
            return true; // Valid move if the target square is empty
          }
        }
      }
  }
}

function changePlayer() {
  if (playerGo === "black") {
    reverseIds();
    playerGo = "white";
    playerDisplay.textContent = "white";
  } else {
    revertIds();
    playerGo = "black";
    playerDisplay.textContent = "black";
  }
}

function reverseIds() {
  const allSquares = document.querySelectorAll(".square");
  allSquares.forEach((square, i) =>
    square.setAttribute("square-id", width * width - 1 - i)
  );
}

function revertIds() {
  const allSquares = document.querySelectorAll(".square");
  allSquares.forEach((square, i) => square.setAttribute("square-id", i));
}

function checkForWin() {
  const kings = Array.from(document.querySelectorAll("#king"));
  if (kings.some((king) => king.firstChild.classList.contains("white"))) {
    infoDisplay.innerHTML = "Black player wins!";
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square) =>
      square.firstChild?.setAttribute("draggable", false)
    );
  }
  if (kings.some((king) => king.firstChild.classList.contains("black"))) {
    infoDisplay.innerHTML = "White player wins!";
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square) =>
      square.firstChild?.setAttribute("draggable", false)
    );
  }
}
