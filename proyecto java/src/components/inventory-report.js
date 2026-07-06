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
    const template = document.querySelector("#inventory-report-template");
    const clone = template.content.cloneNode(true);
    this.innerHTML = "";
    this.appendChild(clone);

    const searchInput = this.querySelector("#searchInventory");
    searchInput.value = this.filter;
    searchInput.addEventListener("input", (event) => {
      this.filter = event.target.value;
      this.updateTable(products);
    });

    this.updateTable(products);
  }

  updateTable(products) {
    const filtered = products.filter((product) => {
      const search = this.filter.toLowerCase();
      return (
        !search ||
        product.code.toLowerCase().includes(search) ||
        product.name.toLowerCase().includes(search) ||
        product.provider.toLowerCase().includes(search)
      );
    });

    const tbody = this.querySelector("#reportTableBody");
    tbody.innerHTML = filtered.map((product) => {
      const recetaStr = product.type === "finished" && product.receta
        ? Object.entries(product.receta).map(([code, qty]) => `${qty}×${code}`).join(", ")
        : "-";
      
      return `
        <tr>
          <td>${product.code}</td>
          <td>${product.name}</td>
          <td>${product.provider}</td>
          <td>${product.type === "raw" ? "Materia prima" : "Terminado"}</td>
          <td>${product.stock}</td>
          <td>${recetaStr}</td>
        </tr>
      `;
    }).join("");
  }
}

customElements.define("inventory-report", InventoryReport);
