import "./src/components/app-root.js";

const mount = document.getElementById('app');
if (!mount.querySelector('app-root')) {
  const root = document.createElement('app-root');
  mount.appendChild(root);
}
