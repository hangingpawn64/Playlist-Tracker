function getPlaylistId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("list");
}

function addCheckboxes() {
    const playlistId = getPlaylistId();
    if (!playlistId) return;

    createProgressCircle(); // 👈 ADD THIS

    const videos = document.querySelectorAll("ytd-playlist-video-renderer");

    videos.forEach(video => {
        if (video.querySelector(".yt-checkbox")) return;

        const link = video.querySelector("a#video-title");
        if (!link) return;

        const videoId = new URL(link.href).searchParams.get("v");
        if (!videoId) return;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "yt-checkbox";

        const key = `${playlistId}_${videoId}`;

        chrome.storage.local.get([key], (result) => {
            checkbox.checked = result[key] || false;
            updateProgress(); // 👈 update after load
        });

        checkbox.addEventListener("change", () => {
            chrome.storage.local.set({ [key]: checkbox.checked });
            updateProgress(); // 👈 update on change
        });

        video.style.display = "flex";
        video.style.alignItems = "center";
        video.prepend(checkbox);
    });

    updateProgress(); // 👈 safety call

    function createProgressCircle() {
    if (document.querySelector("#yt-progress-circle")) return;

    const container = document.createElement("div");
    container.id = "yt-progress-circle";

    container.innerHTML = `
        <div class="progress-ring">
            <span id="progress-text">0%</span>
        </div>
    `;

    document.body.appendChild(container);
}
}
function updateProgress() {
    const checkboxes = document.querySelectorAll(".yt-checkbox");

    let total = checkboxes.length;
    let checked = 0;

    checkboxes.forEach(cb => {
        if (cb.checked) checked++;
    });

    const percent = total === 0 ? 0 : Math.round((checked / total) * 100);

    const ring = document.querySelector(".progress-ring");
    const text = document.getElementById("progress-text");

    if (ring) {
        ring.style.background = `conic-gradient(
            #00c853 ${percent * 3.6}deg,
            #ddd ${percent * 3.6}deg
        )`;
    }

    if (text) {
        text.innerText = `${percent}%`;
    }
}

// Handle dynamic loading (YouTube is SPA)
setInterval(addCheckboxes, 1500);