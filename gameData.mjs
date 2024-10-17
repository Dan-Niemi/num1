import { writeFile } from "fs";
import * as DN from "./dn-util.mjs";

const POINTS_MIN = 5;
const POINTS_MAX = 12;
const RAD_MIN = 20;
const RAD_MAX = 100;
const NUM_ROCKS = 10;
const BOARD_SIZE = 800;

let gameData = {
  rocks: [],
  boardSize:BOARD_SIZE
}


class Rock {
  constructor(pos) {
    this.numPoints = DN.randomInt(POINTS_MIN, POINTS_MAX);
    this.rad = DN.random(RAD_MIN, RAD_MAX);
    this.radMax = RAD_MAX;
    this.points = [];
    this.pos = pos;
    for (let i = 0; i < this.numPoints; i++) {
      this.points.push(DN.Vector2.random().multiply(this.rad));
    }
    DN.Vector2.sortClockwise(this.points);
  }
  get globalPoints(){
    let gPoints = []
    for(let point of this.points){
      gPoints.push(new DN.Vector2(this.pos.x,this.pos.y).add(point))
    }
    return gPoints
  }
  checkOverlap(rocks) {
    for (let otherRock of rocks) {
      if (otherRock !== this) {
        if (DN.polygonsOverlap(this.globalPoints, otherRock.globalPoints)) {
          return true;
        }
      }
    }
    return false;
  }
}

addRocks();

function addRocks() {
  let failedAttempts = 0;
  for (let i = 0; i < NUM_ROCKS; i++) {
    let pos = new DN.Vector2(DN.random(RAD_MAX, BOARD_SIZE - RAD_MAX), DN.random(RAD_MAX, BOARD_SIZE - RAD_MAX));
    let newRock = new Rock(pos);
    if (!newRock.checkOverlap(gameData.rocks)) {
      gameData.rocks.push(newRock);
    } else {
      i--;
      failedAttempts++;
      if (failedAttempts > 50) return;
    }
  }
}

const jsonData = JSON.stringify(gameData);
// Write the JSON data to a file
writeFile("GameData.json", jsonData, (err) => {
  if (err) {
    console.error("Error writing file:", err);
  } else {
    console.log("Made Game Data");
  }
});
