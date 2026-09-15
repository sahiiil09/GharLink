const INTRO_KEY = "gharlink_intro_seen";

const getStartedBtn = document.getElementById("getStartedBtn");

function openGharLink() {
    localStorage.setItem(INTRO_KEY, "true");

    document.body.classList.add("is-exiting");

    setTimeout(() => {
        window.location.href = "../index.html";
    }, 320);
}

function checkIntroStatus() {
    const introSeen = localStorage.getItem(INTRO_KEY);

    if (introSeen === "true") {
        window.location.replace("../index.html");
        return;
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", openGharLink);
    }
}

checkIntroStatus();
