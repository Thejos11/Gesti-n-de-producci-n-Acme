const DATABASE_URL = "https://stock-flow-99bba-default-rtdb.firebaseio.com";

async function requestJson(path, options = {}) {
  const response = await fetch(`${DATABASE_URL}/${path}.json`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Firebase request failed with status ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

async function readCollection(path) {
  const data = await requestJson(path);
  if (!data) {
    return [];
  }

  return Object.entries(data).map(([id, value]) => ({ id, ...(value || {}) }));
}

async function writeCollection(path, items, keySelector = (item) => item.id ?? item.code ?? String(Date.now())) {
  const payload = Object.fromEntries(
    items.map((item) => {
      const key = String(keySelector(item));
      return [key, { ...item, id: key }];
    }),
  );

  await requestJson(path, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export class HashService {
  static async sha256(message) {
    const data = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
}

export class UserService {
  static async list() {
    return readCollection("users");
  }

  static async findById(id) {
    const users = await UserService.list();
    return users.find((user) => user.id === id);
  }

  static async authenticate(id, password) {
    const user = await UserService.findById(id);
    if (!user) {
      return null;
    }

    const passwordHash = await HashService.sha256(password);
    return user.passwordHash === passwordHash ? user : null;
  }

  static async add(user) {
    const users = await UserService.list();
    await writeCollection("users", [...users, user], (item) => item.id);
  }

  static async update(id, nextUser) {
    const users = await UserService.list();
    const updated = users.map((user) => (user.id === id ? { ...nextUser, id } : user));
    await writeCollection("users", updated, (item) => item.id);
  }

  static async remove(id) {
    const users = await UserService.list();
    const filtered = users.filter((user) => user.id !== id);
    await writeCollection("users", filtered, (item) => item.id);
  }
}

export class ProductService {
  static async list() {
    return readCollection("products");
  }

  static async find(code) {
    const products = await ProductService.list();
    return products.find((product) => product.code === code);
  }

  static async add(product) {
    const products = await ProductService.list();
    await writeCollection("products", [...products, product], (item) => item.code);
  }

  static async update(code, nextProduct) {
    const products = await ProductService.list();
    const updated = products.map((item) => (item.code === code ? nextProduct : item));
    await writeCollection("products", updated, (item) => item.code);
  }

  static async adjustStock(code, amount) {
    const products = await ProductService.list();
    const updated = products.map((product) => {
      if (product.code === code) {
        return { ...product, stock: Math.max(0, Number(product.stock || 0) + Number(amount)) };
      }
      return product;
    });
    await writeCollection("products", updated, (item) => item.code);
  }
}

export class ProductionService {
  static async list() {
    return readCollection("processes");
  }

  static async add(process) {
    const processes = await ProductionService.list();
    await writeCollection("processes", [...processes, process], (item) => item.code);
  }

  static async nextCode() {
    const processes = await ProductionService.list();
    const codes = processes.map((process) => Number(process.code || 0));
    const maxCode = codes.length ? Math.max(...codes) : 0;
    return maxCode + 1;
  }
}

export class SessionService {
  static current() {
    return JSON.parse(localStorage.getItem("acme_session") || "null");
  }

  static set(user) {
    localStorage.setItem("acme_session", JSON.stringify(user));
  }

  static clear() {
    localStorage.removeItem("acme_session");
  }
}
