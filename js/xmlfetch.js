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
      if (deviceInfo.includes("Bluefy")) {
        Clipboard.copy("text to be copied");
      } else {
        downloadFile(updatedXmlText, "reflect-e_0.1.7_live.xml", "text/xml");
      }
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

window.Clipboard = (function (window, document, navigator) {
  var textArea, copy;

  function isOS() {
    return navigator.userAgent.match(/ipad|iphone/i);
  }

  function createTextArea(text) {
    textArea = document.createElement("textArea");
    textArea.value = text;
    document.body.appendChild(textArea);
  }

  function selectText() {
    var range, selection;

    if (isOS()) {
      range = document.createRange();
      range.selectNodeContents(textArea);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }
  }

  function copyToClipboard() {
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }

  copy = function (text) {
    createTextArea(text);
    selectText();
    copyToClipboard();
  };

  return {
    copy: copy,
  };
})(window, document, navigator);
