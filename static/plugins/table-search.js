const rows = Array.from(document.querySelectorAll("table tbody tr"));
const rowTexts = rows.map(row => row.textContent.toLowerCase());

function filterTable() {
    const filter = document.getElementById("tableSearch").value.toLowerCase();

    rows.forEach((row, i) => {
        row.style.display = rowTexts[i].includes(filter) ? "" : "none";
    });
}
