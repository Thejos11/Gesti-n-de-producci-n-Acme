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
    }

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
