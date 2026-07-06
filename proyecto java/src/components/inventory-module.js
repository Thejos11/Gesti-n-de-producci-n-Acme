import { ProductService } from "../services/app-store.js";

export class InventoryModule extends HTMLElement {
  constructor() {
    super();
    this.formula = [];
    this.editingCode = null;
    this.editingProduct = null;
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const products = await ProductService.list();
    const template = document.querySelector("#inventory-module-template");
    const clone = template.content.cloneNode(true);
    this.innerHTML = "";
    this.appendChild(clone);


    const title = this.querySelector("#inventoryTitle");
    title.textContent = this.editingCode ? "Editar producto" : "Registrar producto";

    if (this.editingCode && this.editingProduct) {
      const product = this.editingProduct;
      this.querySelector("#productCode").value = product.code;
      this.querySelector("#productCode").disabled = true;
      this.querySelector("#productName").value = product.name;
      this.querySelector("#productProvider").value = product.provider;
      this.querySelector("#productType").value = product.type;
      this.querySelector("#productStock").value = product.stock;
      this.querySelector("#saveProduct").textContent = "Actualizar producto";
      this.querySelector("#cancelEdit").classList.remove("hidden");
    }


    const tbody = this.querySelector("#productTableBody");
    tbody.innerHTML = products.map((product) => `
      <tr>
        <td>${product.code}</td>
        <td>${product.name}</td>
        <td>${product.provider}</td>
        <td>${product.type === "raw" ? "Materia prima" : "Terminado"}</td>
        <td>${product.stock}</td>
        <td style="display: flex; gap: 8px;">
          <button class="edit-btn" data-code="${product.code}">Editar</button>
          <button class="delete-btn" data-code="${product.code}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    this.addEventListener("click", (e) => this.handleClick(e));
    this.addEventListener("change", (e) => this.handleChange(e));
  }

  handleChange(e) {
    if (e.target.id === "productType") {
    }
  }

  handleClick(e) {
    const target = e.target;

    if (target.id === "saveProduct") {
      this.saveProduct();
    } else if (target.id === "cancelEdit") {
      this.cancelEdit();
    } else if (target.classList.contains("edit-btn")) {
      const code = target.dataset.code;
      this.loadProductToEdit(code);
    } else if (target.classList.contains("delete-btn")) {
      const code = target.dataset.code;
      this.deleteProduct(code);
    }
  }

  async saveProduct() {
    const codeInput = this.querySelector("#productCode");
    const nameInput = this.querySelector("#productName");
    const providerInput = this.querySelector("#productProvider");
    const typeSelect = this.querySelector("#productType");
    const stockInput = this.querySelector("#productStock");

    const code = codeInput.value.trim();
    const name = nameInput.value.trim();
    const provider = providerInput.value.trim();
    const type = typeSelect.value;
    const stock = Number(stockInput.value);

    if (!code || !name || !provider || Number.isNaN(stock)) {
      alert("Complete los datos del producto y la cantidad de stock.");
      return;
    }

    if (!this.editingCode && await ProductService.find(code)) {
      alert("Ya existe un producto con ese código.");
      return;
    }

    const productData = {
      code,
      name,
      provider,
      type,
      stock: Math.max(0, stock),
      formula: this.formula,
    };

    if (this.editingCode) {
      await ProductService.update(code, productData);
      alert("Producto actualizado correctamente.");
    } else {
      await ProductService.add(productData);
      alert("Producto creado correctamente.");
    }

    this.formula = [];
    this.editingCode = null;
    this.editingProduct = null;
    this.render();
  }

  async loadProductToEdit(code) {
    const product = await ProductService.find(code);
    if (!product) {
      alert("Producto no encontrado.");
      return;
    }

    this.editingCode = code;
    this.editingProduct = product;
    this.formula = product.formula || [];
    this.render();
  }

  cancelEdit() {
    this.editingCode = null;
    this.editingProduct = null;
    this.formula = [];
    this.render();
  }

  async deleteProduct(code) {
    if (!confirm(`¿Está seguro de que desea eliminar el producto ${code}?`)) {
      return;
    }

    await ProductService.remove(code);
    this.render();
    alert("Producto eliminado correctamente.");
  }
}

customElements.define("inventory-module", InventoryModule);
