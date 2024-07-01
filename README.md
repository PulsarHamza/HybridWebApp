1) Right now, this is saving the live parameter XML file by fetching and then editing it. The XML file is cached by the service worker and as such will allow to save files even when internet is not connected.
2) The SW needs to include the references to the HTTP fonts that are dynamically loaded during intial load.
3) This will not work on Bluefy as of yet since Bluefy is not supporting blob url references or reading the data as the URL. For this, the copy method of the whole xml file is implemented.
There are a few bugs/things that need to be addressed:
* Changing tabs to advanced and then coming back to the trace and home tab starts querying the parameter set 1.
* Unite info needs to be added as a modem information div in the advanced settings tab.
* Query the sets after the generate XML is pressed, possibly will solve the first issue as well.
* Volume calculation on the advanced tab as well.
