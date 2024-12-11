import { Scene, GameObjects, Physics } from "phaser";

export class MainScene extends Scene {
  private player!: Physics.Arcade.Sprite;
  private collectedCount: number = 0;
  private totalItems: number = 0;
  private onGameComplete?: () => void;
  private guideText?: GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private canJump: boolean = true;
  private isJumping: boolean = false;
  private jumpCooldown: number = 0;
  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private grassLayer!: Phaser.Tilemaps.TilemapLayer;
  private itemsLayer!: Phaser.Tilemaps.TilemapLayer;
  private exitLayer!: Phaser.Tilemaps.TilemapLayer;
  private readonly GRAVITY = 1200;
  private readonly JUMP_VELOCITY = -800;
  private readonly JUMP_HOLD_DURATION = 100;
  private jumpTimer: number = 0;

  constructor() {
    super({ key: "MainScene" });
  }

  init(data: { onComplete?: () => void }) {
    this.onGameComplete = data.onComplete;
    this.collectedCount = 0;
  }

  preload() {
    // Load assets
    this.load.image("sky", "/assets/games/platformer/sky.png");
    this.load.image("tiles", "/assets/games/platformer/world.png");
    this.load.tilemapTiledJSON("map", "/assets/games/platformer/game.json");
    this.load.atlas(
      "player",
      "/assets/games/platformer/player.png",
      "/assets/games/platformer/player.json"
    );
  }

  create() {
    // Get onComplete callback from scene data
    this.onGameComplete = this.data.get("onComplete");

    // Initialize cursor keys and space key
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Add background
    const bg = this.add.image(0, 0, "sky");
    bg.setOrigin(0.5, 0.5);

    // Calculate the scale needed to cover the game width and height
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    // Center the background
    bg.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
    bg.setScrollFactor(0);

    // Create tilemap
    this.map = this.make.tilemap({ key: "map" });
    this.tileset = this.map.addTilesetImage("world", "tiles")!;

    // Create layers
    this.grassLayer = this.map.createLayer("Grass", this.tileset, 0, 0)!;
    this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0)!;
    this.itemsLayer = this.map.createLayer("Items", this.tileset, 0, 0)!;
    this.exitLayer = this.map.createLayer("Exit", this.tileset, 0, 0)!;

    // Count total items
    this.totalItems = this.countItems();

    // Set up tilemap collisions
    this.setupTilemapCollisions();

    // Create player at a fixed position
    const playerX = 200;
    const playerY = 300;

    // Configure physics world with custom gravity
    this.physics.world.gravity.y = this.GRAVITY;

    try {
      this.player = this.physics.add.sprite(
        playerX,
        playerY,
        "player",
        "character_femalePerson_idle.png"
      );

      // Set up player physics body
      this.player.setBounce(0);
      this.player.setCollideWorldBounds(true);
      this.player.setDragX(1000);
      this.player.setDepth(1);

      // Move the player sprite up by 32 pixels
      this.player.y -= 32;

      // Add collision between player and tilemap layer with debug callback
      this.physics.add.collider(this.player, this.groundLayer, (obj1) => {
        const player = obj1 as Physics.Arcade.Sprite;
        if (player.body) {
          const touchingDown = player.body.touching.down;
          if (touchingDown) {
            this.isJumping = false;
            this.canJump = true;
            // Only play idle animation if not moving horizontally
            if (Math.abs(player.body.velocity.x) < 10) {
              this.player.anims.play("idle", true);
            }
          }
        }
      });

      // Create player animations
      this.createPlayerAnimations();

      // Add overlap with items layer
      this.physics.add.overlap(
        this.player,
        this.itemsLayer,
        (object1, object2) => {
          // object2 will be the tile since itemsLayer is a TilemapLayer
          const tile = object2 as Phaser.Tilemaps.Tile;
          if (tile.index !== -1) {
            this.collectItem(tile);
          }
        },
        undefined,
        this
      );

      // Add overlap with exit layer
      this.physics.add.overlap(
        this.player,
        this.exitLayer,
        (object1, object2) => {
          // object2 will be the tile since exitLayer is a TilemapLayer
          const tile = object2 as Phaser.Tilemaps.Tile;
          if (tile.index !== -1) {
            this.checkExit(tile);
          }
        },
        undefined,
        this
      );
    } catch (error) {
      console.error("Error creating player:", error);
    }

    // Add guide text
    const guideText = [
      "🎮 Comment Jouer :",
      "Utilise les flèches GAUCHE/DROITE pour te déplacer",
      "↑ ou ESPACE pour sauter",
      "💎 Collecte tous les objets magiques",
      "",
      "Appuie sur une touche pour commencer !",
    ].join("\n");

    this.guideText = this.add.text(800, 450, guideText, {
      fontSize: "32px",
      color: "#fff",
      backgroundColor: "#000",
      padding: { x: 20, y: 20 },
      align: "center",
    });
    this.guideText.setOrigin(0.5);
    this.guideText.setScrollFactor(0);
    this.guideText.setDepth(100);

    // Make guide disappear on any key press
    this.input.keyboard?.once("keydown", () => {
      this.guideText?.destroy();
    });

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);

    // Set bounds for both camera and world to match tilemap exactly
    const mapHeight = this.map.heightInPixels;
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, mapHeight);
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, mapHeight);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // Set the background color to match the sky
    this.cameras.main.setBackgroundColor("#4B0082");
  }

  private createPlayerAnimations() {
    // Create walk animation with all 8 frames
    this.anims.create({
      key: "walk",
      frames: [
        { key: "player", frame: "character_femalePerson_walk0.png" },
        { key: "player", frame: "character_femalePerson_walk1.png" },
        { key: "player", frame: "character_femalePerson_walk2.png" },
        { key: "player", frame: "character_femalePerson_walk3.png" },
        { key: "player", frame: "character_femalePerson_walk4.png" },
        { key: "player", frame: "character_femalePerson_walk5.png" },
        { key: "player", frame: "character_femalePerson_walk6.png" },
        { key: "player", frame: "character_femalePerson_walk7.png" },
      ],
      frameRate: 12,
      repeat: -1,
    });

    // Create idle animation
    this.anims.create({
      key: "idle",
      frames: [{ key: "player", frame: "character_femalePerson_idle.png" }],
      frameRate: 1,
      repeat: 0,
    });

    // Create jump animation
    this.anims.create({
      key: "jump",
      frames: [{ key: "player", frame: "character_femalePerson_jump.png" }],
      frameRate: 1,
      repeat: 0,
    });

    // Create fall animation
    this.anims.create({
      key: "fall",
      frames: [{ key: "player", frame: "character_femalePerson_fall.png" }],
      frameRate: 1,
      repeat: 0,
    });

    // Create cheer animation
    this.anims.create({
      key: "cheer",
      frames: [
        { key: "player", frame: "character_femalePerson_cheer0.png" },
        { key: "player", frame: "character_femalePerson_cheer1.png" },
      ],
      frameRate: 6,
      repeat: -1,
    });
  }

  update() {
    if (!this.player?.body) return;

    const moveSpeed = 300;
    const isOnGround =
      this.player.body.blocked.down || this.player.body.touching.down;
    const velocityY = this.player.body.velocity.y;

    // Reset jump states when landing
    if (isOnGround) {
      this.jumpTimer = 0;
      this.canJump = true;
      this.isJumping = false;
      // Decrement jump cooldown
      if (this.jumpCooldown > 0) this.jumpCooldown--;
    }

    // Handle jumping with variable height
    const jumpButtonPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey);
    const jumpButtonHeld = this.cursors.up.isDown || this.spaceKey.isDown;

    if (jumpButtonPressed && isOnGround && this.canJump) {
      this.player.setVelocityY(this.JUMP_VELOCITY);
      this.player.anims.play("jump", true);
      this.isJumping = true;
      this.canJump = false;
      this.jumpTimer = 0;
    } else if (
      jumpButtonHeld &&
      this.isJumping &&
      this.jumpTimer < this.JUMP_HOLD_DURATION
    ) {
      this.jumpTimer += this.game.loop.delta;
      this.player.setVelocityY(this.JUMP_VELOCITY * 0.7);
    }

    // Handle movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
      this.player.setFlipX(true);
      if (isOnGround) {
        this.player.anims.play("walk", true);
      }
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
      this.player.setFlipX(false);
      if (isOnGround) {
        this.player.anims.play("walk", true);
      }
    } else {
      this.player.setVelocityX(0);
      if (isOnGround) {
        this.player.anims.play("idle", true);
      }
    }

    // Add air control (reduced movement speed while in air)
    if (!isOnGround) {
      const airControlFactor = 0.6;
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-moveSpeed * airControlFactor);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(moveSpeed * airControlFactor);
      }

      // Handle jump and fall animations based on vertical velocity
      if (velocityY < 0) {
        // Moving upward - show jump animation
        this.player.anims.play("jump", true);
      } else if (velocityY > 200) {
        // Moving downward fast - show fall animation
        this.player.anims.play("fall", true);
      }
    }
  }

  private setupTilemapCollisions() {
    // Set collisions only for ground layer
    this.groundLayer.setCollisionBetween(1, 94);

    // Set world bounds based on map size
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.physics.world.setBoundsCollision(true, true, true, true);
  }

  private countItems(): number {
    let count = 0;
    this.itemsLayer.forEachTile((tile) => {
      if (tile.index !== -1) count++;
    });
    return count;
  }

  private collectItem(tile: Phaser.Tilemaps.Tile) {
    if (tile.index !== -1) {
      // Remove the item
      this.itemsLayer.removeTileAt(tile.x, tile.y);
      this.collectedCount++;

      // Show collection message
      const text = this.add.text(800, 450, "Objet magique collecté ! ✨", {
        fontSize: "40px",
        color: "#fff",
        backgroundColor: "#000",
        padding: { x: 20, y: 10 },
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      text.setDepth(100);

      // Animate text
      this.tweens.add({
        targets: text,
        y: 200,
        alpha: 0,
        duration: 2000,
        ease: "Power2",
        onComplete: () => text.destroy(),
      });
    }
  }

  private checkExit(tile: Phaser.Tilemaps.Tile) {
    if (tile.index !== -1 && this.collectedCount === this.totalItems) {
      this.gameComplete();
    } else if (tile.index !== -1) {
      // Show message that all items need to be collected
      const text = this.add.text(
        800,
        450,
        "Collecte tous les objets magiques d'abord ! 🎯",
        {
          fontSize: "40px",
          color: "#fff",
          backgroundColor: "#000",
          padding: { x: 20, y: 10 },
        }
      );
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      text.setDepth(100);

      // Animate text
      this.tweens.add({
        targets: text,
        y: 200,
        alpha: 0,
        duration: 2000,
        ease: "Power2",
        onComplete: () => text.destroy(),
      });
    }
  }

  private gameComplete() {
    // Show completion message
    const text = this.add.text(
      800,
      450,
      "Bravo ! Tu as terminé le niveau ! 🎉",
      {
        fontSize: "40px",
        color: "#fff",
        backgroundColor: "#000",
        padding: { x: 20, y: 10 },
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(100);

    // Play cheer animation
    this.player.anims.play("cheer", true);

    // Animate text and call completion callback
    this.tweens.add({
      targets: text,
      y: 200,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => {
        text.destroy();
        if (this.onGameComplete) this.onGameComplete();
      },
    });
  }
}
