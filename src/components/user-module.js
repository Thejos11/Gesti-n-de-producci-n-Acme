import { HashService, UserService } from "../services/app-store.js";

export class UserModule extends HTMLElement {
  constructor() {
    super();
    this.editedId = null;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  async render() {
    const users = await UserService.list();
    this.innerHTML = `
      <h2>Gestión de usuarios</h2>
      <div class="form-grid">
        <div class="input-group">
          <label for="userId">Número de identificación</label>
          <input id="userId" type="text" placeholder="12345678" />
        </div>
        <div class="input-group">
          <label for="userName">Nombre completo</label>
          <input id="userName" type="text" placeholder="Ana Fernández" />
        </div>
        <div class="input-group">
          <label for="userRole">Cargo</label>
          <input id="userRole" type="text" placeholder="Coordinador" />
        </div>
        <div class="input-group">
          <label for="userPassword">Contraseña</label>
          <input id="userPassword" type="password" placeholder="******" />
        </div>
        <div class="input-group">
          <label for="confirmPassword">Confirmar contraseña</label>
          <input id="confirmPassword" type="password" placeholder="******" />
        </div>
        <div class="flex">
          <button class="primary" id="saveUser">Guardar usuario</button>
          <button class="secondary hidden" id="cancelEdit">Cancelar edición</button>
        </div>
      </div>
      <div class="table-wrapper" style="margin-top:24px;">
        <table>
          <thead><tr><th>ID</th><th>Nombre</th><th>Cargo</th><th>Acciones</th></tr></thead>
          <tbody>
            ${users.map((user) => `
              <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>
                  <button class="secondary edit" data-id="${user.id}">Editar</button>
                  <button class="danger delete" data-id="${user.id}">Eliminar</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    this.bindEvents();
  }

  bindEvents() {
    this.querySelector("#saveUser").addEventListener("click", () => this.handleSave());
    this.querySelector("#cancelEdit").addEventListener("click", () => this.cancelEdit());
    this.querySelectorAll("button.edit").forEach((button) => button.addEventListener("click", () => this.startEdit(button.dataset.id)));
    this.querySelectorAll("button.delete").forEach((button) => button.addEventListener("click", () => this.removeUser(button.dataset.id)));
  }

  async handleSave() {
    const id = this.querySelector("#userId").value.trim();
    const name = this.querySelector("#userName").value.trim();
    const role = this.querySelector("#userRole").value.trim();
    const password = this.querySelector("#userPassword").value;
    const confirmPassword = this.querySelector("#confirmPassword").value;

    if (!id || !name || !role) {
      alert("Complete todos los campos para guardar el usuario.");
      return;
    }

    if (this.editedId) {
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          alert("Las contraseñas no coinciden.");
          return;
        }
      }
    } else if (!password || !confirmPassword || password !== confirmPassword) {
      alert("Las contraseñas no coinciden o están incompletas.");
      return;
    }

    const existing = await UserService.findById(id);
    if (this.editedId && this.editedId !== id && existing) {
      alert("Ya existe un usuario con ese número de identificación.");
      return;
    }

    const currentUser = this.editedId ? await UserService.findById(this.editedId) : null;
    const passwordHash = password ? await HashService.sha256(password) : currentUser?.passwordHash;
    const user = { id, name, role, passwordHash };

    if (this.editedId) {
      await UserService.update(this.editedId, user);
      this.editedId = null;
    } else {
      if (await UserService.findById(id)) {
        alert("Ya existe un usuario con ese número de identificación.");
        return;
      }
      await UserService.add(user);
    }

    this.render();
  }

  async startEdit(id) {
    const user = await UserService.findById(id);
    if (!user) return;
    this.editedId = id;
    this.querySelector("#userId").value = user.id;
    this.querySelector("#userName").value = user.name;
    this.querySelector("#userRole").value = user.role;
    this.querySelector("#userPassword").value = "";
    this.querySelector("#confirmPassword").value = "";
    this.querySelector("#cancelEdit").classList.remove("hidden");
  }

  cancelEdit() {
    this.editedId = null;
    this.querySelector("#userId").value = "";
    this.querySelector("#userName").value = "";
    this.querySelector("#userRole").value = "";
    this.querySelector("#userPassword").value = "";
    this.querySelector("#confirmPassword").value = "";
    this.querySelector("#cancelEdit").classList.add("hidden");
  }

  async removeUser(id) {
    if (!confirm("¿Desea eliminar este usuario?")) return;
    await UserService.remove(id);
    this.render();
  }
}

customElements.define("user-module", UserModule);
