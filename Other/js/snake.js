(function() {
  var SIZE = 500; // Size of the play-field in pixels
  var GRID_SIZE = SIZE / 50;
  var c = document.getElementById("snake");
  c.height = c.width = SIZE * 2; // 2x our resolution so retina screens look good
  c.style.width = c.style.height = SIZE + "px";
  var context = c.getContext("2d");
  context.scale(2, 2); // Scale our canvas for retina screens

  var direction = newDirection = 1; // -2: up, 2: down, -1: left, 1: right
  var snakeLength = 5;
  var snake = [{x: SIZE / 2, y: SIZE / 2}]; // Snake starts in the center
  var candy = null;
  var end = false;

  function randomOffset() {
    return Math.floor(Math.random() * SIZE / GRID_SIZE) * GRID_SIZE;
  }

  function stringifyCoord(obj) {
    return [obj.x, obj.y].join(",");
  }

  function tick() {
    var newHead = {x: snake[0].x, y: snake[0].y};

    // Only change directon if the new direction is a different axis
    if (Math.abs(direction) !== Math.abs(newDirection)) {
      direction = newDirection;
    }
    var axis = Math.abs(direction) === 1 ? "x" : "y"; // 1, -1 are X; 2, -2 are Y
    if (direction < 0) {
      newHead[axis] -= GRID_SIZE; // Move left or down
    } else {
      newHead[axis] += GRID_SIZE; // Move right or up
    }

    // Did we eat a candy? Detect if our head is in the same cell as the candy
    if (candy && candy.x === newHead.x && candy.y === newHead.y) {
      candy = null;
      snakeLength += 20;
    }

    context.fillStyle = "#002b36";
    context.fillRect(0, 0, SIZE, SIZE); // Reset the play area
    if (end) {
      context.fillStyle = "rgba(0, 0, 0, 0.03)";
      context.fillRect(0, 0, SIZE / 2, SIZE / 2);
      context.font = "55px Lucida Console";
      context.textAlign = "center";
      context.fillStyle = "white";
      context.fillText("You lost", SIZE / 2, SIZE / 2);
      context.font = "20px Lucida Console";
      context.fillText("Points: " + snakeLength, SIZE / 2, SIZE / 2 + 30);
    } else {
      snake.unshift(newHead); // Add the new head to the front
      snake = snake.slice(0, snakeLength); // Enforce the snake"s max length
      //context.clearRect(0, 0,  SIZE / 2, SIZE / 2);
      context.font = "10px Lucida Console";
      context.textAlign = "right";
      context.fillStyle = "white";
      context.fillText("Points: " + snakeLength,  SIZE -10 , SIZE - 10);
    }

    // Detect wall collisions
    if (newHead.x < 0 || newHead.x >= SIZE || newHead.y < 0 || newHead.y >= SIZE) {
      end = true;
    }

    context.fillStyle = "#268bd2";
    var snakeObj = {};
    for (var i = 0; i < snake.length; i++) {
      var a = snake[i];
      context.fillRect(a.x, a.y, GRID_SIZE, GRID_SIZE); // Paint the snake
      // Build a collision lookup object
      if (i > 0) snakeObj[stringifyCoord(a)] = true;
    }

    if (snakeObj[stringifyCoord(newHead)]) end = true; // Collided with our tail

    // Place a candy (not on the snake) if needed
    while (!candy || snakeObj[stringifyCoord(candy)]) {
      candy = {x: randomOffset(), y: randomOffset()};
    }

    context.fillStyle = "#b58900";
    context.fillRect(candy.x, candy.y, GRID_SIZE, GRID_SIZE); // Paint the candy
  }

  document.getElementById("restart").addEventListener("click", function(){
    window.location.reload();
  });

  window.onload = function() {
    setInterval(tick, 100); // Kick off the game loop!
    window.onkeydown = function(e) {
      newDirection = {37: -1, 38: -2, 39: 1, 40: 2}[e.keyCode] || newDirection;
    };
  };
})();
