function defaultXML_edit() {
  const xmlFilePath = "./xml/reflect-e_0.1.7_default.xml";

  fetch(xmlFilePath)
    .then((response) => {
      if (!response.ok) {
        alert("Error fetching XML file.");
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
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

      // Download the updated XML file
      downloadFile(updatedXmlText, "reflect-e_0.1.7_live.xml", "text/xml");
    })
    .catch((error) => {
      alert(`There was a problem with the fetch operation: ${error.message}`);
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
  } else {
    // Fallback for browsers that do not support 'download' attribute
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const link = document.createElement("a");
      link.href = event.target.result;
      link.target = "_blank";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    fileReader.readAsDataURL(blob);
  }
}
