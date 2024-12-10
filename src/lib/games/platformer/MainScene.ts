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
    this.load.spritesheet("dude", "/assets/games/platformer/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    // Initialize cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add background
    const bg = this.add.image(640, 360, "sky");
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Create platforms
    this.platforms = this.physics.add.staticGroup();

    // Main ground platform
    const groundY = this.cameras.main.height - 100;
    this.platforms
      .create(640, groundY, "ground")
      .setScale(6, 0.5)
      .refreshBody();

    // Floating platforms - positioned for better gameplay
    this.platforms
      .create(1000, groundY - 250, "ground")
      .setScale(3, 0.5)
      .refreshBody();
    this.platforms
      .create(300, groundY - 350, "ground")
      .setScale(3, 0.5)
      .refreshBody();
    this.platforms
      .create(800, groundY - 450, "ground")
      .setScale(3, 0.5)
      .refreshBody();

    // Create player with appropriate size
    this.player = this.physics.add.sprite(100, groundY - 200, "dude");
    this.player.setScale(4);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // Player animations
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // Add collision between player and platforms
    this.physics.add.collider(this.player, this.platforms);

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
    this.showGuide();

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);
  }

  update() {
    // Movement speed
    const moveSpeed = 350;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    // Higher jump with better control
    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-650);
    }
  }

  private createMemoryItems(groundY: number): MemoryItem[] {
    const memories = [
      { x: 200, y: groundY - 500, text: "Our first kiss 💋" },
      { x: 1000, y: groundY - 400, text: "That amazing vacation 🏖️" },
      { x: 300, y: groundY - 600, text: "Dancing in the rain ☔" },
      { x: 800, y: groundY - 600, text: "Cooking together 🍳" },
      { x: 600, y: groundY - 300, text: "Movie marathon night 🎬" },
    ];

    return memories.map((memory) => {
      const sprite = this.physics.add.sprite(memory.x, memory.y, "star");
      sprite.setScale(3);
      sprite.setBounceY(0.3);
      return { sprite, memory: memory.text };
    });
  }

  private showGuide() {
    const guideText = [
      "🎮 How to Play:",
      "→ Use arrow keys to move",
      "↑ Press UP to jump",
      "⭐ Collect all memory stars",
      "",
      "Press any key to start!",
    ].join("\n");

    this.guideText = this.add.text(640, 360, guideText, {
      fontSize: "36px",
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
  }

  private collectMemory(item: MemoryItem) {
    item.sprite.destroy();
    this.collectedCount++;

    // Show memory text
    const text = this.add.text(640, 360, item.memory, {
      fontSize: "48px",
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
    const text = this.add.text(640, 360, "All memories collected! 🎉", {
      fontSize: "48px",
      color: "#fff",
      backgroundColor: "#000",
      padding: { x: 20, y: 10 },
    });
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
