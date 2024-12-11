import { Types } from "phaser";
import { MainScene } from "./MainScene";

export const gameConfig: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#4B0082",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1600,
    height: 960,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1500, x: 0 },
      debug: false,
    },
  },
  scene: MainScene,
};
