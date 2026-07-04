import { ProductService, ProductionService } from "../services/app-store.js";
import { getNextProcessCode } from "../utils/production-utils.js";

export class ProductionModule extends HTMLElement {
  constructor() {
    super();
    this.message = "";
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const products = await ProductService.list();
    const finished = products.filter((product) => product.type === "finished");
    const processes = (await ProductionService.list()).sort((a, b) => Number(b.code || 0) - Number(a.code || 0));

    this.innerHTML = `
      <h2>Módulo de producción</h2>
      <div class="form-grid">
        <div class="input-group">
          <label for="productToMake">Producto a fabricar</label>
          <select id="productToMake">
            <option value="">Seleccione</option>
            ${finished.map((product) => `<option value="${product.code}">${product.name} (${product.code})</option>`).join("")}
          </select>
        </div>
        <div class="input-group">
          <label for="produceQuantity">Cantidad a fabricar</label>
          <input id="produceQuantity" type="number" min="1" placeholder="10" />
        </div>
        <button class="primary" id="produceButton">Generar producción</button>
      </div>
      ${this.message ? `<div class="alert" style="margin-top:16px;">${this.message}</div>` : ""}
      <div class="panel" style="margin-top:24px;">
        <h3>Resumen de producción</h3>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Código</th><th>Producto</th><th>Cantidad</th><th>Materia prima usada</th></tr></thead>
            <tbody>
              ${processes.map((process) => `
                <tr>
                  <td>${process.code}</td>
                  <td>${process.productName}</td>
                  <td>${process.quantity}</td>
                  <td>${process.ingredients.map((ingredient) => `${ingredient.code}: ${ingredient.used}`).join("; ")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
    this.bindEvents();
  }

  bindEvents() {
    this.querySelector("#produceButton").addEventListener("click", () => this.runProduction());
  }

  async runProduction() {
    const code = this.querySelector("#productToMake").value;
    const quantity = Number(this.querySelector("#produceQuantity").value);

    if (!code || quantity <= 0) {
      this.message = "Seleccione un producto terminado e ingrese una cantidad válida.";
      this.render();
      return;
    }

    const product = await ProductService.find(code);
    if (!product || product.type !== "finished") {
      this.message = "El producto seleccionado no es un producto terminado.";
      this.render();
      return;
    }

    const requirements = product.formula.map((ingredient) => ({ ...ingredient, required: ingredient.quantity * quantity }));
    const products = await ProductService.list();
    const notEnough = requirements.filter((item) => {
      const source = products.find((entry) => entry.code === item.code);
      return !source || Number(source.stock || 0) < Number(item.required);
    });

    if (notEnough.length) {
      this.message = `Stock insuficiente: ${notEnough.map((item) => item.code).join(", ")}`;
      this.render();
      return;
    }
    for (const item of requirements) {
      await ProductService.adjustStock(item.code, -item.required);
    }
    await ProductService.adjustStock(product.code, quantity);

    await ProductionService.add({
      code: getNextProcessCode(await ProductionService.list()),
      productCode: product.code,
      productName: product.name,
      quantity,
      ingredients: requirements.map((item) => ({ code: item.code, used: item.required })),
      timestamp: new Date().toISOString(),
    });

    this.message = `Producción generada: ${quantity} ${product.name}. Inventario actualizado.`;
    this.render();
  }
}

customElements.define("production-module", ProductionModule);
