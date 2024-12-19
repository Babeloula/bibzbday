import { Scene, Physics } from "phaser";

export class MainScene extends Scene {
  private player!: Physics.Arcade.Sprite;
  private collectedCount: number = 0;
  private totalItems: number = 0;
  private heartItemsCount: number = 0;
  private collectedHeartItems: number = 0;
  private onGameComplete?: () => void;
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
  private heartItemsLayer!: Phaser.Tilemaps.TilemapLayer;
  private exitLayer!: Phaser.Tilemaps.TilemapLayer;
  private laddersLayer!: Phaser.Tilemaps.TilemapLayer;
  private trapsLayer!: Phaser.Tilemaps.TilemapLayer;
  private isOnLadder: boolean = false;
  private readonly GRAVITY = 1200;
  private readonly JUMP_VELOCITY = -800;
  private readonly JUMP_HOLD_DURATION = 100;
  private readonly CLIMB_SPEED = 200;
  private readonly SPAWN_X = 200;
  private readonly SPAWN_Y = 1600;
  private jumpTimer: number = 0;

  private readonly LOVE_MESSAGES = [
    { text: "Tu es mon rayon de soleil", emoji: "❤️" },
    { text: "Je t'aime plus que tout au monde", emoji: "❤️" },
    { text: "Tu es la plus belle chose qui me soit arrivée", emoji: "❤️" },
    { text: "Mon coeur t'appartient", emoji: "❤️" },
    { text: "Tu illumines ma vie", emoji: "❤️" },
    { text: "Tu es mon âme soeur", emoji: "❤️" },
    { text: "Je t'aime ma femme", emoji: "❤️" },
    { text: "Tu es ma Reine", emoji: "❤️" },
    { text: "Mon amour pour toi grandit chaque jour", emoji: "❤️" },
    { text: "Je t'aime ma Bibouche", emoji: "❤️" },
    { text: "Tu es ma vie", emoji: "❤️" },
    { text: "Mon coeur t'appartient", emoji: "❤️" },
    { text: "Tu es mon bonheur quotidien", emoji: "❤️" },
    { text: "Je t'aime plus que les mots peuvent le dire", emoji: "❤️" },
    { text: "Kbida", emoji: "❤️" },
  ];

  constructor() {
    super({ key: "MainScene" });
  }

  init(data: { onComplete?: () => void }) {
    console.log("Init called with data:", data); // Debug log
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
    console.log("Create method - callback retrieved:", !!this.onGameComplete); // Debug log

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
    this.laddersLayer = this.map.createLayer("Ladders", this.tileset, 0, 0)!;
    this.trapsLayer = this.map.createLayer("Traps", this.tileset, 0, 0)!;
    this.itemsLayer = this.map.createLayer("Items", this.tileset, 0, 0)!;
    this.heartItemsLayer = this.map.createLayer(
      "HeartItemsGroup",
      this.tileset,
      0,
      0
    )!;
    this.exitLayer = this.map.createLayer("Exit", this.tileset, 0, 0)!;

    // Count total items and heart items
    this.countAllItems();

    // Set up tilemap collisions
    this.setupTilemapCollisions();

    // Configure physics world with custom gravity
    this.physics.world.gravity.y = this.GRAVITY;

    // Create player at spawn position
    this.createPlayer(this.SPAWN_X, this.SPAWN_Y);

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

    // Create climb animation
    this.anims.create({
      key: "climb",
      frames: [
        { key: "player", frame: "character_femalePerson_climb0.png" },
        { key: "player", frame: "character_femalePerson_climb1.png" },
      ],
      frameRate: 8,
      repeat: -1,
    });
  }

  update() {
    if (!this.player?.body) return;

    const moveSpeed = 300;

    // Check if player is on a ladder
    const playerTileX = this.laddersLayer.worldToTileX(this.player.x);
    const playerTileY = this.laddersLayer.worldToTileY(this.player.y);
    const touchingLadder = this.laddersLayer.getTileAt(
      playerTileX,
      playerTileY
    );

    this.isOnLadder = touchingLadder !== null;

    if (this.isOnLadder) {
      // Disable gravity when on ladder
      (this.player.body as Phaser.Physics.Arcade.Body).allowGravity = false;

      // Handle climbing
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.CLIMB_SPEED);
        this.player.anims.play("climb", true);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.CLIMB_SPEED);
        this.player.anims.play("climb", true);
      } else {
        this.player.setVelocityY(0);
        this.player.anims.stop();
      }
    } else {
      // Re-enable gravity when not on ladder
      (this.player.body as Phaser.Physics.Arcade.Body).allowGravity = true;
    }

    const isOnGround =
      this.player.body.blocked.down || this.player.body.touching.down;
    const velocityY = this.player.body.velocity.y;

    // Only allow jumping when not on ladder
    if (!this.isOnLadder) {
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
    }

    // Handle horizontal movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
      this.player.setFlipX(true);
      if (isOnGround && !this.isOnLadder) {
        this.player.anims.play("walk", true);
      }
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
      this.player.setFlipX(false);
      if (isOnGround && !this.isOnLadder) {
        this.player.anims.play("walk", true);
      }
    } else {
      this.player.setVelocityX(0);
      if (isOnGround && !this.isOnLadder) {
        this.player.anims.play("idle", true);
      }
    }

    // Air control and animations only when not on ladder
    if (!isOnGround && !this.isOnLadder) {
      const airControlFactor = 0.6;
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-moveSpeed * airControlFactor);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(moveSpeed * airControlFactor);
      }

      if (velocityY < 0) {
        this.player.anims.play("jump", true);
      } else if (velocityY > 200) {
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

  private countAllItems(): void {
    let itemCount = 0;
    let heartItemCount = 0;

    this.itemsLayer.forEachTile((tile) => {
      if (tile.index !== -1) itemCount++;
    });

    this.heartItemsLayer.forEachTile((tile) => {
      if (tile.index !== -1) heartItemCount++;
    });

    this.totalItems = itemCount + heartItemCount;
    this.heartItemsCount = heartItemCount;
  }

  private showMessage(text: string, emoji: string) {
    // Create container
    const container = this.add.container(800, 450);
    container.setDepth(100);
    container.setScrollFactor(0);

    // Create temporary text to measure width
    const tempText = this.add.text(0, 0, text, {
      fontSize: "24px",
      fontFamily: "Arial, sans-serif",
    });
    const textWidth = tempText.width;
    tempText.destroy();

    // Calculate container width based on text width (with padding)
    const containerWidth = Math.max(400, textWidth + 200);

    // Add background with border
    const bg = this.add.rectangle(0, 0, containerWidth, 70, 0x9333ea, 0.95);
    bg.setStrokeStyle(4, 0xffffff, 0.5);
    bg.setOrigin(0.5);
    container.add(bg);

    // Add a subtle inner glow effect
    const innerGlow = this.add.rectangle(
      0,
      0,
      containerWidth - 4,
      66,
      0xffffff,
      0.1
    );
    innerGlow.setOrigin(0.5);
    container.add(innerGlow);

    // Position calculation
    const emojiX = -containerWidth / 2 + 50; // Left side with padding
    const textX = emojiX + 100; // Start text after emoji with some padding

    // Add emoji
    const emojiText = this.add.text(emojiX, 0, emoji, {
      fontSize: "32px",
      padding: { x: 10, y: 5 },
    });
    emojiText.setOrigin(0, 0.5);
    container.add(emojiText);

    // Add message text
    const messageText = this.add.text(textX, 0, text, {
      fontSize: "24px",
      color: "#FFFFFF",
      fontFamily: "Arial, sans-serif",
      padding: { x: 10, y: 5 },
      wordWrap: { width: containerWidth - 150 }, // Allow text wrapping if needed
    });
    messageText.setOrigin(0, 0.5);
    container.add(messageText);

    // Add scale animation
    this.tweens.add({
      targets: container,
      scaleX: [0.9, 1],
      scaleY: [0.9, 1],
      duration: 200,
      ease: "Back.out",
    });

    // Add fade out and up animation
    this.tweens.add({
      targets: container,
      y: 350,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      delay: 1500,
      onComplete: () => container.destroy(),
    });
  }

  private collectHeartItem(tile: Phaser.Tilemaps.Tile) {
    if (tile.index !== -1) {
      // Remove the heart item
      this.heartItemsLayer.removeTileAt(tile.x, tile.y);
      this.collectedCount++;
      this.collectedHeartItems++;

      this.showMessage("LOVE U", "❤️");

      // Check if all heart items are collected
      if (this.collectedHeartItems === this.heartItemsCount) {
        this.showLoveMessage();
      }
    }
  }

  private showLoveMessage() {
    const text = "JE T'AIME BIBOUCHE";
    const container = this.add.container(800, 450);
    container.setDepth(100);
    container.setScrollFactor(0);

    // Add background with border
    const bg = this.add.rectangle(0, 0, 800, 130, 0x9333ea, 0.95);
    bg.setStrokeStyle(4, 0xffffff, 0.5);
    bg.setOrigin(0.5);
    container.add(bg);

    // Add a subtle inner glow effect
    const innerGlow = this.add.rectangle(0, 0, 796, 126, 0xffffff, 0.1);
    innerGlow.setOrigin(0.5);
    container.add(innerGlow);

    // Add message text with padding
    const messageText = this.add.text(0, 0, text, {
      fontSize: "60px",
      color: "#FFFFFF",
      fontFamily: "sans-serif",
      padding: { x: 10, y: 5 },
    });
    messageText.setOrigin(0.5);
    container.add(messageText);

    // Add heart emoji with padding
    const heartText = this.add.text(messageText.width / 2 + 30, 0, "❤️", {
      fontSize: "65px",
      padding: { x: 10, y: 5 },
    });
    heartText.setOrigin(0, 0.5);
    container.add(heartText);

    // Add scale animation with pulsing effect
    this.tweens.add({
      targets: container,
      scaleX: [0.9, 1.1],
      scaleY: [0.9, 1.1],
      duration: 1000,
      yoyo: true,
      repeat: 2,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.tweens.add({
          targets: container,
          y: 200,
          alpha: 0,
          duration: 3000,
          ease: "Power2",
          onComplete: () => container.destroy(),
        });
      },
    });
  }

  private getRandomLoveMessage(): { message: string; emoji: string } {
    const randomMessage =
      this.LOVE_MESSAGES[Math.floor(Math.random() * this.LOVE_MESSAGES.length)];
    return { message: randomMessage.text, emoji: randomMessage.emoji };
  }

  private collectItem(tile: Phaser.Tilemaps.Tile) {
    if (tile.index !== -1) {
      // Remove the item
      this.itemsLayer.removeTileAt(tile.x, tile.y);
      this.collectedCount++;

      const { message, emoji } = this.getRandomLoveMessage();
      this.showMessage(message, emoji);
    }
  }

  private checkExit(tile: Phaser.Tilemaps.Tile) {
    if (tile.index !== -1 && this.collectedCount === this.totalItems) {
      this.gameComplete();
    } else if (tile.index !== -1) {
      this.showMessage("Collecte tout le love d'abord !", "🎯");
    }
  }

  private gameComplete() {
    const container = this.add.container(800, 450);
    container.setDepth(100);
    container.setScrollFactor(0);

    // Add background with border
    const bg = this.add.rectangle(0, 0, 700, 110, 0x9333ea, 0.95);
    bg.setStrokeStyle(4, 0xffffff, 0.5);
    bg.setOrigin(0.5);
    container.add(bg);

    // Add a subtle inner glow effect
    const innerGlow = this.add.rectangle(0, 0, 696, 106, 0xffffff, 0.1);
    innerGlow.setOrigin(0.5);
    container.add(innerGlow);

    // Add message text with padding
    const messageText = this.add.text(
      0,
      0,
      "Bravo ! Tu as terminé le niveau !",
      {
        fontSize: "40px",
        color: "#FFFFFF",
        fontFamily: "sans-serif",
        padding: { x: 10, y: 5 },
      }
    );
    messageText.setOrigin(0.5);
    container.add(messageText);

    // Add celebration emoji with padding
    const emojiText = this.add.text(messageText.width / 2 + 30, 0, "🎉", {
      fontSize: "45px",
      padding: { x: 10, y: 5 },
    });
    emojiText.setOrigin(0, 0.5);
    container.add(emojiText);

    // Play cheer animation
    this.player.anims.play("cheer", true);

    console.log("Game complete! Calling callback..."); // Debug log

    // Call the callback immediately
    if (this.onGameComplete) {
      console.log("Callback exists, calling it..."); // Debug log
      this.onGameComplete();
    } else {
      console.log("No callback found!"); // Debug log
    }

    // Add fade out and up animation
    this.tweens.add({
      targets: container,
      y: 200,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      delay: 1500,
      onComplete: () => container.destroy(),
    });
  }

  private createPlayer(x: number, y: number): void {
    try {
      this.player = this.physics.add.sprite(
        x,
        y,
        "player",
        "character_femalePerson_idle.png"
      );

      this.setupPlayerPhysics();
      this.createPlayerAnimations();
      this.setupCollisions();
    } catch (error) {
      console.error("Error creating player:", error);
    }
  }

  private setupPlayerPhysics(): void {
    if (!this.player) return;

    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1000);
    this.player.setDepth(1);
    this.player.y -= 32;
  }

  private setupCollisions(): void {
    if (!this.player) return;

    // Ground collision
    this.physics.add.collider(
      this.player,
      this.groundLayer,
      (
        object1:
          | Phaser.GameObjects.GameObject
          | Phaser.Tilemaps.Tile
          | Phaser.Physics.Arcade.Body
      ) => {
        if (!(object1 instanceof Phaser.Tilemaps.Tile)) {
          this.handleGroundCollision(
            object1 as Phaser.Types.Physics.Arcade.GameObjectWithBody
          );
        }
      },
      undefined,
      this
    );

    // Overlaps
    const layers: Array<
      [Phaser.Tilemaps.TilemapLayer, (obj: Phaser.Tilemaps.Tile) => void]
    > = [
      [
        this.trapsLayer,
        (tile) =>
          this.handleTrapCollision(
            this.player,
            tile as unknown as Phaser.GameObjects.GameObject
          ),
      ],
      [this.itemsLayer, this.collectItem],
      [this.heartItemsLayer, this.collectHeartItem],
      [this.exitLayer, this.checkExit],
    ];

    layers.forEach(([layer, handler]) => {
      this.physics.add.overlap(
        this.player,
        layer,
        (_obj1, obj2) => {
          const tile = obj2 as Phaser.Tilemaps.Tile;
          if (tile.index !== -1) {
            handler.call(this, tile);
          }
        },
        undefined,
        this
      );
    });
  }

  private handleGroundCollision(obj1: Phaser.GameObjects.GameObject): void {
    const player = obj1 as Physics.Arcade.Sprite;
    if (player.body) {
      const touchingDown = player.body.touching.down;
      if (touchingDown) {
        this.isJumping = false;
        this.canJump = true;
        if (Math.abs(player.body.velocity.x) < 10) {
          this.player.anims.play("idle", true);
        }
      }
    }
  }

  private handleTrapCollision(
    _player: Phaser.GameObjects.GameObject,
    trap: Phaser.GameObjects.GameObject
  ) {
    const trapTile = trap as unknown as Phaser.Tilemaps.Tile;
    if (trapTile.index !== -1) {
      this.showMessage("Aïe ! Attention aux pièges !", "💀");

      // Respawn player at initial position
      this.player.setPosition(this.SPAWN_X, this.SPAWN_Y - 32);
      this.player.setVelocity(0, 0);
      this.player.anims.play("idle", true);
    }
  }
}
