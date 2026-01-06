



let totalTime = 0;



let currentLapTime = 0;



let lapRecords = [];







let rafId = null;



let lastStartTime = null;







const startBtn = document.getElementById("startBtn");



const lapBtn = document.getElementById("lapBtn");



const stopBtn = document.getElementById("stopBtn");



const resetBtn = document.getElementById("resetBtn");



const csvBtn = document.getElementById("csvBtn");



const helpBtn = document.getElementById("helpBtn");



const helpModal = document.getElementById("helpModal");



const helpCloseBtn = document.getElementById("helpCloseBtn");



const helpBackdrop = document.getElementById("helpBackdrop");

let hapticsEnabled = false;

document.addEventListener("pointerdown", () => {
    hapticsEnabled = true;
}, { once: true });







function haptic(durationMs = 15) {
    if (!hapticsEnabled) return;
    if (typeof navigator === "undefined") return;
    if (navigator.userActivation && !navigator.userActivation.isActive) return;
    if (typeof navigator.vibrate === "function") {
        navigator.vibrate(durationMs);
    }
}



function openHelpModal() {

    if (!helpModal) return;

    helpModal.classList.add("is-open");

    helpModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

}



function closeHelpModal() {

    if (!helpModal) return;

    helpModal.classList.remove("is-open");

    helpModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

}



startBtn.addEventListener("pointerdown", () => haptic());



lapBtn.addEventListener("pointerdown", () => haptic());



stopBtn.addEventListener("pointerdown", () => haptic());



resetBtn.addEventListener("pointerdown", () => haptic());



csvBtn.addEventListener("pointerdown", () => haptic());



helpBtn.addEventListener("pointerdown", () => haptic());







startBtn.addEventListener("click", start);



lapBtn.addEventListener("click", lap);



stopBtn.addEventListener("click", stop);



resetBtn.addEventListener("click", reset);



csvBtn.addEventListener("click", exportCSV);



helpBtn.addEventListener("click", openHelpModal);



helpCloseBtn.addEventListener("click", closeHelpModal);



helpBackdrop.addEventListener("click", closeHelpModal);



document.addEventListener("keydown", (event) => {



    if (event.key === "Escape") closeHelpModal();



});







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

function formatLapTimeSeconds(milliseconds) {
    const seconds = (milliseconds / 1000).toFixed(2);
    return `${seconds}s`;
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







    lapRecords.push({ lapMs: lapTime, totalMs: totalTime });



    displayLaps();







    currentLapTime = 0;



    lastStartTime = now;



    updateTime(now);



}



    



function displayLaps() {
    const laps = document.getElementById("laps");
    const rows = [];
    for (let i = lapRecords.length - 1; i >= 0; i--) {
        rows.push(
            `<div class="lap-row"><span class="lap-index">LAP ${i + 1}</span>`
            + `<span class="lap-time">${formatLapTimeSeconds(lapRecords[i].lapMs)}</span>`
            + `<span class="lap-total">TOTAL ${formatLapTimeSeconds(lapRecords[i].totalMs)}</span></div>`
        );
    }
    laps.innerHTML = rows.join("");
    laps.scrollTop = 0;
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



    lapRecords = [];



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
    const rows = lapRecords.map((record, index) => [index + 1, formatLapTimeSeconds(record.lapMs), formatLapTimeSeconds(record.totalMs)]);
    const csvContent = "data:text/csv;charset=utf-8," + "Lap,LapTime,TotalTime\r\n" + rows.map(e => e.join(",")).join("\r\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lap_times.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}






