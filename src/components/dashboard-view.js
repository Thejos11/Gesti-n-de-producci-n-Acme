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
      <div class="app-shell dashboard-shell">
        <aside class="sidebar">
          <div class="brand">
            <h1>Acme</h1>
            <p>Planta Macondo</p>
          </div>
          <nav class="sidebar-nav">
            <button data-section="users">Usuarios</button>
            <button data-section="inventory">Inventario</button>
            <button data-section="production">Producción</button>
            <button data-section="report">Inventarios</button>
            <button class="secondary" id="logoutButton">Cerrar sesión</button>
          </nav>
        </aside>
        <main class="main-content">
          <header class="header">
            <div>
              <h2>Bienvenido, ${user.name}</h2>
              <p class="small">${user.role}</p>
            </div>
          </header>
          <section class="panel" id="sectionContainer"></section>
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
