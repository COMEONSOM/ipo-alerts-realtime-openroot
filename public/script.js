// =====================================================
// 🚀 INDIAN IPO TRACKER (ENHANCED VERSION — OCT 2025)
// =====================================================

// 🔧 Replace these with your jsonbin.io credentials
const BIN_ID = "690439c5d0ea881f40c87979";
const API_KEY = "$2a$10$SKvkLG/Tgv4/Z6o0Kl3L4u0p4eqqBjnQOqEjFCirHWnRNqHnN323a";

// ✅ Fetch IPO data directly from NSE (via backend proxy)
async function fetchIPOData() {
  const url = "/api/ipo";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    console.log("Fetched NSE Data:", data);

    // 🧠 NSE API sometimes wraps data inside data.latestIpoList
    const ipoArray = data.data?.latestIpoList || data.data || [];
    return Array.isArray(ipoArray) ? ipoArray : [];
  } catch (err) {
    console.error("❌ Error fetching data from proxy:", err);
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

  ipoList.forEach(ipo => {
    const card = document.createElement("div");
    card.className = "ipo-card";

    const {
      companyName = "Unnamed IPO",
      issueStartDate = "TBA",
      issueEndDate = "TBA",
      listingDate = "TBA",
      priceBand = "—",
      issueSize = "—",
      issueType = "—",
      listingStatus = "—"
    } = ipo;

    card.innerHTML = `
      <h3>${companyName}</h3>
      <p><strong>Issue Period:</strong> ${issueStartDate} – ${issueEndDate}</p>
      <p><strong>Listing Date:</strong> ${listingDate}</p>
      <p><strong>Price Band:</strong> ${priceBand}</p>
      <p><strong>Issue Size:</strong> ${issueSize}</p>
      <p><strong>Type:</strong> ${issueType}</p>
      <p><strong>Status:</strong> ${listingStatus}</p>
    `;
    container.appendChild(card);
  });
}

// ✅ Check refresh cooldown from JSONBin
async function checkCooldown() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": API_KEY }
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

// ✅ Update JSONBin with new data + timestamp
async function updateBin(newData) {
  const body = {
    lastUpdated: new Date().toISOString(),
    ipoData: newData
  };

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to update JSONBin:", text);
    }
  } catch (err) {
    console.error("Error updating JSONBin:", err);
  }
}

// ✅ Initialize the tracker
async function init() {
  const refreshBtn = document.getElementById("refresh-btn");
  const statusText = document.getElementById("refresh-status");

  const { bin, hoursDiff } = await checkCooldown();
  const savedData = bin.record?.ipoData || [];

  if (hoursDiff < 1) {
    refreshBtn.disabled = true;
    statusText.textContent = "Site data is already refreshed.";
    renderIPOs(savedData);
  } else {
    refreshBtn.disabled = false;
    statusText.textContent = "You can refresh the IPO data now.";
    renderIPOs(savedData);
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
