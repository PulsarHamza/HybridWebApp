let currentIndex = 0;
const totalTabs = 4; // Total number of tabs
function slideTabs(direction) {
  currentIndex += direction;
  if (currentIndex < 0) {
    currentIndex = 0;
  } else if (currentIndex > totalTabs - 3) {
    currentIndex = totalTabs - 3;
  }
  updateVisibility();
}

function updateVisibility() {
  const tabs = document.querySelectorAll(".accordion-tab");
  tabs.forEach((tab, index) => {
    tab.style.display = "none";
    if (index >= currentIndex && index < currentIndex + 3) {
      tab.style.display = "block";
    }
  });

  // Hide/show arrows based on currentIndex
  if (currentIndex === 0) {
    document.getElementById("prev-arrow").style.display = "none";
  } else {
    document.getElementById("prev-arrow").style.display = "flex";
  }

  if (currentIndex >= totalTabs - 3) {
    document.getElementById("next-arrow").style.display = "none";
  } else {
    document.getElementById("next-arrow").style.display = "flex";
  }
}
