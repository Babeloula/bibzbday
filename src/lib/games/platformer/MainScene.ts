import { Scene, GameObjects, Physics } from "phaser";

interface MemoryItem {
  sprite: GameObjects.Sprite;
  memory: string;
}

export class MainScene extends Scene {
  private player!: Physics.Arcade.Sprite;
  private platforms!: Physics.Arcade.StaticGroup;
  private memoryItems!: MemoryItem[];
  private collectedCount: number = 0;
  private totalMemories: number = 5;
  private onGameComplete?: () => void;
  private guideText?: GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private canJump: boolean = true;

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
    this.load.image("ground", "/assets/games/platformer/platform.png");
    this.load.image("star", "/assets/games/platformer/star.png");

    // Create a simple character sprite
    const graphics = this.add.graphics();

    // Body (purple rectangle)
    graphics.fillStyle(0x9c27b0, 1);
    graphics.fillRect(8, 0, 16, 32);

    // Head (circle)
    graphics.fillStyle(0xba68c8, 1);
    graphics.fillCircle(16, 8, 8);

    // Generate texture from graphics
    graphics.generateTexture("player", 32, 48);
    graphics.destroy();
  }

  create() {
    // Initialize cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add background
    const bg = this.add.image(800, 450, "sky");
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Create platforms
    this.platforms = this.physics.add.staticGroup();

    // Main ground platforms
    const groundY = this.cameras.main.height - 100;

    // Floating platforms - positioned for better gameplay
    const platformPositions = [
      // Sol principal en 3 parties
      { x: 400, y: groundY, scale: 1 },
      { x: 800, y: groundY, scale: 1 },
      { x: 1200, y: groundY, scale: 1 },
      // Plateformes flottantes
      { x: 300, y: groundY - 200, scale: 0.5 },
      { x: 700, y: groundY - 300, scale: 0.5 },
      { x: 1100, y: groundY - 200, scale: 0.5 },
      { x: 500, y: groundY - 400, scale: 0.5 },
      { x: 900, y: groundY - 500, scale: 0.5 },
    ];

    platformPositions.forEach(({ x, y, scale }) => {
      this.platforms.create(x, y, "ground").setScale(scale, 0.2).refreshBody();
    });

    // Create player
    try {
      this.player = this.physics.add.sprite(200, groundY - 200, "player");

      // Common player settings
      this.player.setScale(2);
      this.player.setBounce(0.1);
      this.player.setCollideWorldBounds(true);
      this.player.setDragX(1000);
      this.player.setDepth(1);

      // Debug visualization
      const bounds = this.player.getBounds();
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xff0000);
      graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      graphics.setDepth(2);
    } catch (error) {
      console.error("Error creating player:", error);
    }

    // Add collision between player and platforms
    this.physics.add.collider(this.player, this.platforms, () => {
      this.canJump = true;
    });

    // Create memory items
    this.memoryItems = this.createMemoryItems(groundY);

    // Add collision between memory items and platforms
    this.memoryItems.forEach((item) => {
      this.physics.add.collider(item.sprite, this.platforms);
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
      "→ Utilise les flèches GAUCHE/DROITE pour te déplacer",
      "↑ ou ESPACE pour sauter",
      "⭐ Collecte toutes les étoiles de souvenirs",
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
  }

  update() {
    if (!this.player?.body) return;

    const moveSpeed = 300;

    // Handle movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
      this.player.setFlipX(true); // Face left
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
      this.player.setFlipX(false); // Face right
    } else {
      this.player.setVelocityX(0);
    }

    // Jump with better control
    const spaceKey = this.input.keyboard?.addKey("SPACE");
    const canJumpNow = this.canJump && this.player.body.touching.down;

    if ((this.cursors.up.isDown || spaceKey?.isDown) && canJumpNow) {
      this.player.setVelocityY(-550);
      this.canJump = false;

      // Add a small horizontal boost when jumping while moving
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-moveSpeed * 1.2);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(moveSpeed * 1.2);
      }
    }

    // Reset jump ability when touching ground
    if (this.player.body.touching.down) {
      this.canJump = true;
    }

    // Add air control (reduced movement speed while in air)
    if (!this.player.body.touching.down) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(
          Math.max(-moveSpeed * 0.8, this.player.body.velocity.x - 10)
        );
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(
          Math.min(moveSpeed * 0.8, this.player.body.velocity.x + 10)
        );
      }
    }
  }

  private createMemoryItems(groundY: number): MemoryItem[] {
    const memories = [
      { x: 300, y: groundY - 300, text: "Notre premier baiser 💋" },
      { x: 1100, y: groundY - 300, text: "Ces belles vacances 🏖️" },
      { x: 700, y: groundY - 400, text: "La danse sous la pluie ☔" },
      { x: 500, y: groundY - 500, text: "La cuisine ensemble 🍳" },
      { x: 900, y: groundY - 600, text: "Notre soirée cinéma 🎬" },
    ];

    return memories.map((memory) => {
      const sprite = this.physics.add.sprite(memory.x, memory.y, "star");
      sprite.setScale(1);
      sprite.setBounceY(0.3);
      sprite.setDepth(1); // Assure que les étoiles sont au-dessus des plateformes
      return { sprite, memory: memory.text };
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
    const text = this.add.text(
      800,
      450,
      "Tous les souvenirs sont collectés ! 🎉",
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
