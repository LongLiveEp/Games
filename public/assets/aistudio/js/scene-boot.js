
    /**
     * ============================================================================
     * 5. BOOT SCENE: GENERATE ALL PLACEHOLDER TEXTURES VIA CODE
     * ============================================================================
     */
    class BootScene extends Phaser.Scene {
      constructor() {
        super('BootScene');
      }

      create() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // High-DPI 3x Vector Supersampling for all procedural textures:
        // Renders every texture at 3x resolution (9x pixel density) while keeping 1x logical sprite & hitbox dimensions
        const TEX_RES = 3;
        const origClear = g.clear.bind(g);
        const origGenerateTexture = g.generateTexture.bind(g);
        g.clear = () => {
          origClear();
          g.scaleCanvas(TEX_RES, TEX_RES);
          return g;
        };
        g.generateTexture = (key, w, h) => {
          origGenerateTexture(key, w * TEX_RES, h * TEX_RES);
          const tex = this.textures.get(key);
          if (tex) {
            const frame = tex.get();
            if (frame) {
              frame.setSize(w, h, 0, 0);
              frame.u0 = 0;
              frame.v0 = 0;
              frame.u1 = 1;
              frame.v1 = 1;
              if (frame.source) {
                frame.source.resolution = 1;
                frame.source._hiRes = TEX_RES;
              }
            }
          }
          return g;
        };

        // 1. Player (Cossack: White vyshyvanka, red sharovary pants, oseledets forelock, mustache)
        g.clear();
        // Cast iron frying pan strapped on back with metallic rim
        g.fillStyle(0x1f2228, 1);
        g.fillCircle(8, 24, 6.5);
        g.lineStyle(1.2, 0x6c757d, 0.9);
        g.strokeCircle(8, 24, 5.5);
        // Red sharovary (wide pleated Cossack pants with shading)
        g.fillStyle(0xb51d1d, 1);
        g.fillRoundedRect(5, 32, 30, 22, 9);
        g.fillStyle(0xd92b2b, 1);
        g.fillRoundedRect(6, 32, 27, 20, 8);
        g.lineStyle(1, 0x8a1111, 0.7);
        g.lineBetween(19, 35, 19, 51);
        // Sturdy leather boots (чоботи) with heels & cuffs
        g.fillStyle(0x2b170a, 1);
        g.fillRoundedRect(7, 49, 11, 9, 2);
        g.fillRoundedRect(22, 49, 11, 9, 2);
        g.fillStyle(0x523018, 1);
        g.fillRect(8, 49, 9, 2.5);
        g.fillRect(23, 49, 9, 2.5);
        // White linen shirt (вишиванка) with collar & sleeve folds
        g.fillStyle(0xe8e2d5, 1);
        g.fillRoundedRect(7, 16, 26, 18, 5);
        g.fillStyle(0xfdfbf7, 1);
        g.fillRoundedRect(8, 16, 24, 17, 5);
        // Traditional red & black geometric embroidery on chest & collar
        g.fillStyle(0xd92b2b, 1);
        g.fillRect(18, 17, 4, 13);
        g.fillStyle(0x1c1613, 1);
        g.fillRect(19, 18, 2, 2);
        g.fillRect(19, 22, 2, 2);
        g.fillRect(19, 26, 2, 2);
        // Woven blue silk sash (пояс) with gold fringe
        g.fillStyle(0x164282, 1);
        g.fillRoundedRect(6, 29.5, 28, 5.5, 2);
        g.fillStyle(0x2b6cb0, 1);
        g.fillRect(7, 30.5, 26, 2.5);
        g.fillStyle(0xffd166, 0.9);
        g.fillRect(9, 34, 4, 2);
        // Sun-tanned head & ear
        g.fillStyle(0xe5ab87, 1);
        g.fillCircle(19.5, 11.5, 8.2);
        g.fillStyle(0xf5c6a8, 1);
        g.fillCircle(20, 11, 7.8);
        // Oseledets (чуб / оселедець) sweeping dramatically from crown
        g.fillStyle(0x18120f, 1);
        g.beginPath();
        g.moveTo(19, 3);
        g.lineTo(6, 0.5);
        g.lineTo(11, 7.5);
        g.closePath();
        g.fillPath();
        // Expressive eye & brow
        g.fillStyle(0xffffff, 1);
        g.fillCircle(24, 10, 2.3);
        g.fillStyle(0x111111, 1);
        g.fillCircle(24.4, 10, 1.5);
        g.lineStyle(1.4, 0x1c1613, 1);
        g.lineBetween(21.5, 7.5, 26.5, 8);
        // Iconic long Cossack Mustache (козацькі вуса)
        g.fillStyle(0x1c1613, 1);
        g.fillRoundedRect(15, 13, 16, 3.2, 1.5);
        g.fillRoundedRect(12, 14, 7, 3.2, 1.5);
        g.generateTexture('cossack', 40, 58);

        // 2. Cossack Roll Texture (Tucked spinning ball with red sharovary)
        g.clear();
        g.fillStyle(0xb51d1d, 1);
        g.fillCircle(20, 20, 17.5);
        g.fillStyle(0xd92b2b, 1);
        g.fillCircle(20, 20, 16);
        g.fillStyle(0xfdfbf7, 1);
        g.fillCircle(22, 15, 10);
        g.fillStyle(0x1f57a4, 1);
        g.fillRoundedRect(5, 17.5, 30, 5.5, 2.5);
        g.lineStyle(1.5, 0xffd166, 0.85);
        g.strokeCircle(20, 20, 16.5);
        g.generateTexture('cossack_roll', 40, 40);

        // 3. Wife placeholder (Cutscene)
        g.clear();
        g.fillStyle(0x7a1c1d, 1);
        g.fillRoundedRect(5, 28, 26, 28, 5);
        g.fillStyle(0x9e2a2b, 1); // Plakhta skirt
        g.fillRoundedRect(6, 28, 24, 27, 4);
        g.fillStyle(0xe9c46a, 0.85);
        g.fillRect(8, 51, 20, 2);
        g.fillStyle(0xffffff, 1); // Embroidered blouse
        g.fillRoundedRect(7, 16, 22, 15, 4);
        g.fillStyle(0x2b2d42, 1); // Korsetka vest
        g.fillRoundedRect(9, 17, 6, 12, 2);
        g.fillRoundedRect(21, 17, 6, 12, 2);
        g.fillStyle(0xd92b2b, 1); // Coral necklace (намисто)
        g.fillCircle(18, 19, 4.8);
        g.fillStyle(0xf5c6a8, 1); // Head
        g.fillCircle(18, 11, 7.2);
        g.fillStyle(0x111111, 1);
        g.fillCircle(20, 10.5, 1.3);
        g.fillStyle(0xe09f3e, 1); // Headscarf (очіпок)
        g.fillRoundedRect(10, 2, 16, 6.5, 3);
        g.generateTexture('npc_wife', 36, 56);

        // 4. Kid placeholder (Cutscene)
        g.clear();
        g.fillStyle(0xd92b2b, 1);
        g.fillRoundedRect(4, 22, 20, 16, 4);
        g.fillStyle(0xfdfbf7, 1);
        g.fillRoundedRect(5, 12, 18, 12, 3);
        g.fillStyle(0xd92b2b, 1);
        g.fillRect(13, 13, 2, 8);
        g.fillStyle(0xf5c6a8, 1);
        g.fillCircle(14, 8, 6);
        g.fillStyle(0x111111, 1);
        g.fillCircle(16, 7.5, 1.2);
        g.fillStyle(0x2b2118, 1);
        g.fillRoundedRect(10, 1.5, 7, 3.5, 1.5);
        g.generateTexture('npc_kid', 28, 38);

        // 4B. Kum Hrytsko placeholder (Пузатий опецькуватий козак)
        g.clear();
        // Sturdy wide boots
        g.fillStyle(0x3a2010, 1);
        g.fillRoundedRect(12, 48, 13, 10, 3);
        g.fillRoundedRect(31, 48, 13, 10, 3);
        // Wide blue sharovary pants
        g.fillStyle(0x1d3557, 1);
        g.fillEllipse(28, 42, 42, 20);
        // Big round pot-belly in embroidered shirt & green velvet vest (кептар)
        g.fillStyle(0xfdfbf7, 1);
        g.fillCircle(28, 30, 19);
        g.fillStyle(0xd92b2b, 1);
        g.fillRect(26.5, 18, 3, 15);
        g.fillStyle(0x2d6a4f, 1);
        g.fillRoundedRect(9, 17, 11, 22, 5);
        g.fillRoundedRect(36, 17, 11, 22, 5);
        g.lineStyle(1.2, 0xffd166, 0.85);
        g.strokeRoundedRect(9, 17, 11, 22, 5);
        g.strokeRoundedRect(36, 17, 11, 22, 5);
        // Wide crimson sash (пояс) wrapped around the big belly
        g.fillStyle(0xc1121f, 1);
        g.fillRoundedRect(8, 33, 40, 8, 4);
        g.fillStyle(0xffd166, 1);
        g.fillRect(14, 35, 28, 2);
        // Plump head with rosy cheeks & double chin
        g.fillStyle(0xf5c6a8, 1);
        g.fillCircle(28, 12, 10);
        g.fillStyle(0xe56b6f, 0.65);
        g.fillCircle(21, 13, 3);
        g.fillCircle(35, 13, 3);
        // Tall astrakhan Cossack hat (смушева шапка з червоним шликом)
        g.fillStyle(0x22252a, 1);
        g.fillRoundedRect(17, 0, 22, 8, 3);
        g.fillStyle(0xd90429, 1);
        g.fillTriangle(24, 1, 39, 1, 43, 9);
        // Jovial eyes & thick bushy drooping mustache
        g.fillStyle(0x111111, 1);
        g.fillCircle(24, 10, 1.8);
        g.fillCircle(32, 10, 1.8);
        g.fillStyle(0x3d2314, 1);
        g.fillEllipse(22, 15, 14, 5);
        g.fillEllipse(34, 15, 14, 5);
        g.fillRoundedRect(14, 15, 7, 5, 2);
        g.fillRoundedRect(35, 15, 7, 5, 2);
        g.generateTexture('npc_hrytsko', 56, 58);

        // 5. Frying Pan Swing Slash Arc
        g.clear();
        g.fillStyle(0xffffff, 0.85);
        g.beginPath();
        g.arc(16, 28, 34, -1.1, 1.1, false);
        g.lineTo(16, 28);
        g.closePath();
        g.fillPath();
        g.lineStyle(2.5, 0xffea00, 0.9);
        g.beginPath();
        g.arc(16, 28, 34, -1.08, 1.08, false);
        g.strokePath();
        // Frying pan silhouette at tip with metallic highlight
        g.fillStyle(0x1e2025, 1);
        g.fillCircle(44, 28, 11.5);
        g.lineStyle(1.5, 0xadb5bd, 0.9);
        g.strokeCircle(44, 28, 9.5);
        g.fillStyle(0x25282e, 1);
        g.fillRoundedRect(24, 26, 14, 4, 1.5);
        g.generateTexture('pan_slash', 64, 56);

        // 6. Galushka Projectile (Boiled dumpling with sour cream shine)
        g.clear();
        g.fillStyle(0xe9c46a, 1);
        g.fillEllipse(10, 8.5, 18.5, 13.5);
        g.fillStyle(0xf6e4b5, 1);
        g.fillEllipse(10, 8, 17.5, 12.5);
        g.fillStyle(0xffffff, 0.9);
        g.fillEllipse(8, 5.5, 8.5, 4.5);
        g.generateTexture('galushka', 20, 16);

        // 7. Enemy A: Guard Goose (Гусак-охоронець)
        g.clear();
        // White feathered body with soft contour
        g.fillStyle(0xdce2e8, 1);
        g.fillEllipse(20, 32.5, 33, 23);
        g.fillStyle(0xf8f9fa, 1);
        g.fillEllipse(20, 31.5, 31, 21);
        // Layered wing feathers
        g.fillStyle(0xe2e8f0, 1);
        g.fillEllipse(18, 32, 21, 12.5);
        g.lineStyle(1.2, 0xcbd5e1, 0.9);
        g.strokeEllipse(18, 32, 20, 12);
        // Long neck & head
        g.fillStyle(0xf8f9fa, 1);
        g.fillRoundedRect(26, 8, 9.5, 24, 4.5);
        g.fillCircle(31, 9, 7.2);
        // Angry eye & furrowed brow
        g.fillStyle(0x111111, 1);
        g.fillCircle(33, 8, 2);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(33.5, 7.5, 0.7);
        g.lineStyle(1.5, 0x111111, 1);
        g.lineBetween(30, 5.5, 35.5, 6.8);
        // Orange beak & webbed feet
        g.fillStyle(0xf77f00, 1);
        g.fillTriangle(36, 6, 47.5, 10, 36, 13.5);
        g.fillRect(14, 42, 4, 8);
        g.fillRect(24, 42, 4, 8);
        g.generateTexture('enemy_goose', 48, 50);

        // 8. Enemy B: Leshy (Лісовик — mossy forest spirit)
        g.clear();
        // Bark body with woodgrain lines
        g.fillStyle(0x4a321e, 1);
        g.fillRoundedRect(7, 16, 30, 38, 6.5);
        g.fillStyle(0x5c4028, 1);
        g.fillRoundedRect(8, 16, 28, 37, 6);
        // Leafy beard & bushy brows
        g.fillStyle(0x386641, 1);
        g.fillTriangle(5, 22, 39, 22, 22, 47);
        g.fillStyle(0x4a7c36, 1);
        g.fillTriangle(6.5, 22, 37.5, 22, 22, 45);
        g.fillRoundedRect(6, 6, 32, 14, 5);
        // Glowing yellow eyes
        g.fillStyle(0xffea00, 1);
        g.fillCircle(17, 16, 3.2);
        g.fillCircle(27, 16, 3.2);
        g.fillStyle(0xd90429, 1);
        g.fillCircle(17, 16, 1.3);
        g.fillCircle(27, 16, 1.3);
        // Branch horns
        g.fillStyle(0x47301c, 1);
        g.fillRoundedRect(10, 0, 4.5, 8.5, 1.5);
        g.fillRoundedRect(29.5, 0, 4.5, 8.5, 1.5);
        g.generateTexture('enemy_leshy', 44, 54);

        // 9. Thrown Stone / Cobblestone Projectile (Камінець песиголовця)
        g.clear();
        g.fillStyle(0x495057, 1);
        g.fillCircle(8, 8, 7.5);
        g.fillStyle(0x6c757d, 1);
        g.fillCircle(8, 8, 6.8);
        g.fillStyle(0xadb5bd, 1);
        g.fillCircle(6, 6, 3.5);
        g.fillStyle(0x343a40, 1);
        g.fillRoundedRect(7, 10, 5, 3, 1);
        g.generateTexture('pinecone', 16, 16);

        // 10. Chick Enemy (Курча)
        g.clear();
        g.fillStyle(0xfca311, 1);
        g.fillCircle(12, 14, 10.5);
        g.fillStyle(0xffd166, 1);
        g.fillCircle(12, 14, 9.8);
        g.fillStyle(0xffe599, 1);
        g.fillEllipse(10, 14, 9, 6);
        g.fillStyle(0xf77f00, 1);
        g.fillTriangle(20, 11, 26.5, 14, 20, 17);
        g.fillRect(9, 22, 2.2, 5);
        g.fillRect(14, 22, 2.2, 5);
        g.fillStyle(0x111111, 1);
        g.fillCircle(16, 11, 1.9);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(16.5, 10.5, 0.7);
        g.generateTexture('enemy_chick', 28, 28);

        // 11. Boss: Mad Rooster (Скажений півень)
        g.clear();
        // Magnificent iridescent tail feathers
        g.fillStyle(0x1b4332, 1);
        g.fillEllipse(18, 42, 28, 44);
        g.fillStyle(0x2d6a4f, 1);
        g.fillEllipse(20, 38, 20, 36);
        g.fillStyle(0xd62828, 1);
        g.fillEllipse(12, 48, 24, 34);
        // Plump body with feather sheen
        g.fillStyle(0xca4e00, 1);
        g.fillEllipse(44, 54, 49, 43);
        g.fillStyle(0xe85d04, 1);
        g.fillEllipse(44, 53.5, 47, 41);
        // Layered wing
        g.fillStyle(0x9d0208, 1);
        g.fillEllipse(42, 56, 29, 23);
        g.lineStyle(1.5, 0xffba08, 0.7);
        g.strokeEllipse(42, 56, 26, 19);
        // Neck & Head
        g.fillStyle(0xdc2f02, 1);
        g.fillRoundedRect(52, 18, 18, 34, 6);
        g.fillCircle(62, 22, 13);
        // Red Comb (гребінець) & Wattle
        g.fillStyle(0xff002b, 1);
        g.fillCircle(56, 8, 6);
        g.fillCircle(63, 7, 7);
        g.fillCircle(70, 10, 5);
        g.fillEllipse(71, 31, 6, 9);
        // Fierce eye
        g.fillStyle(0xffea00, 1);
        g.fillCircle(67, 20, 4.2);
        g.fillStyle(0x000000, 1);
        g.fillCircle(68, 20, 2.1);
        // Sharp beak
        g.fillStyle(0xffb703, 1);
        g.fillTriangle(73, 18, 88.5, 24, 73, 29);
        // Sturdy spurred legs
        g.fillStyle(0xffb703, 1);
        g.fillRect(36, 72, 5, 18);
        g.fillRect(50, 72, 5, 18);
        g.generateTexture('boss_rooster', 90, 90);

        // 12. Shockwave Projectile (Ударна хвиля півня)
        g.clear();
        g.fillStyle(0xff9f1c, 0.92);
        g.fillRoundedRect(0, 8, 28, 16, 6);
        g.fillStyle(0xffffff, 0.88);
        g.fillRoundedRect(4, 12, 20, 8, 4);
        g.generateTexture('shockwave', 28, 24);

        // 13. Non-lethal Finisher Props: Wooden Barrel (Бочка) & Clay Pot (Горщик)
        g.clear();
        g.fillStyle(0x6b3e17, 1);
        g.fillRoundedRect(3.5, 2, 41, 48, 10);
        g.fillStyle(0x8a5628, 1);
        g.fillRoundedRect(5, 2, 38, 48, 9);
        g.lineStyle(1.2, 0x4d2c0f, 0.85);
        g.lineBetween(16, 3, 16, 49);
        g.lineBetween(32, 3, 32, 49);
        g.fillStyle(0x3d405b, 1);
        g.fillRect(3, 10, 42, 5);
        g.fillRect(3, 35, 42, 5);
        g.generateTexture('prop_barrel', 48, 52);

        g.clear();
        g.fillStyle(0x9c411e, 1);
        g.fillEllipse(22, 28, 39, 33);
        g.fillStyle(0xb5542c, 1);
        g.fillEllipse(22, 27.5, 37, 31);
        g.fillRoundedRect(10, 6, 24, 10, 4);
        g.fillStyle(0xf4a261, 1);
        g.fillRect(10, 22, 24, 4);
        g.fillStyle(0xffd166, 0.85);
        g.fillCircle(16, 24, 1.5);
        g.fillCircle(22, 24, 1.5);
        g.fillCircle(28, 24, 1.5);
        g.generateTexture('prop_pot', 44, 46);

        // 14. Loot Items: Chervinets Coin, Food (Varenyk/Salo), Galushka Pack
        g.clear();
        g.fillStyle(0xffb703, 1);
        g.fillCircle(9, 9, 8.5);
        g.fillStyle(0xffd166, 1);
        g.fillCircle(9, 9, 7.2);
        g.fillStyle(0xf4a261, 1);
        g.fillCircle(9, 9, 4.8);
        g.lineStyle(1, 0xffffff, 0.85);
        g.strokeCircle(9, 9, 6.2);
        g.generateTexture('loot_coin', 18, 18);

        g.clear();
        g.fillStyle(0xc1121f, 1);
        g.fillCircle(10, 10, 9.5);
        g.fillStyle(0xe63946, 1); // Hearty borsch/apple heal icon
        g.fillCircle(10, 10, 8.5);
        g.fillStyle(0xffffff, 1);
        g.fillRoundedRect(8, 5, 4, 10, 1);
        g.fillRoundedRect(5, 8, 10, 4, 1);
        g.generateTexture('loot_food', 20, 20);

        g.clear();
        g.fillStyle(0xe9c46a, 1);
        g.fillCircle(8, 11, 6.4);
        g.fillCircle(14, 11, 6.4);
        g.fillCircle(11, 7, 6.4);
        g.fillStyle(0xf6e4b5, 1);
        g.fillCircle(8, 11, 5.8);
        g.fillCircle(14, 11, 5.8);
        g.fillCircle(11, 7, 5.8);
        g.generateTexture('loot_galushka', 22, 18);

        // 15. Checkpoints: Well (Колодязь) & Waypost Pillar (Стовп)
        g.clear();
        // Stone base
        g.fillStyle(0x6c757d, 1);
        g.fillRoundedRect(8, 48, 48, 32, 4);
        g.lineStyle(1.2, 0x495057, 0.9);
        g.strokeRoundedRect(8, 48, 48, 32, 4);
        // Wooden posts & shingled roof
        g.fillStyle(0x6f4518, 1);
        g.fillRect(12, 16, 6, 34);
        g.fillRect(46, 16, 6, 34);
        g.fillTriangle(2, 20, 62, 20, 32, 2);
        // Bucket
        g.fillStyle(0x495057, 1);
        g.fillRoundedRect(27, 28, 10, 10, 2);
        g.generateTexture('checkpoint_well', 64, 80);

        g.clear();
        g.fillStyle(0x6f4518, 1);
        g.fillRoundedRect(16, 10, 12, 70, 2);
        // Signboard
        g.fillStyle(0xd4a373, 1);
        g.fillRoundedRect(2, 18, 40, 16, 3);
        g.lineStyle(1.2, 0x8a5a36, 0.9);
        g.strokeRoundedRect(2, 18, 40, 16, 3);
        g.fillStyle(0xe63946, 1);
        g.fillCircle(22, 10, 6);
        g.generateTexture('checkpoint_pillar', 44, 80);

        // 16. Particles: Star (Зірочка оглушення) & Dust (Пил)
        g.clear();
        g.fillStyle(0xffea00, 1);
        g.fillRect(4, 0, 4, 12);
        g.fillRect(0, 4, 12, 4);
        g.fillStyle(0xffffff, 1);
        g.fillRect(4, 4, 4, 4);
        g.generateTexture('particle_star', 12, 12);

        g.clear();
        g.fillStyle(0xdedbd2, 0.85);
        g.fillCircle(6, 6, 6);
        g.generateTexture('particle_dust', 12, 12);

        // 17. Platform & Ground Tiles
        g.clear();
        g.fillStyle(0x4d3420, 1);
        g.fillRoundedRect(0, 0, 64, 24, 5);
        g.fillStyle(0x3a2616, 0.65);
        g.fillCircle(18, 16, 4);
        g.fillCircle(46, 15, 5);
        g.fillStyle(0x4c953e, 1);
        g.fillRoundedRect(0, 0, 64, 8.5, 4);
        g.fillStyle(0x6ab04c, 0.9);
        g.fillRect(4, 1.5, 56, 3);
        g.generateTexture('platform_tile', 64, 24);

        // 17B. Dark Twisted Forest Platform Tile for Act II («Злий Ліс»)
        g.clear();
        g.fillStyle(0x1f161b, 1);
        g.fillRoundedRect(0, 0, 64, 24, 5);
        g.fillStyle(0x2d4a43, 1);
        g.fillRoundedRect(0, 0, 64, 8.5, 4);
        g.fillStyle(0x00f5d4, 0.55);
        g.fillCircle(14, 5, 2.5);
        g.fillCircle(46, 4, 2.2);
        g.generateTexture('platform_tile_dark', 64, 24);

        // 18. Cossack Saber Slash Arc (Gleaming Damascus steel curved blade arc)
        g.clear();
        g.fillStyle(0xcbe8ff, 0.88);
        g.beginPath();
        g.arc(16, 28, 38, -1.2, 1.2, false);
        g.lineTo(16, 28);
        g.closePath();
        g.fillPath();
        g.lineStyle(3.5, 0xffffff, 1);
        g.beginPath();
        g.arc(16, 28, 37, -1.15, 1.15, false);
        g.strokePath();
        // Golden crossguard glint at hilt
        g.fillStyle(0xffd166, 1);
        g.fillCircle(20, 28, 5);
        g.generateTexture('saber_slash', 68, 56);

        // 19. Enemy D (Act II): Моховик-Щитоносець / Дубовий Страж (Oak-Shielded Forest Guardian)
        // Drawn facing RIGHT (+1): heavy iron-bound oak shield on the right (front), exposed mossy back on the left
        g.clear();
        // Exposed mossy back & dark root cloak on left (x: 4..28)
        g.fillStyle(0x2d3a24, 1);
        g.fillRoundedRect(6, 14, 26, 40, 6);
        // Dark bark torso & legs
        g.fillStyle(0x3a2618, 1);
        g.fillRect(10, 46, 8, 12);
        g.fillRect(22, 46, 8, 12);
        // Gnarled horned head & glowing emerald eyes
        g.fillStyle(0x281b12, 1);
        g.fillRoundedRect(10, 4, 22, 16, 5);
        g.fillTriangle(12, 5, 8, 0, 17, 4);
        g.fillTriangle(24, 5, 30, 0, 28, 6);
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(26, 11, 2.8);
        // Vulnerable glowing green moss core on his back (visual cue for backstab!)
        g.fillStyle(0x52b788, 0.9);
        g.fillEllipse(10, 30, 8, 18);
        // Massive Iron-Bound Oak Shield held in front (right side x: 30..48, y: 8..54)
        g.fillStyle(0x4a2c11, 1);
        g.fillRoundedRect(29, 8, 17, 46, 5);
        g.lineStyle(2.5, 0x94a3b8, 1);
        g.strokeRoundedRect(29, 8, 17, 46, 5);
        // Iron shield boss & spikes on front
        g.fillStyle(0xcbd5e1, 1);
        g.fillCircle(44, 31, 5);
        g.fillTriangle(46, 17, 52, 20, 46, 23);
        g.fillTriangle(46, 39, 52, 42, 46, 45);
        g.generateTexture('enemy_shield_guardian', 54, 58);

        // 20. Enemy E (Act II): Лісова Нявка (Eerie Woodland Spirit / Mavka)
        g.clear();
        // Flowing ghostly shroud / dress
        g.fillStyle(0x1b4332, 0.85);
        g.fillTriangle(8, 52, 36, 52, 22, 18);
        g.fillStyle(0x74c69d, 0.75);
        g.fillRoundedRect(11, 20, 22, 26, 6);
        // Pale eerie face & long dark-emerald hair
        g.fillStyle(0x081c15, 1);
        g.fillEllipse(22, 16, 24, 22);
        g.fillStyle(0xd8f3dc, 1);
        g.fillCircle(23, 13, 8);
        // Withered crimson/amber wildflower wreath (вінок)
        g.fillStyle(0xd90429, 1);
        g.fillCircle(17, 6, 3);
        g.fillStyle(0xffbe0b, 1);
        g.fillCircle(23, 5, 3);
        g.fillStyle(0x9b5de5, 1);
        g.fillCircle(29, 6, 3);
        // Haunting glowing eyes
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(21, 13, 2.2);
        g.fillCircle(27, 13, 2.2);
        g.generateTexture('enemy_nyavka', 44, 54);

        // 21. Enemy F (Act II): Болотяник (Swamp Mire Brute)
        g.clear();
        // Hulking dark peat & swamp-moss body
        g.fillStyle(0x1f2e1c, 1);
        g.fillEllipse(28, 36, 48, 38);
        g.fillStyle(0x344e41, 1);
        g.fillEllipse(28, 26, 38, 28);
        // Tangled swamp reeds & mushrooms on shoulders
        g.fillStyle(0x588157, 1);
        g.fillRoundedRect(8, 12, 40, 12, 5);
        g.fillStyle(0x9b5de5, 0.9);
        g.fillCircle(14, 10, 4);
        g.fillCircle(42, 11, 3.5);
        // Fierce glowing amber-red bog eyes & wide maw
        g.fillStyle(0xffbe0b, 1);
        g.fillCircle(21, 22, 3.5);
        g.fillCircle(35, 22, 3.5);
        g.fillStyle(0xd90429, 1);
        g.fillCircle(21, 22, 1.6);
        g.fillCircle(35, 22, 1.6);
        g.fillStyle(0x0b090a, 1);
        g.fillRoundedRect(18, 29, 20, 6, 3);
        g.generateTexture('enemy_bolotyanyk', 56, 56);

        // 22. Projectiles for Act II: Swamp Globule ('swamp_glob'), Will-o'-Wisp ('willowisp'), Root Shockwave ('root_wave')
        g.clear();
        g.fillStyle(0x2d6a4f, 1);
        g.fillCircle(9, 9, 8);
        g.fillStyle(0x80ed99, 0.9);
        g.fillCircle(7, 7, 4);
        g.generateTexture('swamp_glob', 18, 18);

        g.clear();
        g.fillStyle(0x00f5d4, 0.85);
        g.fillCircle(9, 9, 8);
        g.fillStyle(0xffffff, 0.95);
        g.fillCircle(9, 9, 4);
        g.generateTexture('willowisp', 18, 18);

        g.clear();
        g.fillStyle(0x3d1e24, 0.95);
        g.fillTriangle(2, 26, 16, 2, 30, 26);
        g.fillStyle(0xd90429, 0.9);
        g.fillTriangle(8, 26, 16, 8, 24, 26);
        g.fillStyle(0x00f5d4, 0.85);
        g.fillCircle(16, 20, 3.5);
        g.generateTexture('root_wave', 32, 26);

        // 23. Boss of Act II: Прадавній Лісовик «Чорнобор» (Ancient Dark Forest Arch-Spirit)
        g.clear();
        // Massive gnarled dark-oak cloak & root tendrils
        g.fillStyle(0x1b110c, 1);
        g.fillRoundedRect(16, 26, 58, 66, 12);
        // Mossy bark chest armor
        g.fillStyle(0x2d4a3e, 1);
        g.fillRoundedRect(22, 30, 48, 42, 8);
        // Glowing crimson-emerald heart rune on chest
        g.fillStyle(0xd90429, 1);
        g.fillCircle(48, 48, 8);
        g.fillStyle(0xffbe0b, 1);
        g.fillCircle(48, 48, 4);
        // Towering horned skull/bark head & giant stag antlers (роги Пралісу)
        g.fillStyle(0x2b1d14, 1);
        g.fillRoundedRect(28, 10, 38, 26, 7);
        // Antlers
        g.lineStyle(4.5, 0x4a3222, 1);
        g.lineBetween(32, 12, 14, 2);
        g.lineBetween(22, 7, 26, 0);
        g.lineBetween(62, 12, 80, 2);
        g.lineBetween(72, 7, 68, 0);
        // Piercing crimson-gold eyes
        g.fillStyle(0xff002b, 1);
        g.fillCircle(40, 22, 4.5);
        g.fillCircle(56, 22, 4.5);
        g.fillStyle(0xffea00, 1);
        g.fillCircle(41, 22, 2);
        g.fillCircle(57, 22, 2);
        // Heavy bark-shield / root-claw on front (right side)
        g.fillStyle(0x3a2314, 1);
        g.fillRoundedRect(66, 24, 22, 54, 6);
        g.lineStyle(2.5, 0x52b788, 0.9);
        g.strokeRoundedRect(66, 24, 22, 54, 6);
        g.generateTexture('boss_lisovyk', 96, 96);

        // 24. NPC Baba Yaga (Баба-Яга Кістяна Нога біля хатки на курячих ніжках)
        g.clear();
        // Dark tattered forest skirt & shawl
        g.fillStyle(0x2d1e2f, 1);
        g.fillRoundedRect(10, 28, 32, 32, 7);
        // Embroidered apron with folkloric herbs
        g.fillStyle(0x5c3c24, 1);
        g.fillRoundedRect(14, 34, 22, 24, 4);
        g.fillStyle(0x52b788, 1);
        g.fillCircle(20, 44, 3);
        g.fillCircle(29, 47, 2.5);
        // Bone leg & boot peeking from under skirt
        g.fillStyle(0xe5e5e5, 1);
        g.fillRect(15, 58, 6, 8);
        g.fillStyle(0x3a2010, 1);
        g.fillRoundedRect(27, 58, 10, 8, 3);
        // Hunched shoulders & crimson-spotted kerchief (хустка)
        g.fillStyle(0x6d2e46, 1);
        g.fillRoundedRect(8, 16, 34, 18, 8);
        g.fillStyle(0x9e2a2b, 1);
        g.fillCircle(26, 14, 12);
        g.fillStyle(0xffd166, 0.9);
        g.fillCircle(21, 10, 2);
        g.fillCircle(30, 11, 2);
        // Expressive folkloric face with hooked nose, wry grin & gleaming eye
        g.fillStyle(0xd8b4a0, 1);
        g.fillCircle(28, 17, 8.5);
        // Hooked nose
        g.fillTriangle(34, 15, 44, 19, 33, 21);
        // Gleaming amber eye
        g.fillStyle(0x111111, 1);
        g.fillCircle(31, 15, 2.2);
        g.fillStyle(0xffea00, 1);
        g.fillCircle(31.5, 14.8, 1);
        // Gnarled wooden staff (костур) with glowing swamp lantern
        g.lineStyle(4, 0x4a3222, 1);
        g.lineBetween(44, 12, 42, 64);
        g.fillStyle(0x80ffdb, 0.9);
        g.fillCircle(44, 10, 4.5);
        g.generateTexture('npc_baba_yaga', 54, 68);

        // 25. Throwable Swamp Frog ('swamp_frog' — Бойова Болотна Жаба Баби-Яги)
        g.clear();
        // Hind legs
        g.fillStyle(0x2d6a4f, 1);
        g.fillEllipse(6, 16, 8, 6);
        g.fillEllipse(20, 16, 8, 6);
        // Plump frog body
        g.fillStyle(0x40916c, 1);
        g.fillEllipse(13, 13, 18, 13);
        // Lighter belly
        g.fillStyle(0xb7e4c7, 1);
        g.fillEllipse(13, 15, 12, 7);
        // Dark swamp warts/spots on back
        g.fillStyle(0x1b4332, 1);
        g.fillCircle(10, 10, 2);
        g.fillCircle(16, 11, 1.8);
        // Bulging golden-amber eyes
        g.fillStyle(0xffea00, 1);
        g.fillCircle(9, 7, 3.5);
        g.fillCircle(17, 7, 3.5);
        g.fillStyle(0x111111, 1);
        g.fillCircle(9.5, 7, 1.5);
        g.fillCircle(17.5, 7, 1.5);
        // Wide grumpy smile
        g.lineStyle(1.5, 0x1b4332, 1);
        g.lineBetween(8, 13, 18, 13);
        g.generateTexture('swamp_frog', 26, 22);

        // 26. Act III («На Дніпрі»): Fluffy White Cloud Platform ('platform_cloud') & Storm Trap Cloud ('platform_cloud_storm')
        g.clear();
        // Soft azure underside shadow
        g.fillStyle(0x90e0ef, 0.92);
        g.fillRoundedRect(2, 10, 60, 13, 7);
        // Fluffy white cloud puffs
        g.fillStyle(0xf8f9fa, 1);
        g.fillRoundedRect(2, 6, 60, 13, 7);
        g.fillCircle(14, 10, 9);
        g.fillCircle(32, 8, 10);
        g.fillCircle(50, 10, 9);
        // Golden sunlight rim on top
        g.lineStyle(2, 0xffffff, 1);
        g.lineBetween(8, 4, 56, 4);
        g.generateTexture('platform_cloud', 64, 24);

        g.clear();
        // Dark thunderhead underside
        g.fillStyle(0x240046, 0.95);
        g.fillRoundedRect(2, 10, 60, 13, 7);
        // Stormy slate-indigo cloud puffs
        g.fillStyle(0x3c096c, 1);
        g.fillRoundedRect(2, 6, 60, 13, 7);
        g.fillCircle(14, 10, 9);
        g.fillCircle(32, 8, 10);
        g.fillCircle(50, 10, 9);
        // Crackling golden lightning veins across the cloud
        g.lineStyle(2, 0xffea00, 0.95);
        g.lineBetween(12, 8, 22, 15);
        g.lineBetween(22, 15, 18, 20);
        g.lineBetween(42, 7, 50, 14);
        g.lineBetween(50, 14, 45, 20);
        g.generateTexture('platform_cloud_storm', 64, 24);

        // Crumbling Cloud Platform ('platform_cloud_crumbling'): warm sandy-amber cloud with fracture cracks & loose puffs
        g.clear();
        g.fillStyle(0xb08968, 0.92);
        g.fillRoundedRect(3, 10, 58, 12, 6);
        g.fillStyle(0xfefae0, 0.98);
        g.fillRoundedRect(2, 5, 60, 13, 7);
        g.fillCircle(14, 9, 8.5);
        g.fillCircle(32, 8, 9.5);
        g.fillCircle(50, 9, 8.5);
        // Visible fracture cracks & loose crumbling droplets below
        g.lineStyle(2, 0x9c6644, 0.9);
        g.lineBetween(21, 5, 18, 13);
        g.lineBetween(18, 13, 24, 19);
        g.lineBetween(43, 5, 46, 13);
        g.lineBetween(46, 13, 41, 19);
        g.fillStyle(0xe9c46a, 0.9);
        g.fillCircle(15, 21, 2.2);
        g.fillCircle(32, 22, 2.5);
        g.fillCircle(48, 21, 2.2);
        g.generateTexture('platform_cloud_crumbling', 64, 24);

        // Fading Mist Cloud Platform ('platform_cloud_fading'): ethereal cyan-turquoise mist cloud with soft rings
        g.clear();
        g.fillStyle(0x48cae4, 0.48);
        g.fillRoundedRect(2, 9, 60, 12, 7);
        g.fillStyle(0xcaf0f8, 0.88);
        g.fillRoundedRect(4, 5, 56, 12, 6);
        g.fillCircle(16, 10, 8);
        g.fillCircle(32, 8, 9);
        g.fillCircle(48, 10, 8);
        g.lineStyle(1.8, 0x90e0ef, 0.95);
        g.strokeEllipse(20, 11, 16, 7);
        g.strokeEllipse(44, 11, 16, 7);
        g.generateTexture('platform_cloud_fading', 64, 24);

        // 27. Act III: Дніпрова Русалка ('enemy_rusalka') & Water-Lily Surface Wreath ('rusalka_wreath')
        g.clear();
        // Shimmering turquoise water ripple & flower wreath on water surface
        g.lineStyle(2, 0x00f5d4, 0.85);
        g.strokeEllipse(21, 10, 38, 10);
        g.fillStyle(0x2ec4b6, 0.9);
        g.fillEllipse(21, 8, 20, 7);
        g.fillStyle(0xffea00, 1);
        g.fillCircle(15, 7, 2.5);
        g.fillCircle(21, 6, 3);
        g.fillCircle(27, 7, 2.5);
        g.generateTexture('rusalka_wreath', 42, 16);

        g.clear();
        // Flowing translucent river-mist dress & water tail splashes
        g.fillStyle(0x48cae4, 0.85);
        g.fillTriangle(10, 56, 24, 26, 38, 56);
        g.fillStyle(0xcaf0f8, 0.95);
        g.fillRoundedRect(14, 24, 20, 26, 6);
        // Outstretched arms trying to grab Omelko!
        g.lineStyle(4, 0xd8f3dc, 1);
        g.lineBetween(16, 28, 3, 20);
        g.lineBetween(32, 28, 45, 20);
        // Long flowing emerald-turquoise hair
        g.fillStyle(0x0096c7, 0.95);
        g.fillRoundedRect(11, 8, 26, 24, 8);
        // Pale river-nymph face
        g.fillStyle(0xe0fbfc, 1);
        g.fillCircle(24, 15, 7.5);
        // Glowing cyan siren eyes
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(21.5, 14.5, 2);
        g.fillCircle(26.5, 14.5, 2);
        // Wreath of Dnipro water-lilies & reeds (вінок із лілій)
        g.fillStyle(0x2d6a4f, 1);
        g.fillRoundedRect(15, 6, 18, 4, 2);
        g.fillStyle(0xffea00, 1);
        g.fillCircle(19, 7, 2.5);
        g.fillCircle(24, 6.5, 3);
        g.fillCircle(29, 7, 2.5);
        g.generateTexture('enemy_rusalka', 48, 58);

        // 28. Act III: Водяник ('enemy_vodyanyk') & Потерча ('enemy_potercha')
        g.clear();
        // Floating lilypad / river-log base
        g.fillStyle(0x2d6a4f, 1);
        g.fillEllipse(28, 52, 46, 10);
        // Deep river-green body & scales
        g.fillStyle(0x1b4332, 1);
        g.fillRoundedRect(12, 20, 32, 32, 9);
        // Long flowing duckweed beard (борода з ряски й водоростей)
        g.fillStyle(0x52b788, 1);
        g.fillTriangle(15, 24, 41, 24, 28, 50);
        // Bulging golden-green frog-like eyes & reed crown
        g.fillStyle(0x40916c, 1);
        g.fillCircle(28, 16, 10);
        g.fillStyle(0xffbe0b, 1);
        g.fillCircle(24, 14, 3);
        g.fillCircle(32, 14, 3);
        // Crown of reeds (очеретяна корона)
        g.fillStyle(0xe9c46a, 1);
        g.fillTriangle(19, 9, 23, 2, 26, 9);
        g.fillTriangle(26, 9, 28, 1, 31, 9);
        g.fillTriangle(31, 9, 34, 2, 37, 9);
        // Whirlpool staff
        g.lineStyle(3.5, 0x6f4518, 1);
        g.lineBetween(46, 10, 44, 52);
        g.fillStyle(0x00f5d4, 0.9);
        g.fillCircle(46, 9, 5);
        g.generateTexture('enemy_vodyanyk', 56, 58);

        g.clear();
        // Misty winged water-imp (Потерча з болотним вогником)
        g.fillStyle(0x48cae4, 0.45);
        g.fillEllipse(10, 22, 16, 10);
        g.fillEllipse(34, 22, 16, 10);
        g.fillStyle(0x023e8a, 0.9);
        g.fillRoundedRect(14, 14, 16, 22, 7);
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(19, 20, 2.2);
        g.fillCircle(25, 20, 2.2);
        // Hanging marsh lantern
        g.fillStyle(0xffea00, 0.95);
        g.fillCircle(22, 38, 4.5);
        g.generateTexture('enemy_potercha', 44, 46);

        // 29. Act III Projectiles ('water_orb', 'tidal_wave') & Boss ('boss_vodyanyk_tsar') & Giant Catfish ('giant_catfish')
        g.clear();
        g.fillStyle(0x0096c7, 0.9);
        g.fillCircle(9, 9, 8);
        g.lineStyle(2, 0x90e0ef, 0.95);
        g.strokeCircle(9, 9, 5);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(7, 7, 2.5);
        g.generateTexture('water_orb', 18, 18);

        g.clear();
        g.fillStyle(0x0077b6, 0.95);
        g.fillTriangle(2, 26, 18, 3, 32, 26);
        g.fillStyle(0x90e0ef, 0.9);
        g.fillCircle(18, 7, 5);
        g.generateTexture('tidal_wave', 34, 26);

        // Thrown Aqua-Gold Trident Projectile ('vodyanyk_trident_proj')
        g.clear();
        g.fillStyle(0x00b4d8, 0.45);
        g.fillEllipse(19, 8, 34, 10);
        g.lineStyle(3, 0xffd166, 1);
        g.lineBetween(3, 8, 30, 8);
        g.lineBetween(26, 3, 26, 13);
        g.lineBetween(26, 3, 35, 4);
        g.lineBetween(26, 8, 37, 8);
        g.lineBetween(26, 13, 35, 12);
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(24, 8, 3);
        g.generateTexture('vodyanyk_trident_proj', 38, 16);

        // Boss of Act III: Водяний Цар Дніпрових Порогів ('boss_vodyanyk_tsar' — 150x150)
        g.clear();
        // 1. Foaming Dnipro whirlpool pedestal at base
        g.fillStyle(0x023e8a, 0.9);
        g.fillEllipse(75, 136, 98, 22);
        g.lineStyle(3, 0x90e0ef, 0.85);
        g.strokeEllipse(75, 136, 86, 16);
        g.fillStyle(0xcaf0f8, 0.8);
        g.fillEllipse(52, 138, 22, 8);
        g.fillEllipse(98, 138, 22, 8);

        // 2. Royal deep-river scale mantle & armored cloak
        g.fillStyle(0x03045e, 0.98);
        g.fillRoundedRect(28, 44, 88, 92, 22);
        g.fillStyle(0x0077b6, 1);
        g.fillRoundedRect(36, 48, 72, 76, 16);
        // Scale pattern on chest armor
        g.lineStyle(2, 0x00b4d8, 0.75);
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            g.strokeCircle(54 + col * 18, 66 + row * 16, 7);
          }
        }

        // 3. River-shell & reed pauldrons (наплічники з річкових мушель)
        g.fillStyle(0x1d3557, 1);
        g.fillEllipse(34, 56, 28, 20);
        g.fillEllipse(110, 56, 28, 20);
        g.lineStyle(2.5, 0xffd166, 0.9);
        g.strokeEllipse(34, 56, 28, 20);
        g.strokeEllipse(110, 56, 28, 20);

        // 4. Lush cascading sea-foam & duckweed beard with river pearls
        g.fillStyle(0x52b788, 0.95);
        g.fillTriangle(38, 52, 106, 52, 72, 124);
        g.fillStyle(0x80ffdb, 0.92);
        g.fillTriangle(44, 54, 100, 54, 72, 114);
        g.fillStyle(0xffea00, 0.95);
        g.fillCircle(62, 82, 3);
        g.fillCircle(82, 86, 3);
        g.fillCircle(72, 100, 3.5);

        // 5. Broad river-spirit head, gill fins & fierce glowing eyes
        g.fillStyle(0x0096c7, 1);
        g.fillTriangle(30, 36, 44, 28, 44, 46);
        g.fillTriangle(114, 36, 100, 28, 100, 46);
        g.fillStyle(0x00b4d8, 1);
        g.fillRoundedRect(42, 22, 60, 36, 12);
        // Thick turquoise eyebrows
        g.lineStyle(4, 0x03045e, 1);
        g.lineBetween(48, 32, 66, 35);
        g.lineBetween(96, 32, 78, 35);
        // Glowing golden-cyan Tsar eyes
        g.fillStyle(0xffea00, 1);
        g.fillCircle(58, 39, 5.5);
        g.fillCircle(86, 39, 5.5);
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(59, 39, 2.5);
        g.fillCircle(87, 39, 2.5);

        // 6. Tall Golden Shell & Reed Crown (Корона Водяного Царя)
        g.fillStyle(0xffd166, 1);
        g.fillRoundedRect(44, 18, 56, 7, 3);
        g.fillTriangle(44, 20, 53, 5, 62, 20);
        g.fillTriangle(60, 20, 72, 1, 84, 20);
        g.fillTriangle(82, 20, 91, 5, 100, 20);
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(72, 12, 4.5);
        g.fillCircle(53, 14, 3);
        g.fillCircle(91, 14, 3);

        // 7. Mighty Golden River Trident (Тризуб Славутича) held on the right
        g.lineStyle(5, 0xffd166, 1);
        g.lineBetween(124, 22, 124, 142);
        g.lineBetween(110, 28, 138, 28);
        g.lineBetween(110, 28, 110, 8);
        g.lineBetween(124, 28, 124, 2);
        g.lineBetween(138, 28, 138, 8);
        // Glowing cyan orb at trident crossguard
        g.fillStyle(0x00f5d4, 1);
        g.fillCircle(124, 28, 6);
        g.generateTexture('boss_vodyanyk_tsar', 150, 150);

        // Giant River Catfish ('giant_catfish' — Річковий Сом Вусань)
        g.clear();
        // Tail fin
        g.fillStyle(0x1d3557, 1);
        g.fillTriangle(4, 34, 28, 14, 28, 52);
        // Broad sleek silver-blue catfish body
        g.fillStyle(0x2b4c65, 1);
        g.fillEllipse(82, 36, 118, 42);
        // Pale silver-cream belly
        g.fillStyle(0xa8dadc, 1);
        g.fillEllipse(86, 44, 96, 20);
        // Dorsal fin (спинний плавець, біля якого стоїть Омелько)
        g.fillStyle(0x1d3557, 1);
        g.fillTriangle(62, 16, 84, 5, 92, 17);
        // Friendly golden eye & wide smiling mouth
        g.fillStyle(0xffea00, 1);
        g.fillCircle(122, 28, 5.5);
        g.fillStyle(0x111111, 1);
        g.fillCircle(123.5, 28, 2.5);
        // Long curling Cossack Catfish Whiskers (довгі козацькі вуса сома!)
        g.lineStyle(3.5, 0x1d3557, 1);
        g.beginPath();
        g.moveTo(132, 34);
        g.lineTo(148, 26);
        g.lineTo(154, 18);
        g.strokePath();
        g.beginPath();
        g.moveTo(130, 38);
        g.lineTo(146, 46);
        g.lineTo(152, 54);
        g.strokePath();
        g.generateTexture('giant_catfish', 158, 62);

        // 30. Act IV Checkpoints: Чумацький віз ('checkpoint_cart'), Кам'яна баба ('checkpoint_baba'), Перевернута чайка ('checkpoint_boat')
        g.clear();
        // Chumak Salt Cart (Чумацька мажа із мішками солі та дерев'яними колесами)
        g.fillStyle(0xd4a373, 0.95);
        g.fillRoundedRect(8, 30, 44, 18, 5);
        g.fillStyle(0xfefae0, 1);
        g.fillEllipse(22, 28, 20, 14);
        g.fillEllipse(38, 29, 20, 14);
        g.fillStyle(0x6f4518, 1);
        g.fillRect(6, 42, 48, 16);
        g.lineStyle(2.5, 0x3d2314, 1);
        g.lineBetween(12, 34, 10, 58);
        g.lineBetween(24, 34, 24, 58);
        g.lineBetween(36, 34, 36, 58);
        g.lineBetween(48, 34, 50, 58);
        // Wooden spoked wheels
        g.lineStyle(3.5, 0x3d2314, 1);
        g.strokeCircle(16, 64, 11);
        g.strokeCircle(44, 64, 11);
        g.fillStyle(0xd4a373, 1);
        g.fillCircle(16, 64, 3.5);
        g.fillCircle(44, 64, 3.5);
        // Lantern on the cart pole
        g.lineStyle(2.5, 0x583101, 1);
        g.lineBetween(50, 42, 54, 12);
        g.fillStyle(0xffea00, 0.95);
        g.fillCircle(54, 12, 5);
        g.generateTexture('checkpoint_cart', 60, 80);

        g.clear();
        // Ancient Scythian/Polovtsian Stone Baba (Скіфська кам'яна баба на курганному камені)
        g.fillStyle(0x6c757d, 1);
        g.fillRoundedRect(8, 64, 44, 14, 4);
        g.fillStyle(0xadb5bd, 1);
        g.fillRoundedRect(15, 24, 30, 42, 8);
        g.fillStyle(0xced4da, 1);
        g.fillRoundedRect(19, 8, 22, 20, 7);
        // Carved stone features & hands holding ritual cup
        g.lineStyle(2, 0x495057, 0.95);
        g.lineBetween(22, 16, 28, 16);
        g.lineBetween(32, 16, 38, 16);
        g.lineBetween(30, 16, 30, 23);
        g.lineBetween(18, 38, 26, 46);
        g.lineBetween(42, 38, 34, 46);
        g.strokeRect(27, 42, 6, 9);
        // Golden steppe lichen / solar talisman glow
        g.fillStyle(0xffd166, 0.9);
        g.fillCircle(30, 32, 4);
        g.generateTexture('checkpoint_baba', 60, 80);

        g.clear();
        // Overturned Cossack Chayka Boat on the Sea Shore (Перевернута козацька чайка з очеретяними в'язанками)
        g.fillStyle(0xe9c46a, 0.9);
        g.fillEllipse(30, 72, 56, 10);
        g.fillStyle(0x583101, 1);
        g.fillTriangle(4, 68, 30, 26, 56, 68);
        g.fillStyle(0x7f4f24, 1);
        g.fillRoundedRect(8, 44, 44, 24, 10);
        // Reed gunwale bundles (очеретяні в'язанки вздовж борту чайки)
        g.fillStyle(0xd4a373, 1);
        g.fillRoundedRect(6, 58, 48, 7, 3);
        // Broken mast & fluttering crimson Cossack pennant
        g.lineStyle(3, 0x3d2314, 1);
        g.lineBetween(30, 44, 30, 10);
        g.fillStyle(0xc1121f, 1);
        g.fillTriangle(30, 10, 52, 16, 30, 22);
        g.generateTexture('checkpoint_boat', 60, 80);

        // 31. Act IV Steppe & Salt-Crusted Platform Tile ('platform_tile_steppe')
        g.clear();
        g.fillStyle(0x6c584c, 1);
        g.fillRoundedRect(0, 4, 64, 20, 5);
        g.fillStyle(0xa98467, 1);
        g.fillRoundedRect(2, 4, 60, 10, 4);
        // Golden dry feather-grass & shimmering salt crust on top
        g.fillStyle(0xe9c46a, 1);
        g.fillRect(0, 0, 64, 6);
        g.fillStyle(0xfefae0, 0.85);
        g.fillTriangle(10, 5, 14, 0, 18, 5);
        g.fillTriangle(36, 5, 41, 0, 46, 5);
        g.generateTexture('platform_tile_steppe', 64, 24);

        // 32. Act IV Enemies: Польовик ('enemy_polovyk'), Вовкулака ('enemy_vovkulaka'), Перекотиполе ('enemy_tumbleweed'), Чайка-злодійка ('enemy_seagull')
        g.clear();
        // Polovyk (Польовик — дух житнього та ковилового поля з віночком колосків)
        g.fillStyle(0xa98467, 1);
        g.fillRoundedRect(10, 18, 28, 28, 9);
        g.fillStyle(0xe9c46a, 1);
        g.fillTriangle(8, 26, 24, 46, 40, 26);
        g.fillStyle(0xd4a373, 1);
        g.fillCircle(24, 14, 9);
        // Glowing golden-green steppe eyes
        g.fillStyle(0x80ed99, 1);
        g.fillCircle(20.5, 13.5, 2.2);
        g.fillCircle(27.5, 13.5, 2.2);
        // Crown of golden wheat & feather-grass plumes
        g.lineStyle(2.5, 0xfefae0, 0.95);
        g.lineBetween(16, 8, 11, 1);
        g.lineBetween(24, 6, 24, 0);
        g.lineBetween(32, 8, 37, 1);
        g.generateTexture('enemy_polovyk', 48, 48);

        g.clear();
        // Vovkulaka (Вовкулака — стрімкий степовий перевертень із червоними очима)
        g.fillStyle(0x2b2d42, 1);
        g.fillRoundedRect(8, 18, 36, 26, 8);
        // Hunched bristling fur shoulders & tail
        g.fillStyle(0x1d1e2c, 1);
        g.fillTriangle(4, 28, 14, 16, 16, 34);
        g.fillCircle(28, 16, 11);
        // Pointed wolf ears & snarling snout
        g.fillTriangle(21, 9, 25, 1, 29, 9);
        g.fillTriangle(29, 9, 34, 1, 37, 9);
        g.fillStyle(0x4a4e69, 1);
        g.fillRoundedRect(32, 13, 15, 9, 3);
        // Glowing crimson eyes & white fangs
        g.fillStyle(0xff2a2a, 1);
        g.fillCircle(32, 13, 2.3);
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(36, 22, 38, 26, 40, 22);
        g.fillTriangle(41, 22, 43, 26, 45, 22);
        // Legs
        g.fillStyle(0x1d1e2c, 1);
        g.fillRect(13, 42, 6, 10);
        g.fillRect(31, 42, 6, 10);
        g.generateTexture('enemy_vovkulaka', 52, 54);

        g.clear();
        // Tumbleweed (Перекотиполе — колючий степовий кущ, що котиться за вітром)
        g.lineStyle(2.5, 0x9c6644, 0.95);
        g.strokeCircle(22, 22, 17);
        g.lineStyle(2, 0xb08968, 0.9);
        g.strokeEllipse(22, 22, 34, 20);
        g.strokeEllipse(22, 22, 20, 34);
        g.lineBetween(7, 7, 37, 37);
        g.lineBetween(37, 7, 7, 37);
        // Sharp golden thorns
        g.fillStyle(0xe9c46a, 1);
        g.fillCircle(22, 4, 2.5);
        g.fillCircle(22, 40, 2.5);
        g.fillCircle(4, 22, 2.5);
        g.fillCircle(40, 22, 2.5);
        // Angry glowing eyes inside the thorny bush
        g.fillStyle(0xffbe0b, 1);
        g.fillCircle(18, 20, 2.2);
        g.fillCircle(26, 20, 2.2);
        g.generateTexture('enemy_tumbleweed', 44, 44);

        g.clear();
        // Seagull Thief (Чайка-злодійка — чорноморська мартинка, що пікірує за червінцями)
        // Spread white wings with dark slate wingtips
        g.fillStyle(0xf8f9fa, 1);
        g.fillTriangle(4, 10, 24, 22, 16, 26);
        g.fillTriangle(44, 10, 24, 22, 32, 26);
        g.fillStyle(0x343a40, 1);
        g.fillTriangle(2, 8, 9, 12, 6, 15);
        g.fillTriangle(46, 8, 39, 12, 42, 15);
        // Sleek white body & head
        g.fillStyle(0xffffff, 1);
        g.fillEllipse(24, 23, 22, 12);
        g.fillCircle(33, 18, 6);
        // Hooked yellow beak & bold eye
        g.fillStyle(0xffbe0b, 1);
        g.fillTriangle(38, 16, 46, 19, 38, 21);
        g.fillStyle(0x111111, 1);
        g.fillCircle(34.5, 17, 1.8);
        g.generateTexture('enemy_seagull', 48, 36);

        // 33. Act IV Salt Mountain Arena: Fragile Salt-Crystal Platform ('platform_crystal_salt')
        g.clear();
        g.fillStyle(0xffafcc, 0.92);
        g.fillRoundedRect(2, 4, 60, 16, 6);
        g.fillStyle(0xffe5ec, 0.98);
        g.fillRoundedRect(4, 2, 56, 10, 4);
        // Faceted crystal spikes on the underside
        g.fillStyle(0xffcad4, 0.95);
        g.fillTriangle(8, 18, 16, 26, 24, 18);
        g.fillTriangle(26, 18, 32, 27, 38, 18);
        g.fillTriangle(40, 18, 48, 26, 56, 18);
        g.lineStyle(1.5, 0xffffff, 0.95);
        g.strokeRoundedRect(2, 2, 60, 16, 5);
        g.generateTexture('platform_crystal_salt', 64, 28);

        // 34. Act IV Final Boss Heads: Триголовий Змій Соляногорич (Grandfatherly 3-headed Salt Dragon)
        const drawGrandpaDragonHead = (key, crestColor, hasCrown, isSleepy) => {
          g.clear();
          // White salt-crystalline head with soft pink sunset sheen
          g.fillStyle(0xf8f9fa, 1);
          g.fillRoundedRect(12, 18, 66, 46, 16);
          g.fillStyle(0xffe5ec, 0.95);
          g.fillRoundedRect(6, 28, 46, 32, 12);
          // Dorsal salt crystals on the back of the head
          g.fillStyle(crestColor, 0.95);
          g.fillTriangle(52, 18, 62, 2, 70, 18);
          g.fillTriangle(66, 22, 78, 6, 84, 24);
          // Warm amber grandfatherly eyes & bushy white salt-crystal eyebrows
          g.fillStyle(0xff9f1c, 1);
          g.fillCircle(36, 30, 6.5);
          g.fillStyle(0x1d1e2c, 1);
          if (isSleepy) {
            // Half-closed sleepy eyelid
            g.fillRect(29, 29, 14, 3);
          } else {
            g.fillCircle(34.5, 30, 3);
          }
          // Bushy grandfatherly white eyebrow & long curling Cossack mustache!
          g.lineStyle(4, 0xffffff, 1);
          g.lineBetween(26, 21, 45, 23);
          g.beginPath();
          g.moveTo(16, 48);
          g.lineTo(4, 56);
          g.lineTo(10, 66);
          g.strokePath();
          // Nostril & solid rounded teeth
          g.fillStyle(0xb56576, 1);
          g.fillCircle(14, 36, 3);
          g.fillStyle(0xffffff, 1);
          g.fillTriangle(12, 58, 16, 65, 20, 58);
          g.fillTriangle(24, 58, 28, 65, 32, 58);
          // Golden Salt Crown on the Proud Head
          if (hasCrown) {
            g.fillStyle(0xffd166, 1);
            g.fillTriangle(30, 18, 36, 2, 44, 18);
            g.fillTriangle(42, 18, 50, 0, 58, 18);
            g.fillTriangle(56, 18, 64, 3, 70, 18);
            g.fillStyle(0xff0055, 1);
            g.fillCircle(50, 12, 3);
          }
          g.generateTexture(key, 88, 74);
        };

        drawGrandpaDragonHead('zmiy_head_hungry', 0xffafcc, false, false);
        drawGrandpaDragonHead('zmiy_head_sleepy', 0xc77dff, false, true);
        drawGrandpaDragonHead('zmiy_head_proud', 0xffea00, true, false);

        // 35. Act IV Boss Projectiles: 'salt_shard', 'zmiy_note', 'tail_scythe_wave', 'salt_boulder'
        g.clear();
        g.fillStyle(0xffe5ec, 0.95);
        g.fillTriangle(9, 1, 17, 17, 1, 17);
        g.lineStyle(1.5, 0xffffff, 1);
        g.strokeTriangle(9, 1, 17, 17, 1, 17);
        g.generateTexture('salt_shard', 18, 18);

        g.clear();
        g.fillStyle(0xe0aaff, 0.95);
        g.fillCircle(7, 15, 5);
        g.lineStyle(2.5, 0xe0aaff, 1);
        g.lineBetween(11, 15, 11, 3);
        g.lineBetween(11, 3, 18, 6);
        g.generateTexture('zmiy_note', 20, 20);

        g.clear();
        g.fillStyle(0xffafcc, 0.95);
        g.fillTriangle(2, 28, 22, 2, 38, 28);
        g.fillStyle(0xffffff, 0.9);
        g.fillTriangle(10, 28, 22, 8, 30, 28);
        g.generateTexture('tail_scythe_wave', 40, 28);

        g.clear();
        g.fillStyle(0xd8e2dc, 0.98);
        g.fillCircle(14, 14, 13);
        g.lineStyle(2, 0xffcad4, 0.9);
        g.strokeCircle(14, 14, 11);
        g.generateTexture('salt_boulder', 28, 28);

        let titleLaunched = false;
        const launchTitle = () => {
          if (titleLaunched) return;
          titleLaunched = true;
          if (this.scene && this.scene.start) {
            this.scene.start('LanguageScene');
          }
        };

        setTimeout(launchTitle, 250);
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(launchTitle).catch(launchTitle);
        } else {
          launchTitle();
        }
      }
    }