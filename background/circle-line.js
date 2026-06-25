(function () {
    const canvas = document.getElementById('meshCanvas');
    const ctx = canvas.getContext('2d');

    let winW = 0, winH = 0;
    let mouseX = 0, mouseY = 0;
    let targetScale = 1, currentScale = 1;
    let targetRot = 0, currentRot = 0;
    let time = 0;

    // ── flowing curves with depth info ───────────────────
    let curves = [];

    function generateCurves() {
        curves.length = 0;
        // use deterministic seed from resize so curves don't jitter
        const r3 = () => Math.random() * 2 - 1;
        const seed = Math.random() * 100;

        function add(p0, p1, p2, p3, lw, alpha, depth) {
            curves.push({ p0, p1, p2, p3, lw, alpha, depth });
        }

        // ── Family A: long sweepers from bottom edge ────
        for (let i = 0; i < 16; i++) {
            const t = i / 15;
            const x0 = -20 + t * winW * 0.35 + r3() * 18;
            const y0 = winH + 15 + r3() * 12;
            const x3 = 40 + t * winW * 0.65 + r3() * 30;
            const y3 = winH * (0.06 + t * 0.18) + r3() * 20;
            const mx = (x0 + x3) / 2 + Math.sin(t * 2.2 + seed) * 160 + r3() * 60;
            const my = (y0 + y3) / 2 - winH * (0.45 + t * 0.20) + Math.cos(t * 1.8 + seed) * 150;

            const depth = 1 - t;
            const lw = 0.3 + (1 - t) * 4.2;
            const alpha = 0.05 + (1 - t) * 0.32;

            add(
                { x: x0, y: y0 },
                { x: x0 + (mx - x0) * 0.34, y: y0 + (my - y0) * 0.28 },
                { x: x3 + (mx - x3) * 0.56, y: y3 + (my - y3) * 0.52 },
                { x: x3, y: y3 },
                lw, alpha, depth
            );
        }

        // ── Family B: medium curves sweeping from left ──
        for (let i = 0; i < 14; i++) {
            const t = i / 13;
            const x0 = -10 + t * 60 + r3() * 20;
            const y0 = winH * (0.75 - t * 0.40) + r3() * 18;
            const x3 = 50 + t * winW * 0.52 + r3() * 25;
            const y3 = winH * (0.12 + t * 0.12) + r3() * 18;
            const mx = (x0 + x3) / 2 + Math.cos(t * 3.2 + seed + 2) * 140 + r3() * 55;
            const my = (y0 + y3) / 2 - winH * (0.38 + t * 0.14) + Math.sin(t * 2.2 + seed) * 110;

            const depth = 0.35 + t * 0.30;
            const lw = 0.3 + (1 - t) * 2.4;
            const alpha = 0.04 + (1 - t) * 0.24;

            add(
                { x: x0, y: y0 },
                { x: x0 + (mx - x0) * 0.38, y: y0 + (my - y0) * 0.34 },
                { x: x3 + (mx - x3) * 0.48, y: y3 + (my - y3) * 0.46 },
                { x: x3, y: y3 },
                lw, alpha, depth
            );
        }

        // ── Family C: short accent curves near corner ───
        for (let i = 0; i < 12; i++) {
            const t = i / 11;
            const x0 = 0 + t * 80 + r3() * 22;
            const y0 = winH - 5 + r3() * 18;
            const x3 = 20 + t * winW * 0.28 + r3() * 18;
            const y3 = winH * (0.45 + t * 0.06) + r3() * 15;
            const mx = (x0 + x3) / 2 + Math.sin(t * 3.5 + seed + 1) * 85 + r3() * 40;
            const my = (y0 + y3) / 2 - winH * (0.28 + t * 0.12) + r3() * 65;

            const depth = 0.65 + t * 0.20;
            const lw = 0.2 + (1 - t) * 1.8;
            const alpha = 0.04 + (1 - t) * 0.20;

            add(
                { x: x0, y: y0 },
                { x: x0 + (mx - x0) * 0.38, y: y0 + (my - y0) * 0.38 },
                { x: x3 + (mx - x3) * 0.38, y: y3 + (my - y3) * 0.38 },
                { x: x3, y: y3 },
                lw, alpha, depth
            );
        }

        // ── Family D: horizontal ribbon-like curves ─────
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const baseY = winH * (0.05 + t * 0.72);
            const waveAmp = 80 + (1 - t) * 90;

            // random wave direction per curve (deterministic per seed)
            const dir1 = Math.sin(i * 3.7 + seed * 2) > 0 ? 1 : -1;
            const dir2 = Math.cos(i * 5.3 + seed * 3) > 0 ? 1 : -1;
            const mag1 = 0.7 + Math.abs(Math.cos(i * 2.1 + seed)) * 0.3;
            const mag2 = 0.4 + Math.abs(Math.sin(i * 4.3 + seed)) * 0.3;

            // randomise where along x the peaks occur
            const peakX1 = 0.18 + Math.abs(Math.sin(i * 2.3 + seed * 0.7)) * 0.20;
            const peakX2 = 0.55 + Math.abs(Math.cos(i * 3.1 + seed * 0.9)) * 0.20;

            const x0 = -50 + r3() * 15;
            const y0 = baseY + Math.sin(t * 2.3 + seed + i * 0.5) * 20;
            const x3 = winW + 50 + r3() * 15;
            const y3 = baseY + Math.cos(t * 3.1 + seed + 1 + i * 0.5) * 20 + Math.sin(t * 1.7 + i) * 14;

            const cp1x = winW * peakX1 + Math.sin(t * 2.5 + seed + i) * 60 + r3() * 40;
            const cp1y = baseY + dir1 * waveAmp * mag1 + Math.sin(t * 4 + seed + i * 2) * 30;
            const cp2x = winW * peakX2 + Math.cos(t * 3.5 + seed + i) * 60 + r3() * 40;
            const cp2y = baseY + dir2 * waveAmp * mag2 + Math.cos(t * 5 + seed + i * 2) * 30;

            const depth = 0.35 + t * 0.30;
            const lw = 1.0 + (1 - t) * 3.2;
            const alpha = 0.06 + (1 - t) * 0.22;

            add(
                { x: x0, y: y0 },
                { x: cp1x, y: cp1y },
                { x: cp2x, y: cp2y },
                { x: x3, y: y3 },
                lw, alpha, depth
            );
        }
    }
    generateCurves();

    // ── bubbles ──────────────────────────────────────────
    const bubbles = [];
    function initBubbles() {
        bubbles.length = 0;
        for (let i = 0; i < 14; i++) {
            bubbles.push({
                x: Math.random(),
                y: Math.random(),
                r: 8 + Math.random() * 24,
                phase: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.25,
                driftY: (Math.random() - 0.5) * 0.25,
                pulseSpeed: 0.3 + Math.random() * 0.4,
                pulseAmp: 0.02 + Math.random() * 0.03,
            });
        }
    }
    initBubbles();

    // ── resize ────────────────────────────────────────────
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        winW = window.innerWidth;
        winH = window.innerHeight;
        canvas.width = winW * dpr;
        canvas.height = winH * dpr;
        ctx.scale(dpr, dpr);
        generateCurves();
        initBubbles();
    }
    window.addEventListener('resize', resize);
    resize();

    // ── mouse / touch ─────────────────────────────────────
    function onMove(x, y) {
        mouseX = x;
        mouseY = y;
    }
    document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // ── cubic bezier evaluator ────────────────────────────
    function bezierPt(p0, p1, p2, p3, t) {
        const u = 1 - t;
        return {
            x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
            y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
        };
    }

    // ── soap bubble ───────────────────────────────────────
    function drawBubble(bx, by, r) {
        const grad = ctx.createRadialGradient(bx - r * 0.25, by - r * 0.25, 0, bx, by, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.03)');
        grad.addColorStop(0.35, 'rgba(210,235,255,0.06)');
        grad.addColorStop(0.55, 'rgba(230,210,255,0.10)');
        grad.addColorStop(0.72, 'rgba(255,215,230,0.13)');
        grad.addColorStop(0.85, 'rgba(190,230,255,0.20)');
        grad.addColorStop(0.94, 'rgba(220,230,255,0.30)');
        grad.addColorStop(1, 'rgba(255,255,255,0.06)');
        ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = 'rgba(220,230,255,0.18)'; ctx.lineWidth = 0.8; ctx.stroke();

        const h1x = bx - r * 0.28, h1y = by - r * 0.30, h1r = r * 0.18;
        const g1 = ctx.createRadialGradient(h1x, h1y, 0, h1x, h1y, h1r);
        g1.addColorStop(0, 'rgba(255,255,255,0.55)'); g1.addColorStop(0.5, 'rgba(255,255,255,0.12)'); g1.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(h1x, h1y, h1r, 0, Math.PI * 2); ctx.fillStyle = g1; ctx.fill();

        const h2x = bx + r * 0.32, h2y = by + r * 0.22, h2r = r * 0.07;
        const g2 = ctx.createRadialGradient(h2x, h2y, 0, h2x, h2y, h2r);
        g2.addColorStop(0, 'rgba(255,255,255,0.30)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(h2x, h2y, h2r, 0, Math.PI * 2); ctx.fillStyle = g2; ctx.fill();
    }

    // ── draw flowing curves with 3D depth ────────────────
    function drawCurves(s, rot) {
        // bounding box for transform centre
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const c of curves) {
            for (const p of [c.p0, c.p1, c.p2, c.p3]) {
                if (p.x < minX) minX = p.x;   if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;   if (p.y > maxY) maxY = p.y;
            }
        }
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);
        ctx.rotate(rot);
        ctx.translate(-cx, -cy);

        // draw background → foreground
        const sorted = [...curves].sort((a, b) => a.depth - b.depth);

        for (const c of sorted) {
            const seg = 36;
            const pts = [];
            for (let i = 0; i <= seg; i++) pts.push(bezierPt(c.p0, c.p1, c.p2, c.p3, i / seg));

            // ── 3D extrusion layer (foreground curves only) ──
            if (c.depth > 0.5) {
                const int = c.depth;               // 0.5 ~ 1
                const extAlpha = c.alpha * (0.25 + int * 0.45);
                const extW = c.lw + (1 + int * 2.5);

                ctx.save();
                // soft drop-shadow
                ctx.shadowColor = 'rgba(0,0,0,0.10)';
                ctx.shadowBlur = 4 + int * 8;
                ctx.shadowOffsetX = 1.5 + int * 2;
                ctx.shadowOffsetY = 1.5 + int * 2;

                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i <= seg; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.strokeStyle = `rgba(50, 50, 55, ${extAlpha.toFixed(3)})`;
                ctx.lineWidth = extW;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                ctx.restore();
            }

            // ── main stroke ──────────────────────────────────
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i <= seg; i++) ctx.lineTo(pts[i].x, pts[i].y);

            // highlight on top of thick foreground strokes
            if (c.depth > 0.7) {
                // even thinner bright highlight on the very top
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i <= seg; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.strokeStyle = `rgba(140, 140, 145, ${(c.alpha * 0.35).toFixed(3)})`;
                ctx.lineWidth = Math.max(0.5, c.lw * 0.25);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                ctx.restore();
            }

            ctx.strokeStyle = `rgba(95, 95, 100, ${c.alpha.toFixed(3)})`;
            ctx.lineWidth = c.lw;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        ctx.restore();
    }

    // ── main loop ─────────────────────────────────────────
    function draw() {
        time += 1;
        ctx.clearRect(0, 0, winW, winH);

        // bounding box for transform (same calc as drawCurves)
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const c of curves) {
            for (const p of [c.p0, c.p1, c.p2, c.p3]) {
                if (p.x < minX) minX = p.x;   if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;   if (p.y > maxY) maxY = p.y;
            }
        }
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        // ── mouse-driven transforms ────────────────────────
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.max(winW, winH) * 0.7;
        const t = Math.min(dist / maxDist, 1);

        targetScale = 1.08 - t * 0.16;
        currentScale += (targetScale - currentScale) * 0.06;
        targetRot = ((mouseX / winW) - 0.5) * 0.12;
        currentRot += (targetRot - currentRot) * 0.06;

        // ── bubbles ────────────────────────────────────────
        for (const b of bubbles) {
            const pulse = 1 + Math.sin(time * b.pulseSpeed + b.phase) * b.pulseAmp;
            const dx = Math.sin(time * 0.008 + b.phase) * b.driftX * 50;
            const dy = Math.cos(time * 0.006 + b.phase * 1.3) * b.driftY * 35;
            drawBubble(b.x * winW + dx, b.y * winH + dy, b.r * pulse);
        }

        // ── flowing curves ─────────────────────────────────
        drawCurves(currentScale, currentRot);

        requestAnimationFrame(draw);
    }

    draw();
})();
