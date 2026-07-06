import { ProductService } from "../services/app-store.js";

export class InventoryReport extends HTMLElement {
  constructor() {
    super();
    this.filter = "";
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const products = await ProductService.list();
    const filtered = products.filter((product) => {
      const search = this.filter.toLowerCase();
      return (
        !search ||
        product.code.toLowerCase().includes(search) ||
        product.name.toLowerCase().includes(search) ||
        product.provider.toLowerCase().includes(search)
      );
    });

    this.innerHTML = `
      <h2>Módulo de inventarios</h2>
      <div class="input-group">
        <label for="searchInventory">Buscar producto</label>
        <input id="searchInventory" type="search" placeholder="Filtrar por nombre, código o proveedor" value="${this.filter}" />
      </div>
      <div class="table-wrapper" style="margin-top:16px;">
        <table>
          <thead><tr><th>Código</th><th>Nombre</th><th>Proveedor</th><th>Tipo</th><th>Stock</th><th>Fórmula</th></tr></thead>
          <tbody>
            ${filtered.map((product) => `
              <tr>
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${product.provider}</td>
                <td>${product.type === "raw" ? "Materia prima" : "Terminado"}</td>
                <td>${product.stock}</td>
                <td>${product.type === "finished" ? product.formula.map((item) => `${item.quantity}×${item.code}`).join(", ") : "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    this.bindEvents();
  }

  bindEvents() {
    this.querySelector("#searchInventory").addEventListener("input", (event) => {
      this.filter = event.target.value;
      this.render();
    });
  }
}

customElements.define("inventory-report", InventoryReport);
