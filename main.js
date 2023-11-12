import { Bodies, Engine, Render, Runner, World, Body, Events, Collision } from "matter-js";
import { FRUITS_BASE } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 420,
    height: 650
  },
});

const wallXStart = 15;
const wallYStart = 395;


const world = engine.world;

const leftWall = Bodies.rectangle(wallXStart, wallYStart, wallXStart*2, wallYStart*2, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(render.options.width-wallXStart, wallYStart, wallXStart*2, wallYStart*2, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(render.options.width/2, render.options.height-wallXStart*2, render.options.width, wallXStart*4, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);


let currentBody = null;
let currentFruit = null;
let disableAction = null;
let interval = null;
let numSuika = null;
let startX = render.options.width/2;
let startY = 50;
let prevX = null;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS_BASE[index];

  if(startX-fruit.radius < wallXStart*2){
    startX = wallXStart*2+fruit.radius;
  }
  else if(startX+fruit.radius > render.options.width-wallXStart*2){
    startX = render.options.width-wallXStart*2-fruit.radius;
  }
    

  const body = Bodies.circle(startX, startY, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}


window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > wallXStart*2)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5)
      break;

    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < render.options.width-wallXStart*2)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
      }, 5)
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      startX = currentBody.position.x;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 800)
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS_BASE.length - 1)
        return;

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS_BASE[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` },
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);

      if (newBody.index === 10)
        numSuika++;
      if (numSuika === 2) {
        gameEnd();
        alert("WIN");
      }
    }

    if (!disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")){
      gameEnd();
      alert("Game Over");
    }
  })


})

addFruit();


function gameEnd() {
  startX = render.options.width/2;
  startY = 50;
  numSuika = null;

  World.clear(world);
  World.add(world, [leftWall, rightWall, ground, topLine]);
  addFruit()
}
