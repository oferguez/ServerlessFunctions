console.log('main.js is loaded');

async function getTimeFromServer() {
    try {
        const response = await fetch('/.netlify/functions/getTime');
        const data = await response.json();
        const r = data.time.toString();
        console.log('serverless proxy invoked', r);
        return r;
    } catch (error) {
        console.error('Error fetching time:', error);
        return "Error";
    }
}
document.addEventListener('DOMContentLoaded', async function() {
    const dateElement = document.getElementById('show-date');
    dateElement.textContent = await getTimeFromServer();
});

setInterval(async () => {
    const timeElement = document.getElementById('show-date');
    timeElement.textContent = await getTimeFromServer();  // ✅ Use await
}, 1000);