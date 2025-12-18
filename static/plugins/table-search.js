let debounceTimer;

// 1. 在页面加载时一次性缓存行的文本内容
const rows = Array.from(document.querySelectorAll("table tbody tr"));
const rowTexts = rows.map(row => row.textContent.toLowerCase());

// 2. 执行过滤操作
function filterTable() {
    clearTimeout(debounceTimer);

    // 设置 debounce，避免每次按键都触发过滤
    debounceTimer = setTimeout(() => {
        const filter = document.getElementById("tableSearch").value.toLowerCase();

        rows.forEach((row, i) => {
            // 根据缓存的 rowTexts 来过滤显示
            row.style.display = rowTexts[i].includes(filter) ? "" : "none";
        });
    }, 300);  // 300ms 延迟执行过滤
}
