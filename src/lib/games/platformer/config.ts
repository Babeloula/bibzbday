import { Types } from "phaser";
import { MainScene } from "./MainScene";

export const gameConfig: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#4B0082",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 960,
    min: {
      width: 320,
      height: 160,
    },
    max: {
      width: 1920,
      height: 960,
    },
    zoom: 1,
    autoRound: true,
    expandParent: false,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1500, x: 0 },
      debug: false,
    },
  },
  input: {
    mouse: {
      preventDefaultWheel: false,
      preventDefaultDown: false,
    },
  },
  scene: MainScene,
};
