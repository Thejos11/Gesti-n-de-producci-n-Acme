import { ProductService, ProductionService } from "../services/app-store.js";
import { getNextProcessCode } from "../utils/production-utils.js";

export class ProductionModule extends HTMLElement {
  constructor() {
    super();
    this.message = "";
    this.lastProduction = null;
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const products = await ProductService.list();
    const finished = products.filter((product) => product.type === "finished");
    const processes = (await ProductionService.list()).sort((a, b) => Number(b.code || 0) - Number(a.code || 0));

    const template = document.querySelector("#production-module-template");
    const clone = template.content.cloneNode(true);
    this.innerHTML = "";
    this.appendChild(clone);

    const select = this.querySelector("#productToMake");
    select.innerHTML = '<option value="">Seleccione</option>' + 
      finished.map((product) => `<option value="${product.code}">${product.name} (${product.code})</option>`).join("");

    const messageDiv = this.querySelector("#productionMessage");
    if (this.message) {
      messageDiv.innerHTML = `<div class="alert" style="margin-top:16px;">${this.message}</div>`;
    } else {
      messageDiv.innerHTML = "";
    }

    const recipeContainer = this.querySelector("#selectedRecipe");
    recipeContainer.innerHTML = "";

    const producedContainer = this.querySelector("#producedResult");
    producedContainer.innerHTML = this.lastProduction
      ? `<div style="margin-top:16px;">
          <h4>Producción creada</h4>
          <p>${this.lastProduction.quantity} ${this.lastProduction.productName} producidos.</p>
          <p>Materia prima utilizada:</p>
          <ul style="margin:8px 0 0 16px; padding:0; list-style:disc;">
            ${this.lastProduction.ingredients.map((ingredient) => `<li>${ingredient.used} × ${ingredient.code}</li>`).join("")}
          </ul>
        </div>`
      : "";

    const tbody = this.querySelector("#productionTableBody");
    tbody.innerHTML = processes.map((process) => `
      <tr>
        <td>${process.code}</td>
        <td>${process.productName}</td>
        <td>${process.quantity}</td>
        <td>${process.ingredients.map((ingredient) => `${ingredient.code}: ${ingredient.used}`).join("; ")}</td>
      </tr>
    `).join("");

    this.querySelector("#produceButton").addEventListener("click", () => this.runProduction());
    select.addEventListener("change", () => this.renderSelectedRecipe());
  }

  async renderSelectedRecipe() {
    const code = this.querySelector("#productToMake").value;
    const recipeContainer = this.querySelector("#selectedRecipe");
    recipeContainer.innerHTML = "";

    if (!code) {
      return;
    }

    const product = await ProductService.find(code);
    if (!product || !product.receta || Object.keys(product.receta).length === 0) {
      recipeContainer.textContent = "Este producto no tiene receta definida.";
      return;
    }

    recipeContainer.innerHTML = `
      <div style="margin-top:16px;">
        <h4>Receta seleccionada</h4>
        <ul style="margin:8px 0 0 16px; padding:0; list-style:disc;">
          ${Object.entries(product.receta).map(([ingredient, qty]) => `<li>${qty} × ${ingredient}</li>`).join("")}
        </ul>
      </div>
    `;
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

  
    const receta = product.receta || {};
    const requirements = Object.entries(receta).map(([ingredientCode, ingredientQty]) => ({
      code: ingredientCode,
      quantity: ingredientQty,
      required: ingredientQty * quantity
    }));

    if (requirements.length === 0) {
      this.message = "Este producto no tiene receta definida.";
      this.render();
      return;
    }

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

    // Restar materias primas
    for (const item of requirements) {
      await ProductService.adjustStock(item.code, -item.required);
    }

    // Agregar cantidad del producto producido
    await ProductService.adjustStock(product.code, quantity);

    // Registrar el proceso de producción
    const process = {
      code: getNextProcessCode(await ProductionService.list()),
      productCode: product.code,
      productName: product.name,
      quantity,
      ingredients: requirements.map((item) => ({ code: item.code, used: item.required })),
      timestamp: new Date().toISOString(),
    };

    await ProductionService.add(process);

    this.lastProduction = process;
    this.message = `Producción generada: ${quantity} ${product.name}. Inventario actualizado.`;
    this.render();
  }
}

customElements.define("production-module", ProductionModule);
