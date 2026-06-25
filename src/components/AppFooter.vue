<script setup>
// Footer estático. La info de contacto/enlaces se podrá alimentar luego.
const year = new Date().getFullYear()
</script>

<template>
  <footer id="nosotros" class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <img src="/logo-mark.png" alt="LØN" />
        </div>
        <p>
          Tu tienda de ropa de marca con las mejores calidades: Essentials,
          camisetas y más para vestir tu día a día.
        </p>
      </div>

      <div class="footer-col">
        <h4>Tienda</h4>
        <a href="#catalogo">Catálogo</a>
        <a href="#catalogo">Novedades</a>
        <a href="#catalogo">Top ventas</a>
      </div>

      <div class="footer-col">
        <h4>Empresa</h4>
        <a href="#nosotros">Sobre LØN</a>
        <a href="#nosotros">Contacto</a>
        <a href="#nosotros">Trabaja con nosotros</a>
      </div>

      <div class="footer-col">
        <h4>Síguenos</h4>
        <a href="#" aria-label="Instagram">Instagram</a>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <span>© {{ year }} LØN. Todos los derechos reservados.</span>
        <span class="footer-soft">Hecho con cariño · Próximamente tienda online</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--bg-elevated);
  border-top: 1px solid var(--border);
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 64px 24px 48px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.footer-logo img {
  height: 56px;
  width: auto;
  object-fit: contain;
}

[data-theme="dark"] .footer-logo img {
  filter: brightness(0) invert(1);
}

.footer-brand p {
  color: var(--text-muted);
  max-width: 320px;
  margin: 0;
}

.footer-col h4 {
  font-size: 0.95rem;
  margin: 0 0 16px;
}

.footer-col a {
  display: block;
  color: var(--text-muted);
  font-size: 0.92rem;
  padding: 5px 0;
  transition: color var(--transition);
}

.footer-col a:hover {
  color: var(--accent);
}

.footer-bottom {
  border-top: 1px solid var(--border);
}

.footer-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px;
  font-size: 0.85rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.footer-soft {
  color: var(--accent);
}

@media (max-width: 760px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 440px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
