function showToast(message, type = "info", duration = 0) {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.classList.add("toast", `toast-${type}`);

    toast.innerHTML = `
        <div class="toast-icon">${getIcon(type)}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add("toast-show"), 10);

    toast.querySelector(".toast-close").onclick = () => hideToast(toast);

    if (duration && duration > 0) {
        setTimeout(() => hideToast(toast), duration);
    }
}

function hideToast(toast) {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");

    setTimeout(() => toast.remove(), 300);
}

const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
};

function getIcon(type) {
    return icons[type] || icons.info;
}
