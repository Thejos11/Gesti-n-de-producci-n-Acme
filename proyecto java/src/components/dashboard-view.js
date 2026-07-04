import { SessionService } from "../services/app-store.js";
import "./user-module.js";
import "./inventory-module.js";
import "./inventory-report.js";
import "./production-module.js";

export class DashboardView extends HTMLElement {
  constructor() {
    super();
    this.currentSection = "users";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const user = SessionService.current();
    this.innerHTML = `
      <div class="app-shell">
        <header class="header">
          <div>
            <h1>Acme Planta Macondo</h1>
            <p>Bienvenido, ${user.name} · ${user.role}</p>
          </div>
          <nav>
            <button data-section="users">Usuarios</button>
            <button data-section="inventory">Inventario</button>
            <button data-section="production">Producción</button>
            <button data-section="report">Inventarios</button>
            <button class="secondary" id="logoutButton">Cerrar sesión</button>
          </nav>
        </header>
        <main class="main-content">
          <section class="panel" id="sectionContainer"></section>
          <aside class="panel">
            <h2>Indicaciones rápidas</h2>
            <p class="small">Registre usuarios antes de trabajar. Cree materias primas, productos terminados y use el módulo de producción para transformar inventario en productos listos.</p>
            <div class="section-title"><span class="tag">Nota</span></div>
            <p class="small">Cada proceso genera un código consecutivo y reduce la materia prima acorde con la fórmula definida.</p>
          </aside>
        </main>
      </div>
    `;
    this.querySelectorAll("nav button[data-section]").forEach((button) => {
      button.addEventListener("click", () => {
        this.currentSection = button.dataset.section;
        this.renderSection();
      });
    });
    this.querySelector("#logoutButton").addEventListener("click", () => this.logout());
    this.renderSection();
  }

  renderSection() {
    const container = this.querySelector("#sectionContainer");
    switch (this.currentSection) {
      case "inventory":
        container.innerHTML = "<inventory-module></inventory-module>";
        break;
      case "production":
        container.innerHTML = "<production-module></production-module>";
        break;
      case "report":
        container.innerHTML = "<inventory-report></inventory-report>";
        break;
      default:
        container.innerHTML = "<user-module></user-module>";
    }
  }

  logout() {
    SessionService.clear();
    this.dispatchEvent(new CustomEvent("logout", { bubbles: true, composed: true }));
  }
}

customElements.define("dashboard-view", DashboardView);
