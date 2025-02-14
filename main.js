console.log('Hello, world!');

function getTime() {
    const now = new Date();
    return now.toLocaleTimeString();
}

document.addEventListener('DOMContentLoaded', function() {
    const dateElement = document.getElementById('show-date');
    dateElement.textContent = getTime();
});

setInterval(() => {
    const timeElement = document.getElementById('show-date');
    timeElement.textContent = getTime();
}, 1000);