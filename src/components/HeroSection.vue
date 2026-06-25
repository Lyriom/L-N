<script setup>
// Sección de presentación. Solo "caparazón" — contenido estático por ahora.
</script>

<template>
  <section id="inicio" class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow">Temporada 2026 · Nueva colección</span>
        <h1 class="hero-title">
          Moda que se siente <span class="accent">tan tuya</span> como atrevida.
        </h1>
        <p class="hero-text">
          En LØN encuentras ropa de marca con las mejores calidades:
          Essentials, camisetas y mucho más. Piezas auténticas para
          quienes visten su propia historia.
        </p>
        <div class="hero-cta">
          <a href="#catalogo" class="btn btn-primary">Ver catálogo</a>
          <a href="#nosotros" class="btn btn-ghost">Conócenos</a>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <strong>+200</strong>
            <span>productos en catálogo</span>
          </div>
          <div class="stat">
            <strong>100%</strong>
            <span>mejores calidades</span>
          </div>
          <div class="stat">
            <strong>24/7</strong>
            <span>tienda online</span>
          </div>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="hero-card hero-card--lg">
          <img src="/logo-mark.png" alt="" class="hero-logo" />
        </div>
        <div class="hero-blob"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 80px 0 96px;
  background:
    radial-gradient(
      circle at 80% 0%,
      color-mix(in srgb, var(--accent) 14%, transparent),
      transparent 45%
    ),
    var(--bg);
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: center;
}

.hero-title {
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 700;
  margin-bottom: 22px;
}

.accent {
  color: var(--accent);
}

.hero-text {
  font-size: 1.12rem;
  color: var(--text-muted);
  max-width: 480px;
  margin-bottom: 32px;
}

.hero-cta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.hero-stats {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.stat strong {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
}

.stat span {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Visual */
.hero-visual {
  position: relative;
  min-height: 420px;
}

.hero-card {
  position: absolute;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.hero-card--lg {
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-logo {
  width: 70%;
  max-width: 280px;
  object-fit: contain;
}

[data-theme="dark"] .hero-logo {
  filter: brightness(0) invert(1);
}

.hero-blob {
  position: absolute;
  inset: 30px -30px auto auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 30%, transparent),
    transparent 70%
  );
  filter: blur(10px);
  z-index: -1;
}

@media (max-width: 880px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .hero-visual {
    display: none;
  }
}
</style>
