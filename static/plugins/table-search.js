function filterTable() {
    const input = document.getElementById("tableSearch");
    const filter = input.value.toLowerCase();

    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
        let text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}
