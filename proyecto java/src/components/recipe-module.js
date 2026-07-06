import { ProductService } from "../services/app-store.js";

export class RecipeModule extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const products = await ProductService.list();
    const finished = products.filter((product) => product.type === "finished");
    const template = document.querySelector("#recipe-module-template");
    const clone = template.content.cloneNode(true);
    this.innerHTML = "";
    this.appendChild(clone);

    const tbody = this.querySelector("#recipeTableBody");
    tbody.innerHTML = finished.map((product) => {
      const recetaStr = product.receta
        ? Object.entries(product.receta).map(([code, qty]) => `${qty}×${code}`).join(", ")
        : "-";

      return `
        <tr>
          <td>${product.code}</td>
          <td>${product.name}</td>
          <td>${recetaStr}</td>
        </tr>
      `;
    }).join("");
  }
}

customElements.define("recipe-module", RecipeModule);
