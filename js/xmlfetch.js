function fetchedit_defaultXML() {
  fetch("./xml/reflect-e_0.1.7_default.xml")
    .then((response) => response.text())
    .then((xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      const parametersList = xmlDoc.getElementsByTagName("Parameters");

      // Update existing parameters with values from liveParamDataView
      for (let i = 0; i < liveParamDataView.length; i++) {
        const { index, value } = liveParamDataView[i];
        const parameterNode = Array.from(parametersList).find(
          (node) => node.getElementsByTagName("Index")[0].textContent === index.toString()
        );

        if (parameterNode) {
          parameterNode.getElementsByTagName("Value")[0].textContent = Number(value).toFixed(3).toString();
        } else {
          console.warn(`Index ${index} not found in XML.`);
        }
      }
      // Convert XML back to text
      const serializer = new XMLSerializer();
      const updatedXmlText = serializer.serializeToString(xmlDoc);

      // Display updated XML content in textarea
      document.getElementById("xmlContent").value = updatedXmlText;

      // Copy the updated XML content to clipboard
      copyToClipboard();
      //} else {
      downloadFile(updatedXmlText, "reflect-e_0.1.7_live.xml", "text/xml");
      //}
    })
    .catch((error) => {
      console.error("Error fetching XML:", error);
      alert("Error fetching XML");
    });
}

function downloadFile(data, filename, type) {
  const blob = new Blob([data], { type: type });

  // Check if the browser supports the 'download' attribute
  if ("download" in document.createElement("a")) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
// Function to copy text to clipboard
function copyToClipboard() {
  const xmlContent = document.getElementById("xmlContent").value;
  navigator.clipboard
    .writeText(xmlContent)
    .then(() => {
      alert("XML content copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy XML content");
    });
}
