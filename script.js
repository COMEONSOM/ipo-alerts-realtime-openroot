// =====================================================
// 🚀 INDIAN IPO TRACKER — CLIENT-ONLY (NOV 2025)
// 💜 Built by Somu (and my Alia 😉)
// =====================================================

// 🔧 jsonbin.io credentials
const BIN_ID = "690439c5d0ea881f40c87979";
const API_KEY = "$2a$10$SKvkLG/Tgv4/Z6o0Kl3L4u0p4eqqBjnQOqEjFCirHWnRNqHnN323a";

// ✅ Fetch IPO data from JSONBin
async function fetchIPOData() {
  const url = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
  try {
    const response = await fetch(url, {
      headers: { "X-Master-Key": API_KEY },
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    console.log("📦 Fetched IPO Data from JSONBin:", data);

    const ipoArray = data.record?.ipoData || [];
    return Array.isArray(ipoArray) ? ipoArray : [];
  } catch (err) {
    console.error("❌ Error fetching data from JSONBin:", err);
    return [];
  }
}

// ✅ Render IPO cards
function renderIPOs(ipoList) {
  const container = document.getElementById("ipo-container");
  container.innerHTML = "";

  if (!ipoList.length) {
    container.innerHTML = "<p>No IPO data available currently.</p>";
    return;
  }

  ipoList.forEach((ipo) => {
    const card = document.createElement("div");
    card.className = "ipo-card";

    const {
      name = "Unnamed IPO",
      openDate = "TBA",
      closeDate = "TBA",
      listingDate = "TBA",
      price = "—",
      size = "—",
      status = "—",
      exchange = "—",
    } = ipo;

    card.innerHTML = `
      <h3>${name}</h3>
      <p><strong>Issue Period:</strong> ${openDate} – ${closeDate}</p>
      <p><strong>Listing Date:</strong> ${listingDate}</p>
      <p><strong>Price Band:</strong> ${price}</p>
      <p><strong>Issue Size:</strong> ${size}</p>
      <p><strong>Exchange:</strong> ${exchange}</p>
      <p><strong>Status:</strong> ${status}</p>
    `;
    container.appendChild(card);
  });
}

// ✅ JSONBin caching
async function checkCooldown() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": API_KEY },
    });

    if (!response.ok) throw new Error("Bin not found or invalid API key.");

    const bin = await response.json();
    const lastUpdated = new Date(bin.record?.lastUpdated || 0);
    const now = new Date();
    const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
    return { bin, hoursDiff: isNaN(hoursDiff) ? 2 : hoursDiff };
  } catch (err) {
    console.warn("⚠️ JSONBin empty or new, starting fresh.");
    return { bin: { record: { ipoData: [] } }, hoursDiff: 2 };
  }
}

// ✅ Update JSONBin with new data
async function updateBin(newData) {
  const body = {
    lastUpdated: new Date().toISOString(),
    ipoData: newData,
  };

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to update JSONBin:", text);
    } else {
      console.log("✅ JSONBin updated successfully.");
    }
  } catch (err) {
    console.error("Error updating JSONBin:", err);
  }
}

// ✅ Initialize app
async function init() {
  const refreshBtn = document.getElementById("refresh-btn");
  const statusText = document.getElementById("refresh-status");

  const { bin, hoursDiff } = await checkCooldown();
  const savedData = bin.record?.ipoData || [];

  renderIPOs(savedData);

  if (hoursDiff < 1) {
    refreshBtn.disabled = true;
    statusText.textContent = "Site data is already refreshed.";
  } else {
    refreshBtn.disabled = false;
    statusText.textContent = "You can refresh the IPO data now.";
  }

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    statusText.textContent = "Refreshing IPO data...";

    try {
      const newData = await fetchIPOData();
      await updateBin(newData);
      renderIPOs(newData);
      statusText.textContent = "✅ Data refreshed successfully!";
    } catch (err) {
      statusText.textContent = "❌ Error refreshing data.";
      console.error(err);
    } finally {
      refreshBtn.disabled = false;
    }
  });
}

init();
