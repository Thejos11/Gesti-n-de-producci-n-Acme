import { SessionService } from "../services/app-store.js";
import "./user-module.js";
import "./inventory-module.js";
import "./inventory-report.js";
import "./production-module.js";
import "./recipe-module.js";

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
    const template = document.querySelector("#dashboard-view-template");
    const clone = template.content.cloneNode(true);
    this.innerHTML = "";
    this.appendChild(clone);

  
    this.querySelector("#welcomeHeader").textContent = `Bienvenido, ${user.name}`;
    this.querySelector("#userRoleHeader").textContent = user.role;


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
      case "recipes":
        container.innerHTML = "<recipe-module></recipe-module>";
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
