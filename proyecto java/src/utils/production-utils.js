export function getNextProcessCode(processes = []) {
  const codes = processes.map((process) => Number(process.code || 0));
  const maxCode = codes.length ? Math.max(...codes) : 0;
  return maxCode + 1;
}
