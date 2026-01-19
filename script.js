// Lightning Canvas
const lightningCanvas = document.getElementById('lightningCanvas');
const lightningCtx = lightningCanvas.getContext('2d');

// Particle Canvas
const particleCanvas = document.getElementById('particleCanvas');
const particleCtx = particleCanvas.getContext('2d');

// Set canvas sizes
function resizeCanvases() {
    lightningCanvas.width = window.innerWidth;
    lightningCanvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// Lightning System - Enhanced Realistic Version
class Lightning {
    constructor() {
        this.lightnings = [];
        this.lastFlash = 0;
        this.flashInterval = 2000 + Math.random() * 3000; // 2-5 seconds
        this.screenFlash = { opacity: 0 };
    }

    // Fractal lightning path generation using recursive subdivision
    generateFractalPath(x1, y1, x2, y2, offset, depth = 0, maxDepth = 8) {
        if (depth >= maxDepth || offset < 1) {
            return [{ x: x2, y: y2 }];
        }

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Add randomness perpendicular to the line
        const dx = x2 - x1;
        const dy = y2 - y1;
        const perpX = -dy;
        const perpY = dx;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        
        const normalizedPerpX = perpX / perpLength;
        const normalizedPerpY = perpY / perpLength;
        
        // Random displacement
        const displacement = (Math.random() - 0.5) * offset;
        const newX = midX + normalizedPerpX * displacement;
        const newY = midY + normalizedPerpY * displacement;
        
        const newOffset = offset * 0.5;
        
        // Recursively generate left and right segments
        const leftPath = this.generateFractalPath(x1, y1, newX, newY, newOffset, depth + 1, maxDepth);
        const rightPath = this.generateFractalPath(newX, newY, x2, y2, newOffset, depth + 1, maxDepth);
        
        return [{ x: newX, y: newY }, ...leftPath.slice(1), ...rightPath];
    }

    // Generate main lightning bolt with branches
    generateLightningBolt(startX, startY, endX, endY) {
        const mainPath = this.generateFractalPath(startX, startY, endX, endY, 80, 0, 10);
        
        // Add branches (smaller lightning forks)
        const branches = [];
        const numBranches = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < numBranches; i++) {
            const branchPointIndex = Math.floor(Math.random() * (mainPath.length - 1)) + 1;
            const branchPoint = mainPath[branchPointIndex];
            
            // Random branch direction
            const branchLength = 30 + Math.random() * 60;
            const branchAngle = (Math.random() - 0.5) * Math.PI * 0.6;
            const branchEndX = branchPoint.x + Math.cos(branchAngle) * branchLength;
            const branchEndY = branchPoint.y + Math.sin(branchAngle) * branchLength;
            
            // Only add branch if it's within canvas bounds
            if (branchEndY > 0 && branchEndY < lightningCanvas.height) {
                const branchPath = this.generateFractalPath(
                    branchPoint.x, branchPoint.y,
                    branchEndX, branchEndY,
                    30, 0, 6
                );
                branches.push(branchPath);
            }
        }
        
        return { main: mainPath, branches: branches };
    }

    create() {
        const startX = Math.random() * lightningCanvas.width;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 300;
        const endY = lightningCanvas.height * (0.2 + Math.random() * 0.5);
        
        const bolt = this.generateLightningBolt(startX, startY, endX, endY);
        
        this.lightnings.push({
            bolt: bolt,
            opacity: 1,
            life: 0.08 + Math.random() * 0.12, // Faster fade for realism
            age: 0,
            flicker: Math.random() * 0.3 + 0.7 // Initial brightness variation
        });
        
        // Screen flash effect
        this.screenFlash.opacity = 0.15 + Math.random() * 0.1;
    }

    // Draw a single lightning segment with realistic styling
    drawLightningSegment(points, opacity, width = 2) {
        if (points.length < 2) return;
        
        // Draw outer glow (blue/purple)
        lightningCtx.strokeStyle = `rgba(135, 206, 250, ${opacity * 0.3})`;
        lightningCtx.lineWidth = width * 4;
        lightningCtx.shadowBlur = 30;
        lightningCtx.shadowColor = 'rgba(135, 206, 250, 0.8)';
        lightningCtx.lineCap = 'round';
        lightningCtx.lineJoin = 'round';
        
        lightningCtx.beginPath();
        lightningCtx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            lightningCtx.lineTo(points[i].x, points[i].y);
        }
        lightningCtx.stroke();
        
        // Draw middle glow (cyan)
        lightningCtx.strokeStyle = `rgba(173, 216, 230, ${opacity * 0.5})`;
        lightningCtx.lineWidth = width * 2.5;
        lightningCtx.shadowBlur = 20;
        lightningCtx.shadowColor = 'rgba(173, 216, 230, 0.9)';
        lightningCtx.stroke();
        
        // Draw core (bright white)
        lightningCtx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        lightningCtx.lineWidth = width;
        lightningCtx.shadowBlur = 15;
        lightningCtx.shadowColor = 'rgba(255, 255, 255, 1)';
        lightningCtx.stroke();
        
        // Reset shadow
        lightningCtx.shadowBlur = 0;
    }

    draw() {
        // Clear previous frame
        lightningCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);
        
        // Fade screen flash
        if (this.screenFlash.opacity > 0) {
            this.screenFlash.opacity -= 0.05;
            if (this.screenFlash.opacity < 0) this.screenFlash.opacity = 0;
            
            // Draw screen flash overlay (semi-transparent white)
            lightningCtx.fillStyle = `rgba(255, 255, 255, ${this.screenFlash.opacity})`;
            lightningCtx.fillRect(0, 0, lightningCanvas.width, lightningCanvas.height);
        }
        
        this.lightnings.forEach((lightning, index) => {
            lightning.age += 0.016; // ~60fps timing
            
            // Realistic fade with flicker
            const baseOpacity = Math.max(0, 1 - (lightning.age / lightning.life));
            const flicker = Math.sin(lightning.age * 50) * 0.1 + 0.9;
            lightning.opacity = baseOpacity * lightning.flicker * flicker;
            
            if (lightning.opacity <= 0 || lightning.age >= lightning.life) {
                this.lightnings.splice(index, 1);
                return;
            }

            // Draw main bolt
            this.drawLightningSegment(lightning.bolt.main, lightning.opacity, 2.5);
            
            // Draw branches with slightly less opacity
            lightning.bolt.branches.forEach(branch => {
                this.drawLightningSegment(branch, lightning.opacity * 0.7, 1.5);
            });
        });
    }

    update() {
        const now = Date.now();
        if (now - this.lastFlash > this.flashInterval) {
            // Sometimes create multiple simultaneous strikes
            const numStrikes = Math.random() > 0.7 ? 2 : 1;
            for (let i = 0; i < numStrikes; i++) {
                setTimeout(() => {
                    this.create();
                    if (i === 0) {
                        triggerLightningEffects();
                    }
                }, i * 50);
            }
            
            this.lastFlash = now;
            this.flashInterval = 2000 + Math.random() * 3000;
        }
        
        this.draw();
    }
}

const lightning = new Lightning();

// Particle Fog System
class ParticleFog {
    constructor() {
        this.particles = [];
        this.particleCount = 50;
        this.init();
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }

    update() {
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = particleCanvas.width;
            if (particle.x > particleCanvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = particleCanvas.height;
            if (particle.y > particleCanvas.height) particle.y = 0;
            
            // Draw particle
            particleCtx.beginPath();
            particleCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            particleCtx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            particleCtx.fill();
        });
    }
}

const particleFog = new ParticleFog();

// Lightning Effects Trigger
function triggerLightningEffects() {
    // Screen shake (more intense)
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, 400);
    
    // Flash effect on text elements
    const title = document.getElementById('mainTitle');
    const subtitle = document.getElementById('subtitle');
    const pepeCharacter = document.getElementById('pepeCharacter');
    
    if (title) {
        title.classList.add('lightning-flash');
        setTimeout(() => {
            title.classList.remove('lightning-flash');
        }, 200);
        
        // Intensify text glow with blue tint
        title.style.textShadow = '0 0 50px rgba(135, 206, 250, 0.9), 0 0 30px rgba(255, 255, 255, 0.8)';
        setTimeout(() => {
            title.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
        }, 300);
    }
    
    if (subtitle) {
        subtitle.classList.add('lightning-flash');
        setTimeout(() => {
            subtitle.classList.remove('lightning-flash');
        }, 200);
    }
    
    // Flash effect on Pepe character
    if (pepeCharacter) {
        pepeCharacter.style.filter = 'drop-shadow(0 0 60px rgba(135, 206, 250, 0.9)) brightness(1.2)';
        setTimeout(() => {
            pepeCharacter.style.filter = 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))';
        }, 250);
    }
    
    // Add brief flash to token cards
    document.querySelectorAll('.token-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.boxShadow = '0 0 40px rgba(135, 206, 250, 0.6)';
            setTimeout(() => {
                card.style.boxShadow = '';
            }, 200);
        }, index * 50);
    });
}

// Mouse Electric Ripple Effect
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.98) { // Occasional ripple
        createElectricRipple(e.clientX, e.clientY);
    }
});

function createElectricRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'electric-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Button Spark Effects
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create multiple sparks
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.left = x + 'px';
            spark.style.top = y + 'px';
            
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 30 + Math.random() * 20;
            const sparkX = Math.cos(angle) * distance;
            const sparkY = Math.sin(angle) * distance;
            
            spark.style.setProperty('--spark-x', sparkX + 'px');
            spark.style.setProperty('--spark-y', sparkY + 'px');
            
            this.appendChild(spark);
            
            setTimeout(() => {
                spark.remove();
            }, 400);
        }
    });
});

// Scroll Animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// Social Icon Lightning Pulse
function pulseSocialIcons() {
    const icons = document.querySelectorAll('.social-icon');
    icons.forEach((icon, index) => {
        setTimeout(() => {
            icon.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.6)';
            setTimeout(() => {
                icon.style.boxShadow = '';
            }, 300);
        }, index * 200);
    });
}

setInterval(pulseSocialIcons, 5000);

// Animation Loop
function animate() {
    lightning.update();
    particleFog.update();
    requestAnimationFrame(animate);
}

animate();

// Initial fade-in
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Contract Address Copy Functionality
const contractAddress = document.getElementById('contractAddress');
const copyFeedback = document.getElementById('copyFeedback');

if (contractAddress) {
    contractAddress.addEventListener('click', async () => {
        const address = 'nzs4mkN6UnPZWGQaG6FNsCDcYnScHqDkbmskFQMpump';
        
        try {
            await navigator.clipboard.writeText(address);
            
            // Show feedback
            copyFeedback.style.opacity = '1';
            copyFeedback.style.transform = 'translateY(0)';
            
            // Add visual feedback to the address container
            contractAddress.classList.add('copied');
            
            // Reset after animation
            setTimeout(() => {
                copyFeedback.style.opacity = '0';
                copyFeedback.style.transform = 'translateY(-10px)';
                contractAddress.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = address;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                copyFeedback.style.opacity = '1';
                copyFeedback.style.transform = 'translateY(0)';
                contractAddress.classList.add('copied');
                setTimeout(() => {
                    copyFeedback.style.opacity = '0';
                    copyFeedback.style.transform = 'translateY(-10px)';
                    contractAddress.classList.remove('copied');
                }, 2000);
            } catch (fallbackErr) {
                console.error('Failed to copy:', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    });
}
