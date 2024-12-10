import { Scene, GameObjects, Physics } from "phaser";

interface MemoryItem {
  sprite: GameObjects.Sprite;
  memory: string;
  type: "diamond" | "key";
  color: string;
}

export class MainScene extends Scene {
  private player!: Physics.Arcade.Sprite;
  private memoryItems!: MemoryItem[];
  private collectedCount: number = 0;
  private totalMemories: number = 8;
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
  private readonly GRAVITY = 800; // Reduced gravity for floatier jumps
  private readonly JUMP_VELOCITY = -1000; // Much stronger jump force
  private readonly JUMP_HOLD_DURATION = 200; // Longer hold duration for higher jumps
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
    this.load.atlas(
      "items",
      "/assets/games/platformer/items.png",
      "/assets/games/platformer/items.json"
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

    // Create ground layer
    this.groundLayer = this.map.createLayer(
      "Calque de Tuiles 1",
      this.tileset,
      0,
      0
    )!;

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

      // Adjust physics body size and offset for better ground detection
      if (this.player.body) {
        this.player.body.setSize(30, 90);
        this.player.body.setOffset(33, 38);
      }

      // Enable debug visualization in development
      if (process.env.NODE_ENV === "development") {
        this.physics.world.createDebugGraphic();
        this.add
          .grid(0, 0, this.map.widthInPixels, this.map.heightInPixels, 64, 64)
          .setOrigin(0)
          .setAlpha(0.3);
      }

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
          console.log("Collision detected - touching down:", touchingDown);
        }
      });

      // Create player animations
      this.createPlayerAnimations();

      // Common player settings
      this.player.setBounce(0.1);
      this.player.setCollideWorldBounds(true);
      this.player.setDragX(1000);
      this.player.setDepth(1);
      this.player.setSize(40, 100); // Adjust collision box size

      // Add collision between player and tilemap layer
      this.physics.add.collider(this.player, this.groundLayer);
    } catch (error) {
      console.error("Error creating player:", error);
    }

    // Create memory items at fixed positions
    const memoryPositions: Array<{
      x: number;
      y: number;
      type: "diamond" | "key";
      color: string;
    }> = [
      { x: 200, y: 200, type: "diamond", color: "blue" },
      { x: 400, y: 300, type: "key", color: "yellow" },
      { x: 600, y: 200, type: "diamond", color: "red" },
      { x: 800, y: 300, type: "key", color: "green" },
      { x: 1000, y: 200, type: "diamond", color: "yellow" },
      { x: 1200, y: 300, type: "key", color: "blue" },
      { x: 1400, y: 200, type: "diamond", color: "green" },
      { x: 1500, y: 300, type: "key", color: "red" },
    ];

    this.memoryItems = this.createMemoryItems(memoryPositions);

    // Add collision between memory items and ground layer
    this.memoryItems.forEach((item) => {
      this.physics.add.collider(item.sprite, this.groundLayer);
      this.physics.add.overlap(
        this.player,
        item.sprite,
        () => this.collectMemory(item),
        undefined,
        this
      );
    });

    // Add guide text
    const guideText = [
      "🎮 Comment Jouer :",
      "Utilise les flèches GAUCHE/DROITE pour te déplacer",
      "↑ ou ESPACE pour sauter",
      "💎 Collecte les diamants et les clés magiques",
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

    // Set world bounds based on map size
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
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

  private createMemoryItems(
    positions: {
      x: number;
      y: number;
      type: "diamond" | "key";
      color: string;
    }[]
  ): MemoryItem[] {
    const memories = [
      "Un diamant bleu magique ! 💙",
      "Une clé mystérieuse jaune ! 🗝️",
      "Un diamant rouge étincelant ! ❤️",
      "Une clé verte secrète ! 🔑",
      "Un diamant jaune brillant ! 💛",
      "Une clé bleue enchantée ! 🗝️",
      "Un diamant vert précieux ! 💚",
      "Une clé rouge puissante ! 💪",
    ];

    return positions.map((pos, index) => {
      const sprite = this.physics.add.sprite(
        pos.x,
        pos.y,
        "items",
        `${pos.color}_${pos.type}.png`
      );
      sprite.setScale(1);
      sprite.setBounceY(0.3);
      sprite.setDepth(1);
      return {
        sprite,
        memory: memories[index],
        type: pos.type,
        color: pos.color,
      };
    });
  }

  private collectMemory(item: MemoryItem) {
    item.sprite.destroy();
    this.collectedCount++;

    // Show memory text
    const text = this.add.text(800, 450, item.memory, {
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

    if (this.collectedCount === this.totalMemories) {
      this.gameComplete();
    }
  }

  private gameComplete() {
    // Show completion message
    const text = this.add.text(800, 450, "Tous les trésors sont collectés !", {
      fontSize: "40px",
      color: "#fff",
      backgroundColor: "#000",
      padding: { x: 20, y: 10 },
    });
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

  private setupTilemapCollisions() {
    // Set collisions for specific tile indexes
    this.groundLayer.setCollisionBetween(1, 94);

    // Enable collision debugging in development
    if (process.env.NODE_ENV === "development") {
      const debugGraphics = this.add.graphics().setAlpha(0.75);
      this.groundLayer.renderDebug(debugGraphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    }

    // Verify collision tiles
    const collidingTiles = this.groundLayer.filterTiles(
      (tile: Phaser.Tilemaps.Tile) => tile.collides
    ).length;
    console.log("Number of colliding tiles:", collidingTiles);

    // Set world bounds based on map size
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.physics.world.setBoundsCollision(true, true, true, true);
  }
}
