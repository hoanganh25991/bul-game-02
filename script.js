class BattlefieldGame {
    constructor() {
        this.playerMoney = 100;
        this.enemyMoney = 100;
        this.score = 0;
        this.playerArmy = [];
        this.enemyArmy = [];
        this.battleInProgress = false;
        this.aiEnabled = true;
        this.aiDifficulty = 'medium'; // easy, medium, hard
        
        // Cấu hình lính
        this.soldierConfig = {
            rifle: {
                cost: 15,
                reward: 5,
                strength: 1,
                name: 'Lính Súng Trường'
            },
            sword: {
                cost: 25,
                reward: 10,
                strength: 2,
                name: 'Lính Kiếm'
            },
            flamethrower: {
                cost: 40,
                reward: 20,
                strength: 3,
                name: 'Lính Súng Phun Lửa'
            }
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.updateDisplay();
        this.bindEvents();
        this.startGameLoop();
        this.startAI();
    }
    
    bindEvents() {
        // Nút tạo lính
        document.querySelectorAll('.create-soldier-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                const cost = parseInt(e.currentTarget.dataset.cost);
                this.createSoldier(type, cost);
            });
        });
        
        // Nút tấn công tổng
        document.getElementById('attack-btn').addEventListener('click', () => {
            this.startBattle();
        });
        
        // Nút tấn công riêng lẻ
        document.getElementById('rifle-attack').addEventListener('click', () => {
            this.individualAttack('rifle');
        });
        
        document.getElementById('sword-attack').addEventListener('click', () => {
            this.individualAttack('sword');
        });
        
        document.getElementById('flame-attack').addEventListener('click', () => {
            this.individualAttack('flamethrower');
        });
        
        // Nút gộp lính
        document.getElementById('merge-btn').addEventListener('click', () => {
            this.mergeSoldiers();
        });
        
        // Nút toggle AI
        document.getElementById('toggle-ai').addEventListener('click', () => {
            this.toggleAI();
        });
        
        // Nút toggle panel
        document.getElementById('toggle-panel').addEventListener('click', () => {
            this.togglePanel();
        });
        
        // Phím tắt
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Click để đóng thông báo
        document.getElementById('battle-notification').addEventListener('click', () => {
            this.hideBattleNotification();
        });
    }
    
    createSoldier(type, cost) {
        if (this.playerMoney >= cost) {
            this.playerMoney -= cost;
            
            // Tìm vị trí ngẫu nhiên trong khu vực quân ta
            const playerZone = document.getElementById('player-army');
            const soldier = this.createSoldierElement(type, false);
            
            // Thêm vào mảng quản lý
            this.playerArmy.push({
                type: type,
                element: soldier,
                id: Date.now() + Math.random()
            });
            
            // Thêm vào DOM với animation
            playerZone.appendChild(soldier);
            
            this.updateDisplay();
            this.showMessage(`Đã tạo ${this.soldierConfig[type].name}!`, 'success');
        } else {
            this.showMessage('Không đủ tiền!', 'error');
        }
    }
    
    createSoldierElement(type, isEnemy) {
        const soldier = document.createElement('div');
        soldier.className = `soldier ${type} ${isEnemy ? 'enemy' : ''}`;
        
        // Tạo HTML cơ bản
        soldier.innerHTML = `
            <div class="soldier-figure">
                <div class="weapon"></div>
            </div>
            <div class="legs"></div>
        `;
        
        // Thêm hiệu ứng tấn công tùy theo loại lính
        this.addAttackEffects(soldier, type);
        
        // Thêm tooltip
        soldier.title = this.soldierConfig[type].name;
        
        // Thêm sự kiện click để chọn lính
        soldier.addEventListener('click', () => {
            this.selectSoldier(soldier);
        });
        
        return soldier;
    }
    
    addAttackEffects(soldier, type) {
        switch(type) {
            case 'sword':
                // Thêm hiệu ứng sóng kiếm
                const swordWave = document.createElement('div');
                swordWave.className = 'sword-wave';
                soldier.appendChild(swordWave);
                break;
                
            case 'flamethrower':
                // Thêm hiệu ứng lửa
                const flameEffect = document.createElement('div');
                flameEffect.className = 'flame-effect';
                
                // Tạo các hạt lửa
                for (let i = 0; i < 8; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'flame-particle';
                    
                    // Vị trí ngẫu nhiên cho các hạt lửa
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = 20 + Math.random() * 30;
                    const dx = Math.cos(angle) * distance;
                    const dy = Math.sin(angle) * distance;
                    
                    particle.style.setProperty('--dx', dx + 'px');
                    particle.style.setProperty('--dy', dy + 'px');
                    particle.style.left = (30 + Math.random() * 10) + 'px';
                    particle.style.top = (15 + Math.random() * 10) + 'px';
                    particle.style.animationDelay = (Math.random() * 0.3) + 's';
                    
                    flameEffect.appendChild(particle);
                }
                
                soldier.appendChild(flameEffect);
                break;
                
            case 'rifle':
                // Thêm hiệu ứng đạn
                const bulletEffect = document.createElement('div');
                bulletEffect.className = 'bullet-effect';
                soldier.appendChild(bulletEffect);
                
                // Thêm hiệu ứng nổ
                const bulletImpact = document.createElement('div');
                bulletImpact.className = 'bullet-impact';
                soldier.appendChild(bulletImpact);
                break;
        }
    }
    
    triggerAttackEffect(soldierElement, type) {
        switch(type) {
            case 'sword':
                // Kích hoạt hiệu ứng sóng kiếm
                const swordWave = soldierElement.querySelector('.sword-wave');
                if (swordWave) {
                    swordWave.classList.remove('active');
                    // Force reflow để reset animation
                    swordWave.offsetHeight;
                    swordWave.classList.add('active');
                    
                    // Xóa class sau khi animation kết thúc
                    setTimeout(() => {
                        swordWave.classList.remove('active');
                    }, 800);
                }
                break;
                
            case 'flamethrower':
                // Kích hoạt hiệu ứng lửa
                const flameEffect = soldierElement.querySelector('.flame-effect');
                if (flameEffect) {
                    flameEffect.classList.remove('active');
                    flameEffect.offsetHeight;
                    flameEffect.classList.add('active');
                    
                    // Kích hoạt animation cho từng hạt lửa
                    const particles = flameEffect.querySelectorAll('.flame-particle');
                    particles.forEach((particle, index) => {
                        particle.style.animation = 'none';
                        particle.offsetHeight;
                        particle.style.animation = `flame-particle 0.8s ease-out ${index * 0.05}s forwards`;
                    });
                    
                    setTimeout(() => {
                        flameEffect.classList.remove('active');
                        particles.forEach(particle => {
                            particle.style.animation = 'none';
                        });
                    }, 800);
                }
                break;
                
            case 'rifle':
                // Kích hoạt hiệu ứng đạn
                const bulletEffect = soldierElement.querySelector('.bullet-effect');
                const bulletImpact = soldierElement.querySelector('.bullet-impact');
                
                if (bulletEffect) {
                    bulletEffect.classList.remove('active');
                    bulletEffect.offsetHeight;
                    bulletEffect.classList.add('active');
                    
                    // Hiệu ứng nổ sau một chút
                    setTimeout(() => {
                        if (bulletImpact) {
                            bulletImpact.style.right = '-150px';
                            bulletImpact.style.top = '30px';
                            bulletImpact.classList.remove('active');
                            bulletImpact.offsetHeight;
                            bulletImpact.classList.add('active');
                            
                            setTimeout(() => {
                                bulletImpact.classList.remove('active');
                            }, 400);
                        }
                    }, 300);
                    
                    setTimeout(() => {
                        bulletEffect.classList.remove('active');
                    }, 600);
                }
                break;
        }
    }
    
    selectSoldier(soldierElement) {
        // Bỏ chọn tất cả lính khác
        document.querySelectorAll('.soldier.selected').forEach(s => {
            s.classList.remove('selected');
        });
        
        // Chọn lính này
        soldierElement.classList.add('selected');
        
        // Thêm CSS cho lính được chọn
        if (!document.querySelector('#selected-soldier-style')) {
            const style = document.createElement('style');
            style.id = 'selected-soldier-style';
            style.textContent = `
                .soldier.selected {
                    transform: scale(1.2);
                    filter: drop-shadow(0 0 20px #f1c40f);
                    z-index: 10;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    mergeSoldiers() {
        // Gộp lính cùng loại trong quân ta
        const typeGroups = {};
        
        this.playerArmy.forEach(soldier => {
            if (!typeGroups[soldier.type]) {
                typeGroups[soldier.type] = [];
            }
            typeGroups[soldier.type].push(soldier);
        });
        
        let merged = false;
        let totalMerged = 0;
        
        Object.keys(typeGroups).forEach(type => {
            const soldiers = typeGroups[type];
            if (soldiers.length > 1) {
                // Tính tổng số lượng lính (bao gồm cả số đếm hiện có)
                let totalCount = 0;
                soldiers.forEach(soldier => {
                    totalCount += this.getSoldierCount(soldier.element);
                });
                
                // Giữ lại lính đầu tiên, xóa các lính khác
                const keepSoldier = soldiers[0];
                
                // Xóa các lính thừa
                for (let i = 1; i < soldiers.length; i++) {
                    soldiers[i].element.remove();
                    const index = this.playerArmy.indexOf(soldiers[i]);
                    this.playerArmy.splice(index, 1);
                }
                
                // Thêm số đếm tổng cho lính được giữ lại (tối đa 100)
                const finalCount = Math.min(totalCount, 100);
                this.addSoldierCount(keepSoldier.element, finalCount);
                totalMerged += soldiers.length - 1;
                merged = true;
            }
        });
        
        if (merged) {
            this.showMessage(`Đã gộp ${totalMerged} lính cùng loại!`, 'success');
        } else {
            this.showMessage('Không có lính nào để gộp!', 'info');
        }
    }
    
    addSoldierCount(soldierElement, count) {
        // Xóa số đếm cũ nếu có
        const oldCount = soldierElement.querySelector('.soldier-count');
        if (oldCount) {
            oldCount.remove();
        }
        
        // Giới hạn số lượng tối đa là 100
        const limitedCount = Math.min(count, 100);
        
        // Thêm số đếm mới nếu >= 2 và <= 100
        if (limitedCount >= 2) {
            const countElement = document.createElement('div');
            countElement.className = 'soldier-count';
            
            // Thêm class cho số lớn (3 chữ số)
            if (limitedCount >= 100) {
                countElement.classList.add('large-number');
            }
            
            countElement.textContent = limitedCount;
            soldierElement.appendChild(countElement);
        }
    }
    
    createEnemySoldier(type) {
        const cost = this.soldierConfig[type].cost;
        if (this.enemyMoney >= cost) {
            this.enemyMoney -= cost;
            
            const enemyZone = document.getElementById('enemy-army');
            const enemy = this.createSoldierElement(type, true);
            
            // Thêm vào mảng quản lý
            this.enemyArmy.push({
                type: type,
                element: enemy,
                id: Date.now() + Math.random()
            });
            
            // Thêm vào DOM
            enemyZone.appendChild(enemy);
            
            this.updateDisplay();
            return true;
        }
        return false;
    }
    
    spawnRandomEnemy() {
        const types = Object.keys(this.soldierConfig);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        if (this.createEnemySoldier(randomType)) {
            this.showMessage(`AI tạo: ${this.soldierConfig[randomType].name}!`, 'warning');
        }
    }
    
    individualAttack(soldierType) {
        if (this.battleInProgress) return;
        
        // Tìm lính của loại này trong quân ta
        const playerSoldiers = this.playerArmy.filter(s => s.type === soldierType);
        if (playerSoldiers.length === 0) {
            this.showMessage(`Không có ${this.soldierConfig[soldierType].name} để tấn công!`, 'error');
            return;
        }
        
        // Tìm kẻ thù cùng loại
        const enemySoldiers = this.enemyArmy.filter(s => s.type === soldierType);
        if (enemySoldiers.length === 0) {
            this.showMessage(`Không có kẻ thù ${this.soldierConfig[soldierType].name} để tấn công!`, 'error');
            return;
        }
        
        this.battleInProgress = true;
        
        // Hiệu ứng chiến đấu cho loại lính này
        playerSoldiers.forEach(s => {
            s.element.classList.add('battle-effect');
            this.triggerAttackEffect(s.element, soldierType);
        });
        enemySoldiers.forEach(s => {
            s.element.classList.add('battle-effect');
            this.triggerAttackEffect(s.element, soldierType);
        });
        
        setTimeout(() => {
            // Tính sức mạnh
            const playerStrength = playerSoldiers.reduce((total, soldier) => {
                const count = this.getSoldierCount(soldier.element);
                return total + (this.soldierConfig[soldier.type].strength * count);
            }, 0);
            
            const enemyStrength = enemySoldiers.reduce((total, soldier) => {
                const count = this.getSoldierCount(soldier.element);
                return total + (this.soldierConfig[soldier.type].strength * count);
            }, 0);
            
            // Xử lý kết quả
            const bonusMoney = 50; // Tiền thưởng cho cả hai bên (công bằng)
            
            if (playerStrength > enemyStrength) {
                // Thắng - nhận tiền thưởng
                const reward = enemySoldiers.reduce((total, enemy) => {
                    const count = this.getSoldierCount(enemy.element);
                    return total + (this.soldierConfig[enemy.type].reward * count);
                }, 0);
                
                this.playerMoney += reward + bonusMoney; // Thưởng chiến thắng + bonus
                this.enemyMoney += bonusMoney; // Địch cũng được thưởng
                this.score += reward;
                
                // Xóa kẻ thù bị đánh bại
                enemySoldiers.forEach(enemy => {
                    enemy.element.remove();
                    const index = this.enemyArmy.indexOf(enemy);
                    this.enemyArmy.splice(index, 1);
                });
                
                this.showMessage(`${this.soldierConfig[soldierType].name} thắng! +${reward + bonusMoney} đồng (Địch +${bonusMoney})`, 'success');
                
            } else if (playerStrength < enemyStrength) {
                // Thua - mất lính
                this.enemyMoney += bonusMoney; // Địch thắng được thưởng
                this.playerMoney += bonusMoney; // Ta cũng được thưởng công bằng
                
                playerSoldiers.forEach(soldier => {
                    const count = this.getSoldierCount(soldier.element);
                    if (count > 1) {
                        this.addSoldierCount(soldier.element, count - 1);
                    } else {
                        soldier.element.remove();
                        const index = this.playerArmy.indexOf(soldier);
                        this.playerArmy.splice(index, 1);
                    }
                });
                
                this.showMessage(`${this.soldierConfig[soldierType].name} thua! Mất lính nhưng +${bonusMoney} đồng (Địch +${bonusMoney})`, 'error');
                
            } else {
                // Hòa - cả hai mất lính
                this.playerMoney += bonusMoney; 
                this.enemyMoney += bonusMoney; // Cả hai đều được thưởng công bằng
                
                [...playerSoldiers, ...enemySoldiers].forEach(soldier => {
                    const count = this.getSoldierCount(soldier.element);
                    if (count > 1) {
                        this.addSoldierCount(soldier.element, Math.ceil(count / 2));
                    } else {
                        soldier.element.remove();
                        const army = soldier.element.classList.contains('enemy') ? this.enemyArmy : this.playerArmy;
                        const index = army.indexOf(soldier);
                        army.splice(index, 1);
                    }
                });
                
                this.showMessage(`${this.soldierConfig[soldierType].name} hòa! Cả hai bên +${bonusMoney} đồng`, 'info');
            }
            
            // Xóa hiệu ứng
            document.querySelectorAll('.battle-effect').forEach(el => {
                el.classList.remove('battle-effect');
            });
            
            this.updateDisplay();
            this.battleInProgress = false;
        }, 800);
    }
    
    startBattle() {
        if (this.battleInProgress) return;
        
        if (this.playerArmy.length === 0) {
            this.showMessage('Không có lính để chiến đấu!', 'error');
            return;
        }
        
        if (this.enemyArmy.length === 0) {
            this.showMessage('Không có kẻ thù để chiến đấu!', 'error');
            return;
        }
        
        this.battleInProgress = true;
        
        // Hiệu ứng chiến đấu cho tất cả lính
        this.playerArmy.forEach(soldier => {
            soldier.element.classList.add('battle-effect');
            this.triggerAttackEffect(soldier.element, soldier.type);
        });
        
        this.enemyArmy.forEach(soldier => {
            soldier.element.classList.add('battle-effect');
            this.triggerAttackEffect(soldier.element, soldier.type);
        });
        
        // Hiệu ứng chiến đấu cho sân
        const battlefield = document.querySelector('.battlefield-arena');
        battlefield.classList.add('battle-effect');
        
        // Tính toán kết quả
        const playerStrength = this.calculateArmyStrength(this.playerArmy);
        const enemyStrength = this.calculateArmyStrength(this.enemyArmy);
        
        setTimeout(() => {
            // Xóa hiệu ứng chiến đấu
            battlefield.classList.remove('battle-effect');
            document.querySelectorAll('.soldier.battle-effect').forEach(soldier => {
                soldier.classList.remove('battle-effect');
            });
            
            this.resolveBattle(playerStrength, enemyStrength);
            this.battleInProgress = false;
        }, 1000);
    }
    
    calculateArmyStrength(army) {
        return army.reduce((total, soldier) => {
            const count = this.getSoldierCount(soldier.element);
            return total + (this.soldierConfig[soldier.type].strength * count);
        }, 0);
    }
    
    getSoldierCount(soldierElement) {
        const countElement = soldierElement.querySelector('.soldier-count');
        return countElement ? parseInt(countElement.textContent) : 1;
    }
    
    resolveBattle(playerStrength, enemyStrength) {
        let result, reward = 0;
        const bonusMoney = 50; // Tiền thưởng cho cả hai bên (công bằng)
        
        if (playerStrength > enemyStrength) {
            // Thắng
            result = 'THẮNG!';
            reward = this.calculateReward();
            this.playerMoney += reward + bonusMoney; // Thưởng chiến thắng + bonus
            this.enemyMoney += bonusMoney; // Địch cũng được thưởng
            this.score += reward;
            
            // Xóa tất cả kẻ thù
            this.enemyArmy.forEach(enemy => enemy.element.remove());
            this.enemyArmy = [];
            
            this.showBattleNotification('🏆 CHIẾN THẮNG!', `+${reward + bonusMoney} đồng (Địch +${bonusMoney})`, 'victory');
            
        } else if (playerStrength < enemyStrength) {
            // Thua
            result = 'THUA!';
            this.enemyMoney += bonusMoney; // Địch thắng được thưởng
            this.playerMoney += bonusMoney; // Ta cũng được thưởng công bằng
            this.loseSoldiers();
            this.showBattleNotification('💀 THẤT BẠI!', `Mất lính nhưng +${bonusMoney} đồng (Địch +${bonusMoney})`, 'defeat');
            
        } else {
            // Hòa
            result = 'HÒA!';
            this.playerMoney += bonusMoney; 
            this.enemyMoney += bonusMoney; // Cả hai đều được thưởng công bằng
            this.loseSoldiers();
            this.enemyArmy = this.enemyArmy.slice(0, Math.floor(this.enemyArmy.length / 2));
            this.showBattleNotification('⚖️ HÒA NHAU!', `Cả hai bên +${bonusMoney} đồng`, 'draw');
        }
        
        this.updateDisplay();
        
        // Tự động tạo kẻ thù mới sau một lúc
        setTimeout(() => {
            if (this.enemyArmy.length < 3) {
                this.spawnRandomEnemy();
            }
        }, 3000);
    }
    
    calculateReward() {
        return this.enemyArmy.reduce((total, enemy) => {
            const count = this.getSoldierCount(enemy.element);
            return total + (this.soldierConfig[enemy.type].reward * count);
        }, 0);
    }
    
    loseSoldiers() {
        if (this.playerArmy.length === 0) return;
        
        // Mất ngẫu nhiên 1-2 lính
        const lossCount = Math.min(Math.floor(Math.random() * 2) + 1, this.playerArmy.length);
        
        for (let i = 0; i < lossCount; i++) {
            const randomIndex = Math.floor(Math.random() * this.playerArmy.length);
            const soldier = this.playerArmy[randomIndex];
            const count = this.getSoldierCount(soldier.element);
            
            if (count > 1) {
                // Giảm số lượng
                this.addSoldierCount(soldier.element, count - 1);
            } else {
                // Xóa lính
                soldier.element.remove();
                this.playerArmy.splice(randomIndex, 1);
            }
        }
    }
    
    showBattleNotification(title, subtitle, type) {
        const notification = document.getElementById('battle-notification');
        const titleElement = notification.querySelector('.notification-text');
        const subtitleElement = notification.querySelector('.notification-reward');
        
        titleElement.textContent = title;
        subtitleElement.textContent = subtitle;
        
        // Thay đổi màu sắc theo kết quả
        notification.style.borderColor = type === 'victory' ? '#27ae60' : 
                                       type === 'defeat' ? '#e74c3c' : '#f39c12';
        
        notification.classList.remove('hidden');
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            this.hideBattleNotification();
        }, 3000);
    }
    
    hideBattleNotification() {
        document.getElementById('battle-notification').classList.add('hidden');
    }
    
    togglePanel() {
        const panel = document.querySelector('.control-panel');
        const content = panel.querySelector('.panel-content');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            panel.style.height = 'auto';
        } else {
            content.style.display = 'none';
            panel.style.height = '60px';
        }
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case '1':
                document.querySelector('[data-type="rifle"]').click();
                break;
            case '2':
                document.querySelector('[data-type="sword"]').click();
                break;
            case '3':
                document.querySelector('[data-type="flamethrower"]').click();
                break;
            case ' ':
                e.preventDefault();
                document.getElementById('attack-btn').click();
                break;
            case 'q':
            case 'Q':
                document.getElementById('rifle-attack').click();
                break;
            case 'w':
            case 'W':
                document.getElementById('sword-attack').click();
                break;
            case 'e':
            case 'E':
                document.getElementById('flame-attack').click();
                break;
            case 'm':
            case 'M':
                document.getElementById('merge-btn').click();
                break;
            case 'a':
            case 'A':
                document.getElementById('toggle-ai').click();
                break;
            case 'Escape':
                this.hideBattleNotification();
                break;
        }
    }
    
    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        const btn = document.getElementById('toggle-ai');
        const status = document.getElementById('ai-status');
        
        if (this.aiEnabled) {
            btn.textContent = '🤖 AI: BẬT';
            status.textContent = 'Hoạt động';
            this.showMessage('AI đã được bật!', 'success');
        } else {
            btn.textContent = '🤖 AI: TẮT';
            status.textContent = 'Tạm dừng';
            this.showMessage('AI đã được tắt!', 'info');
        }
    }
    
    startAI() {
        setInterval(() => {
            if (!this.aiEnabled || this.battleInProgress) return;
            
            // AI quyết định hành động
            this.aiMakeDecision();
        }, 3000); // AI hành động mỗi 3 giây
    }
    
    aiMakeDecision() {
        const playerStrength = this.calculateArmyStrength(this.playerArmy);
        const enemyStrength = this.calculateArmyStrength(this.enemyArmy);
        
        // AI ưu tiên tạo lính khi yếu hơn
        if (enemyStrength < playerStrength * 0.8 && this.enemyMoney >= 15) {
            this.aiCreateSoldier();
        }
        // AI tấn công khi mạnh hơn
        else if (enemyStrength > playerStrength * 1.2 && this.enemyArmy.length > 0 && this.playerArmy.length > 0) {
            this.aiAttack();
        }
        // AI tạo lính ngẫu nhiên
        else if (Math.random() < 0.4 && this.enemyMoney >= 15) {
            this.aiCreateSoldier();
        }
    }
    
    aiCreateSoldier() {
        const types = Object.keys(this.soldierConfig);
        const affordableTypes = types.filter(type => this.enemyMoney >= this.soldierConfig[type].cost);
        
        if (affordableTypes.length === 0) return;
        
        // AI thông minh hơn dựa trên độ khó
        let selectedType;
        switch (this.aiDifficulty) {
            case 'easy':
                selectedType = affordableTypes[0]; // Chọn rẻ nhất
                break;
            case 'hard':
                selectedType = affordableTypes[affordableTypes.length - 1]; // Chọn đắt nhất
                break;
            default: // medium
                selectedType = affordableTypes[Math.floor(Math.random() * affordableTypes.length)];
        }
        
        this.createEnemySoldier(selectedType);
    }
    
    aiAttack() {
        // AI tấn công tổng
        if (Math.random() < 0.7) {
            setTimeout(() => this.startBattle(), 1000);
        }
        // AI tấn công riêng lẻ
        else {
            const types = Object.keys(this.soldierConfig);
            const availableTypes = types.filter(type => {
                return this.enemyArmy.some(s => s.type === type) && 
                       this.playerArmy.some(s => s.type === type);
            });
            
            if (availableTypes.length > 0) {
                const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                setTimeout(() => this.individualAttack(randomType), 1000);
            }
        }
    }
    
    updateDisplay() {
        // Cập nhật HUD
        document.getElementById('player-money').textContent = this.playerMoney;
        document.getElementById('enemy-money').textContent = this.enemyMoney;
        document.getElementById('player-count').textContent = this.playerArmy.length;
        document.getElementById('enemy-count').textContent = this.enemyArmy.length;
        document.getElementById('ai-money-display').textContent = this.enemyMoney;
        
        // Cập nhật trạng thái nút tạo lính
        document.querySelectorAll('.create-soldier-btn').forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            btn.disabled = this.playerMoney < cost;
        });
        
        // Cập nhật trạng thái nút tấn công riêng lẻ
        const rifleBtn = document.getElementById('rifle-attack');
        const swordBtn = document.getElementById('sword-attack');
        const flameBtn = document.getElementById('flame-attack');
        
        rifleBtn.disabled = !this.canIndividualAttack('rifle');
        swordBtn.disabled = !this.canIndividualAttack('sword');
        flameBtn.disabled = !this.canIndividualAttack('flamethrower');
    }
    
    canIndividualAttack(type) {
        return this.playerArmy.some(s => s.type === type) && 
               this.enemyArmy.some(s => s.type === type) && 
               !this.battleInProgress;
    }
    
    showMessage(message, type) {
        // Tạo thông báo nổi
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            backdrop-filter: blur(10px);
        `;
        
        switch (type) {
            case 'success':
                messageDiv.style.background = 'rgba(39, 174, 96, 0.9)';
                break;
            case 'error':
                messageDiv.style.background = 'rgba(231, 76, 60, 0.9)';
                break;
            case 'warning':
                messageDiv.style.background = 'rgba(243, 156, 18, 0.9)';
                break;
            default:
                messageDiv.style.background = 'rgba(52, 152, 219, 0.9)';
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => messageDiv.remove(), 300);
        }, 2500);
    }
    
    startGameLoop() {
        // Game loop chính - cập nhật display
        setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }
}

// Thêm CSS cho animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Khởi tạo game khi trang web load
document.addEventListener('DOMContentLoaded', () => {
    new BattlefieldGame();
});

// Ngăn context menu chuột phải
document.addEventListener('contextmenu', e => e.preventDefault());