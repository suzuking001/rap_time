
let totalTime = 0;
let currentLapTime = 0;
let lapTimes = [];

let rafId = null;
let lastStartTime = null;

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const csvBtn = document.getElementById("csvBtn");

startBtn.addEventListener("click", start);
lapBtn.addEventListener("click", lap);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);
csvBtn.addEventListener("click", exportCSV);

function updateTime(now = performance.now()) {
    const runningDelta = lastStartTime == null ? 0 : now - lastStartTime;
    document.getElementById("totalTime").innerHTML = formatTime(totalTime + runningDelta);
    document.getElementById("currentLap").innerHTML = formatTime(currentLapTime + runningDelta);
}

function tick() {
    updateTime();
    if (rafId != null) rafId = requestAnimationFrame(tick);
}

function formatTime(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    let millisecondsDisplay = Math.floor((milliseconds % 1000) / 10);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(millisecondsDisplay)}`;
}
    
function pad(number) {
    return number.toString().padStart(2, "0");
}
    
function start() {
    if (rafId != null) return;

    lastStartTime = performance.now();
    rafId = requestAnimationFrame(tick);

    startBtn.disabled = true;
    lapBtn.disabled = false;
    stopBtn.disabled = false;
    resetBtn.disabled = true;
    csvBtn.disabled = true;
}
    
function lap() {
    const now = performance.now();
    const runningDelta = lastStartTime == null ? 0 : now - lastStartTime;

    totalTime += runningDelta;
    const lapTime = currentLapTime + runningDelta;

    lapTimes.push(lapTime);
    displayLaps();

    currentLapTime = 0;
    lastStartTime = now;
    updateTime(now);
}
    
function displayLaps() {
    const laps = document.getElementById("laps");
    laps.innerHTML = "";
    let counter = 1;
    for (const time of lapTimes) {
        laps.innerHTML += `<div>${counter}: ${formatTime(time)}</div>`;
        counter++;
    }
}
    
function stop() {
    if (rafId == null) return;

    cancelAnimationFrame(rafId);
    rafId = null;

    const now = performance.now();
    const runningDelta = lastStartTime == null ? 0 : now - lastStartTime;
    totalTime += runningDelta;
    currentLapTime += runningDelta;
    lastStartTime = null;

    updateTime(now);

    startBtn.disabled = false;
    lapBtn.disabled = true;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
    csvBtn.disabled = false;
}
    
function reset() {
    if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
        lastStartTime = null;
    }

    totalTime = 0;
    currentLapTime = 0;
    lapTimes = [];
    document.getElementById("totalTime").innerHTML = formatTime(totalTime);
    document.getElementById("currentLap").innerHTML = formatTime(currentLapTime);
    document.getElementById("laps").innerHTML = "";
    startBtn.disabled = false;
    lapBtn.disabled = true;
    stopBtn.disabled = true;
    resetBtn.disabled = true;
    csvBtn.disabled = true;
}
    
function exportCSV() {
    const rows = lapTimes.map((time, index) => [index + 1, formatTime(time)]);
    const csvContent = "data:text/csv;charset=utf-8,"
    + "Lap,Time\r\n"
    + rows.map(e => e.join(",")).join("\r\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lap_times.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
