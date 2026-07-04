import { SessionService } from "../services/app-store.js";
import "./login-view.js";
import "./dashboard-view.js";

export class AppRoot extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addEventListener("auth-success", () => this.render());
    this.addEventListener("logout", () => this.render());
  }

  render() {
    const user = SessionService.current();
    this.innerHTML = user ? "<dashboard-view></dashboard-view>" : "<login-view></login-view>";
  }
}

customElements.define("app-root", AppRoot);
