// Define states
const STATES = {
    WAITING_FOR_COLLISION: 'WAITING_FOR_COLLISION',
    MOVING_FORWARD: 'MOVING_FORWARD',
    MOVING_BACKWARD: 'MOVING_BACKWARD',
    TERMINAL: 'TERMINAL',
  };
  
  let currentState = STATES.WAITING_FOR_COLLISION;
  let startPosition = null;
  let first_distance = 0;
  let final_distance = 0;
  
  
  // Function to change state and update LED color
  async function changeState(newState) {
    currentState = newState;
    //await speak(`State changed to ${newState}`);
  }
  
  // Collision handler
  async function onCollision() {
    await speak("Collision Detected");
    switch (currentState) {
      case STATES.WAITING_FOR_COLLISION:
        await changeState(STATES.MOVING_FORWARD);
        break;
      case STATES.MOVING_FORWARD:
        final_distance = await getDistance();
          await spin(180, 1);
        await changeState(STATES.MOVING_BACKWARD);
        break;
      case STATES.MOVING_BACKWARD:
            stopRoll();
        await changeState(STATES.TERMINAL);
        break;
    }
  }
  
  // Main FSM loop
  async function fsmLoop() {
    while (true) {
      switch (currentState) {
        case STATES.WAITING_FOR_COLLISION:
            //store starting position
          first_distance = await getDistance();
        await scrollMatrixText('Waiting', { r: 0, g: 0, b: 255 }, 15, true);
          break;
  
        case STATES.MOVING_FORWARD:
          await roll(0, 100, 20); // Roll forward
          break;
  
        case STATES.MOVING_BACKWARD:
            //Move back to user and get distance traveled
          final_distance = await getDistance();
          await roll(0, 70, 5);
        
          await changeState(STATES.TERMINAL);
          break;
  
        case STATES.TERMINAL:
          if (final_distance == 0) {
              await speak("No obstacles detected.");
          }
          else {
              distance = Math.ceil(final_distance - first_distance);
              text = "Obstacle detected at " + distance.toString() + " centimeters.";
              await speak(text);
          }
          await speak("Program ended.");
          await exitProgram();
          break;
      }
    }
  }
  
  // Register collision event
  registerEvent(EventType.onCollision, onCollision);
  
  // Start the program
  async function startProgram() {
    await changeState(STATES.WAITING_FOR_COLLISION); // Set initial state
    await fsmLoop();
  }
  
  