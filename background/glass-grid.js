(function () {
    'use strict';

    const container = document.getElementById('blobComposite');
    if (!container) return;

    /* ── 配色池 ── */
    const PALETTES = [
        { c1: '#ff6b8a', c2: '#c84b7a' },
        { c1: '#7b6ef0', c2: '#4a3fbf' },
        { c1: '#f9d976', c2: '#e8a83a' },
        { c1: '#5fc8f0', c2: '#2a8fc8' },
        { c1: '#f5967a', c2: '#d96a5a' },
        { c1: '#b48ef0', c2: '#7c5cc0' },
        { c1: '#6fcf97', c2: '#27ae60' },
        { c1: '#f27a7d', c2: '#d63031' },
        { c1: '#74b9ff', c2: '#0984e3' },
        { c1: '#fd79a8', c2: '#e84393' },
        { c1: '#ffeaa7', c2: '#fdcb6e' },
        { c1: '#a29bfe', c2: '#6c5ce7' },
        { c1: '#55efc4', c2: '#00b894' },
        { c1: '#fab1a0', c2: '#e17055' },
    ];

    /* ── 混合模式池 ── */
    const BLEND_MODES = ['screen', 'screen', 'screen', 'overlay', 'screen'];

    /* ── 生成随机色块 ── */
    const blobCount = 8 + Math.floor(Math.random() * 5); // 8~12
    const blobs = [];

    for (let i = 0; i < blobCount; i++) {
        const el = document.createElement('div');
        el.className = 'blob';
        container.appendChild(el);

        // 随机取色
        const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

        // 随机大小（vmin）
        const size = 20 + Math.random() * 45; // 20~65 vmin

        // 随机位置（vw / vh），确保不超出画面太多
        const left = -10 + Math.random() * 90;   // -10~80 vw
        const top  = -10 + Math.random() * 90;   // -10~80 vh

        // 随机模糊半径
        const blur = 40 + Math.random() * 50;    // 40~90 px

        // 随机混合模式
        const blend = BLEND_MODES[Math.floor(Math.random() * BLEND_MODES.length)];

        // 随机透明度
        const opacity = 0.6 + Math.random() * 0.4;

        // 随机渐变中心偏移
        const gx = 30 + Math.random() * 40;  // 30~70%
        const gy = 30 + Math.random() * 40;

        // 随机颜色终止位置
        const stop = 40 + Math.random() * 20; // 40~60%

        el.style.cssText = `
            width: ${size}vmin;
            height: ${size}vmin;
            left: ${left}vw;
            top: ${top}vh;
            filter: blur(${blur}px);
            mix-blend-mode: ${blend};
            opacity: ${opacity.toFixed(2)};
            background: radial-gradient(
                circle at ${gx}% ${gy}%,
                ${palette.c1},
                ${palette.c2} ${stop}%,
                transparent 72%
            );
        `;

        blobs.push({
            el,
            baseL: left,
            baseT: top,
            size,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            speed: 0.15 + Math.random() * 0.3,
            ampX: 4 + Math.random() * 12,
            ampY: 3 + Math.random() * 10,
            blur,
            blurPhase: Math.random() * Math.PI * 2,
            blurAmp: 3 + Math.random() * 6,
            opacity,
            opacityPhase: Math.random() * Math.PI * 2,
        });
    }

    /* ── 网格微动 ── */
    const grid = document.querySelector('.grid-bg');

    /* ── 动画循环 ── */
    let time = 0;

    function animate() {
        time += 0.005;

        for (const b of blobs) {
            const dx = Math.sin(time * b.speed + b.phaseX) * b.ampX;
            const dy = Math.cos(time * b.speed * 0.7 + b.phaseY) * b.ampY;
            const db = Math.sin(time * b.speed * 1.1 + b.blurPhase) * b.blurAmp;
            b.el.style.left = `calc(${b.baseL}vw + ${dx}px)`;
            b.el.style.top  = `calc(${b.baseT}vh + ${dy}px)`;
            b.el.style.filter = `blur(${b.blur + db}px)`;
        }

        if (grid) {
            const shift = Math.sin(time * 0.3) * 1.5;
            grid.style.backgroundPosition = `${shift}px ${shift}px, ${shift * 0.5}px ${shift}px`;
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
