let debounceTimer;

function filterTable() {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        const filter = document.getElementById("tableSearch").value.toLowerCase();

        rows.forEach((row, i) => {
            row.style.display = rowTexts[i].includes(filter) ? "" : "none";
        });
    }, 300); // 等待 300ms 后再触发过滤
}
