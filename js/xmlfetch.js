function defaultXML_edit() {
  const xmlFilePath = "./xml/reflect-e_0.1.7_default.xml";

  fetch(xmlFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      const parametersList = xmlDoc.getElementsByTagName("Parameters");

      // Update existing parameters with values from dataView
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

      alert("Downloading!");

      // Download the updated XML file
      downloadFile(updatedXmlText, "updated_xml.xml", "text/xml");
    })
    .catch((error) => {
      console.error(`There was a problem with the fetch operation:`, error);
    });
}

// Function to download file
function downloadFile(data, filename, type) {
  const blob = new Blob([data], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
