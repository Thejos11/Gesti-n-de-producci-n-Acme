import { HashService, UserService } from "../services/app-store.js";

export class UserModule extends HTMLElement {
  constructor() {
    super();
    this.editedId = null;
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const users = await UserService.list();
    const template = document.querySelector("#user-module-template");
    const clone = template.content.cloneNode(true);
    this.innerHTML = "";
    this.appendChild(clone);

    // Populate table
    const tbody = this.querySelector("#userTableBody");
    tbody.innerHTML = users.map((user) => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.role}</td>
        <td>
          <button class="secondary edit" data-id="${user.id}">Editar</button>
          <button class="danger delete" data-id="${user.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    this.bindEvents();
  }

  bindEvents() {
    this.addEventListener("click", (e) => {
      if (e.target.id === "saveUser") this.handleSave();
      else if (e.target.id === "cancelEdit") this.cancelEdit();
      else if (e.target.classList.contains("edit")) this.startEdit(e.target.dataset.id);
      else if (e.target.classList.contains("delete")) this.removeUser(e.target.dataset.id);
    });
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
    this.querySelector("#userId").disabled = true;
    this.querySelector("#userName").value = user.name;
    this.querySelector("#userRole").value = user.role;
    this.querySelector("#userPassword").value = "";
    this.querySelector("#confirmPassword").value = "";
    this.querySelector("#cancelEdit").classList.remove("hidden");
  }

  cancelEdit() {
    this.editedId = null;
    this.querySelector("#userId").value = "";
    this.querySelector("#userId").disabled = false;
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
