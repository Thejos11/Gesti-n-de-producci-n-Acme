import { ProductService } from "../services/app-store.js";

export class InventoryModule extends HTMLElement {
  constructor() {
    super();
    this.formula = [];
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const products = await ProductService.list();
    const rawMaterials = products.filter((product) => product.type === "raw");

    this.innerHTML = `
      <h2>Inventario y productos</h2>
      <div class="form-grid">
        <div class="input-group">
          <label for="productCode">Código</label>
          <input id="productCode" type="text" placeholder="PR-001" />
        </div>
        <div class="input-group">
          <label for="productName">Nombre del producto</label>
          <input id="productName" type="text" placeholder="Harina" />
        </div>
        <div class="input-group">
          <label for="productProvider">Proveedor</label>
          <input id="productProvider" type="text" placeholder="Molinos Macondo" />
        </div>
        <div class="input-group">
          <label for="productType">Tipo</label>
          <select id="productType">
            <option value="raw">Materia prima</option>
            <option value="finished">Producto terminado</option>
          </select>
        </div>
      </div>
      <div class="panel" id="formulaPanel">
        <h3>Fórmula de producción</h3>
        <p class="small">Agregue las materias primas necesarias para fabricar este producto terminado.</p>
        <div class="flex" style="align-items:flex-end; gap:12px; flex-wrap:wrap;">
          <div class="input-group" style="flex:1; min-width:140px;">
            <label for="formulaCode">Materia prima</label>
            <select id="formulaCode">
              <option value="">Seleccione</option>
              ${rawMaterials.map((product) => `<option value="${product.code}">${product.name} (${product.code})</option>`).join("")}
            </select>
          </div>
          <div class="input-group" style="width:140px;">
            <label for="formulaQty">Cantidad</label>
            <input id="formulaQty" type="number" min="1" placeholder="100" />
          </div>
          <button class="secondary" id="addIngredient">Agregar ingrediente</button>
        </div>
        <div id="formulaList" style="margin-top:14px;">
          ${this.formula.length === 0 ? `<p class="small">No hay ingredientes agregados.</p>` : ""}
          <ul>
            ${this.formula.map((item, index) => `<li>${item.code}: ${item.quantity} unidad(es) <button class="secondary remove-ingredient" data-index="${index}">Quitar</button></li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="flex" style="margin-top: 14px; gap: 12px; flex-wrap:wrap;">
        <button class="primary" id="saveProduct">Guardar producto</button>
      </div>
      <hr />
      <h3>Ingreso al inventario</h3>
      <div class="flex">
        <div class="input-group" style="flex:1; min-width:180px;">
          <label for="stockProductCode">Código del producto</label>
          <input id="stockProductCode" type="text" placeholder="PR-001" />
        </div>
        <div class="input-group" style="width:180px;">
          <label for="stockQuantity">Cantidad a ingresar</label>
          <input id="stockQuantity" type="number" min="1" placeholder="50" />
        </div>
        <button class="primary" id="addStock">Agregar stock</button>
      </div>
      <div class="table-wrapper" style="margin-top:24px;">
        <table>
          <thead><tr><th>Código</th><th>Nombre</th><th>Proveedor</th><th>Tipo</th><th>Stock</th></tr></thead>
          <tbody>
            ${products.map((product) => `
              <tr>
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${product.provider}</td>
                <td>${product.type === "raw" ? "Materia prima" : "Terminado"}</td>
                <td>${product.stock}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    this.bindEvents();
    this.updateFormulaVisibility();
  }

  bindEvents() {
    this.querySelector("#productType").addEventListener("change", () => this.updateFormulaVisibility());
    this.querySelector("#addIngredient").addEventListener("click", () => this.addIngredient());
    this.querySelector("#saveProduct").addEventListener("click", () => this.saveProduct());
    this.querySelector("#addStock").addEventListener("click", () => this.addStock());
    this.querySelectorAll("button.remove-ingredient").forEach((button) => button.addEventListener("click", () => this.removeIngredient(Number(button.dataset.index))));
  }

  updateFormulaVisibility() {
    const panel = this.querySelector("#formulaPanel");
    const type = this.querySelector("#productType").value;
    panel.style.display = type === "finished" ? "block" : "none";
  }

  addIngredient() {
    const code = this.querySelector("#formulaCode").value;
    const quantity = Number(this.querySelector("#formulaQty").value);
    if (!code || quantity <= 0) {
      alert("Seleccione materia prima y una cantidad válida.");
      return;
    }

    const existing = this.formula.find((item) => item.code === code);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.formula.push({ code, quantity });
    }

    this.render();
  }

  removeIngredient(index) {
    this.formula.splice(index, 1);
    this.render();
  }

  async saveProduct() {
    const code = this.querySelector("#productCode").value.trim();
    const name = this.querySelector("#productName").value.trim();
    const provider = this.querySelector("#productProvider").value.trim();
    const type = this.querySelector("#productType").value;

    if (!code || !name || !provider) {
      alert("Complete los datos del producto.");
      return;
    }

    if (await ProductService.find(code)) {
      alert("Ya existe un producto con ese código.");
      return;
    }

    if (type === "finished" && this.formula.length === 0) {
      alert("Agregue al menos un ingrediente para la fórmula.");
      return;
    }

    await ProductService.add({
      code,
      name,
      provider,
      type,
      stock: 0,
      formula: type === "finished" ? this.formula : [],
    });

    this.formula = [];
    this.render();
    alert("Producto creado correctamente.");
  }

  async addStock() {
    const code = this.querySelector("#stockProductCode").value.trim();
    const quantity = Number(this.querySelector("#stockQuantity").value);

    if (!code || quantity <= 0) {
      alert("Ingrese un código y cantidad válida para ingresar stock.");
      return;
    }

    if (!await ProductService.find(code)) {
      alert("No se encontró un producto con ese código.");
      return;
    }

    await ProductService.adjustStock(code, quantity);
    this.render();
    alert("Stock actualizado satisfactoriamente.");
  }
}

customElements.define("inventory-module", InventoryModule);
