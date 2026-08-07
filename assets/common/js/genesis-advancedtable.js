(() => {
  "use strict";

  const initialized = new WeakSet();

  const init = (root) => {
    if (initialized.has(root)) return;
    initialized.add(root);

    const body = root.querySelector("tbody");
    if (!body) return;

    const originalRows = [...body.rows];
    const search = root.querySelector("[data-table-search]");
    const pagination = root.querySelector("[data-table-pagination]");
    const total = root.querySelector("[data-table-total]");
    const perPage = Math.max(1, Number(root.dataset.perPage) || 10);
    let page = 1;
    let sortColumn = -1;
    let sortDirection = 1;

    const value = (row, column) => row.cells[column]?.textContent.trim() || "";
    const compare = (left, right) => {
      const leftValue = value(left, sortColumn);
      const rightValue = value(right, sortColumn);
      const leftNumber = Number(leftValue.replace(/[^0-9.-]/g, ""));
      const rightNumber = Number(rightValue.replace(/[^0-9.-]/g, ""));
      const numeric = leftValue !== "" && rightValue !== "" && Number.isFinite(leftNumber) && Number.isFinite(rightNumber);
      return (numeric ? leftNumber - rightNumber : leftValue.localeCompare(rightValue, undefined, { numeric: true })) * sortDirection;
    };

    const render = () => {
      const query = search?.value.trim().toLowerCase() || "";
      let rows = originalRows.filter((row) => !query || row.textContent.toLowerCase().includes(query));
      if (sortColumn >= 0) rows = [...rows].sort(compare);

      const pages = root.dataset.pagination === "enable" ? Math.max(1, Math.ceil(rows.length / perPage)) : 1;
      page = Math.min(page, pages);
      const visible = root.dataset.pagination === "enable" ? rows.slice((page - 1) * perPage, page * perPage) : rows;
      body.replaceChildren(...visible);

      if (total) total.textContent = `${rows.length} entr${rows.length === 1 ? "y" : "ies"}`;
      if (pagination) {
        pagination.replaceChildren(...Array.from({ length: pages }, (_, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = `btn btn-sm ${index + 1 === page ? "btn-primary" : "btn-outline-secondary"}`;
          button.textContent = String(index + 1);
          button.setAttribute("aria-label", `Page ${index + 1}`);
          button.addEventListener("click", () => { page = index + 1; render(); });
          return button;
        }));
      }
    };

    search?.addEventListener("input", () => { page = 1; render(); });
    if (root.dataset.sortable === "enable") {
      root.querySelectorAll("[data-sort-column]").forEach((button) => button.addEventListener("click", () => {
        const column = Number(button.dataset.sortColumn);
        sortDirection = sortColumn === column ? -sortDirection : 1;
        sortColumn = column;
        render();
      }));
    }
    render();
  };

  const scan = (scope = document) => (scope.matches?.("[data-advanced-table]") ? [scope] : scope.querySelectorAll?.("[data-advanced-table]") || []).forEach(init);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => scan(), { once: true }) : scan();
  new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node)))).observe(document.documentElement, { childList: true, subtree: true });
})();
