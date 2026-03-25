//script.js

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const petalos = 6;
const anguloFinal = (2 * Math.PI) / petalos;
const PALABRA_CLAVE = "bartolito";

let progreso = 0; // va de 0 a 1
let flores = [];
let accesoConcedido = false;

const pantallaClave = document.getElementById("pantallaClave");
const claveInput = document.getElementById("claveInput");
const claveBtn = document.getElementById("claveBtn");
const claveError = document.getElementById("claveError");

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    actualizarFlores();

    // Si ya termino la animacion, redibujar al nuevo centro.
    if (accesoConcedido && progreso >= 1) {
        animar();
    }
}

function actualizarFlores() {
    const yBase = Math.max(170, canvas.height * 0.38);
    const separacion = canvas.width * 0.28;
    const centro = canvas.width / 2;
    const esMovil = canvas.width <= 768;
    const ajusteYLaterales = esMovil ? 55 : 0;

    flores = [
        {
            x: Math.max(110, centro - separacion),
            y: yBase + ajusteYLaterales,
            escala: 0.8,
        },
        { x: centro, y: yBase, escala: 1 },
        {
            x: Math.min(canvas.width - 110, centro + separacion),
            y: yBase + ajusteYLaterales,
            escala: 0.8,
        },
    ];
}

// función del pétalo
function dibujarPetalo(cx, cy, color = "#F9EE35", colorBorde = "#000000") {
    ctx.beginPath();
    ctx.moveTo(cx, cy);

    // lado izquierdo
    ctx.bezierCurveTo(cx - 82.5, cy - 50, cx - 5, cy - 125, cx, cy - 150);

    // lado derecho (continúa, NO moveTo)
    ctx.bezierCurveTo(cx + 5, cy - 125, cx + 82.5, cy - 50, cx, cy);

    ctx.fillStyle = color;
    ctx.strokeStyle = colorBorde;
    ctx.fill();
    ctx.stroke();
}

function dibujarTalloYHojas(cx, cy, escalaFlor) {
    const baseTalloY = cy + 20 * escalaFlor;
    const finTalloY = Math.min(canvas.height - 20, cy + 280 * escalaFlor);

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#2F8F2F";
    ctx.lineWidth = Math.max(6, 14 * escalaFlor);
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(cx, baseTalloY);
    ctx.lineTo(cx, finTalloY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "#1F6F2A";
    ctx.translate(cx, cy + 145 * escalaFlor);
    ctx.rotate((-35 * Math.PI) / 180);
    ctx.scale(0.45 * escalaFlor, 0.45 * escalaFlor);
    ctx.translate(-cx, -cy);
    dibujarPetalo(cx, cy, "#3FAF4A", "#1F6F2A");
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "#1F6F2A";
    ctx.translate(cx, cy + 190 * escalaFlor);
    ctx.rotate((35 * Math.PI) / 180);
    ctx.scale(0.45 * escalaFlor, 0.45 * escalaFlor);
    ctx.translate(-cx, -cy);
    dibujarPetalo(cx, cy, "#3FAF4A", "#1F6F2A");
    ctx.restore();
}

function dibujarFlor(cx, cy, escalaFlor) {
    const offset = 30 * (Math.PI / 180);

    dibujarTalloYHojas(cx, cy, escalaFlor);

    // Capa trasera completa primero, para que nunca tape a la frontal.
    for (let i = 0; i < petalos; i++) {
        ctx.save();

        const anguloActual = i * anguloFinal * progreso + offset;

        ctx.translate(cx, cy);
        ctx.rotate(anguloActual);
        ctx.scale(1.08 * escalaFlor, 1.08 * escalaFlor); // un poco más grande
        ctx.translate(-cx, -cy);

        dibujarPetalo(cx, cy, "#FBA831", "#9A6B1F");

        ctx.restore();
    }

    for (let i = 0; i < petalos; i++) {
        // Capa delantera al final.
        ctx.save();

        const anguloFrontal = i * anguloFinal * progreso;

        ctx.translate(cx, cy);
        ctx.rotate(anguloFrontal);
        ctx.scale(escalaFlor, escalaFlor);
        ctx.translate(-cx, -cy);

        ctx.globalAlpha = 1;

        dibujarPetalo(cx, cy, "#F9EE35", "#C79E10");

        ctx.restore();
    }

    // centro
    ctx.beginPath();
    ctx.arc(cx, cy, 20 * escalaFlor, 0, Math.PI * 2);
    ctx.fillStyle = "#ED2D4C";
    ctx.strokeStyle = "#A6122D";
    ctx.stroke();
    ctx.fill();
}

function dibujarFondo() {
    const cielo = ctx.createLinearGradient(0, 0, 0, canvas.height);
    cielo.addColorStop(0, "#fff9df");
    cielo.addColorStop(0.55, "#ffeebf");
    cielo.addColorStop(1, "#f8e7a6");
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sueloY = canvas.height * 0.78;
    const suelo = ctx.createLinearGradient(0, sueloY, 0, canvas.height);
    suelo.addColorStop(0, "#8fcf7c");
    suelo.addColorStop(1, "#66a95f");
    ctx.fillStyle = suelo;
    ctx.fillRect(0, sueloY, canvas.width, canvas.height - sueloY);

    // Círculos suaves para dar textura sin distraer.
    const puntos = [
        { x: 0.14, y: 0.18, r: 42 },
        { x: 0.82, y: 0.22, r: 34 },
        { x: 0.28, y: 0.34, r: 22 },
        { x: 0.7, y: 0.4, r: 28 },
    ];

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
    for (const p of puntos) {
        ctx.beginPath();
        ctx.arc(canvas.width * p.x, canvas.height * p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// animación
function animar() {
    if (!accesoConcedido) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarFondo();

    for (const flor of flores) {
        dibujarFlor(flor.x, flor.y, flor.escala);
    }

    // avanzar animación
    if (progreso < 1) {
        progreso += 0.01;
        requestAnimationFrame(animar);
    }
}

function validarClave() {
    const ingresada = claveInput.value.trim().toLowerCase();

    if (ingresada === PALABRA_CLAVE.toLowerCase()) {
        accesoConcedido = true;
        claveError.textContent = "";
        document.body.classList.remove("bloqueado");
        pantallaClave.classList.add("oculta");
        progreso = 0;
        animar();
        return;
    }

    claveError.textContent = "Error: palabra clave incorrecta.";
}

// iniciar
document.body.classList.add("bloqueado");
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

claveBtn.addEventListener("click", validarClave);
claveInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        validarClave();
    }
});
