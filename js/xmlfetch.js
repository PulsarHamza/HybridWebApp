fetch("xml/reflect-e_0.1.7_default.xml")
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
    const parsedData = [];
    const indexSet = new Set();

    for (let i = 0; i < parametersList.length; i++) {
      const parameters = parametersList[i];
      const index = parameters.getElementsByTagName("Index")[0].textContent;
      if (indexSet.has(index)) {
        continue; // Skip if index already exists
      }
      const parameter = parameters.getElementsByTagName("Parameter")[0].textContent;
      const value = parameters.getElementsByTagName("Value")[0].textContent;
      indexSet.add(index); // Add index to set to track uniqueness
      parsedData.push({ index, parameter, value }); // Store parsed data
    }
    alert("Successful"); // Output the parsed data
  })
  .catch((error) => {
    console.error(`There was a problem with the fetch operation:`, error);
  });
