import { HashService, SessionService, UserService } from "../services/app-store.js";

export class LoginView extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const template = document.querySelector("#login-view-template");
    const clone = template.content.cloneNode(true);
    this.innerHTML = "";
    this.appendChild(clone);
    this.bindEvents();
  }

  bindEvents() {
    this.querySelector("#loginButton").addEventListener("click", () => this.handleLogin());
    this.querySelector("#registerButton").addEventListener("click", () => this.handleRegister());
  }

  showMessage(id, message, type = "error") {
    const element = this.querySelector(`#${id}`);
    element.textContent = message;
    element.classList.remove("hidden");
    element.style.background = type === "error" ? "rgba(248, 215, 218, 0.9)" : "rgba(220, 255, 220, 0.95)";
    element.style.color = type === "error" ? "#842029" : "#0f5132";
  }

  hideMessage(id) {
    this.querySelector(`#${id}`).classList.add("hidden");
  }

  async handleLogin() {
    this.hideMessage("loginMessage");
    const id = this.querySelector("#loginId").value.trim();
    const password = this.querySelector("#loginPassword").value;

    if (!id || !password) {
      this.showMessage("loginMessage", "Complete todos los campos para iniciar sesión.");
      return;
    }

    const user = await UserService.authenticate(id, password);
    if (!user) {
      this.showMessage("loginMessage", "Usuario o contraseña incorrectos.");
      return;
    }

    SessionService.set(user);
    this.dispatchEvent(new CustomEvent("auth-success", { bubbles: true, composed: true }));
  }

  async handleRegister() {
    this.hideMessage("registerMessage");
    const id = this.querySelector("#registerId").value.trim();
    const name = this.querySelector("#registerName").value.trim();
    const role = this.querySelector("#registerRole").value.trim();
    const password = this.querySelector("#registerPassword").value;
    const password2 = this.querySelector("#registerPassword2").value;

    if (!id || !name || !role || !password || !password2) {
      this.showMessage("registerMessage", "Complete todos los campos para registrar el usuario.");
      return;
    }

    if (password !== password2) {
      this.showMessage("registerMessage", "Las contraseñas no coinciden. Revise la información.");
      return;
    }

    if (await UserService.findById(id)) {
      this.showMessage("registerMessage", "Ya existe un usuario con ese número de identificación.");
      return;
    }

    const passwordHash = await HashService.sha256(password);
    await UserService.add({ id, name, role, passwordHash });

    this.showMessage("registerMessage", "Usuario registrado con éxito.", "success");
    this.querySelector("#registerId").value = "";
    this.querySelector("#registerName").value = "";
    this.querySelector("#registerRole").value = "";
    this.querySelector("#registerPassword").value = "";
    this.querySelector("#registerPassword2").value = "";
  }
}

customElements.define("login-view", LoginView);
