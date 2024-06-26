1) Right now, this is saving the live parameter XML file by fetching and then editing it. The XML file is cached by the service worker and as such will allow to save files even when internet is not connected.
2) The SW needs to include the references to the HTTP fonts that are dynamically loaded during intial load.
3) This will not work on Bluefy as of yet since Bluefy is not supporting blob url references or reading the data as the URL.
