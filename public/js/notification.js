// public/js/notification.js

// Reusable function to display toast notifications in the browser UI
function showNotification(message, type = 'success') {
    // Check if a notification container already exists, otherwise create one
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    
    const bgColor = type === 'success' ? '#00D632' : '#ff4d4d';
    toast.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: Arial, sans-serif;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}