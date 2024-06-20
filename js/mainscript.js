if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("js/sw.js")
    .then(function (registration) {
      console.log("ServiceWorker registration successful with scope: ", registration.scope);
    })
    .catch(function (err) {
      //registration failed :(
      console.log("ServiceWorker registration failed: ", err);
    });
} else {
  console.log("No service-worker on this browser");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var sysState = 0; // 0- Trace on state,
var presysState = 0; // Previous state
var c_state = 0;
var inboundChar;
var outboundChar;
var device;
var isIgnore = 0;
var isIgnore_2 = 0;

// Define the CodeLess UUIDs
var CODELESS_SVC_UUID = "866d3b04-e674-40dc-9c05-b7f91bec6e83";
var INBOUND_CHAR_UUID = "914f8fb9-e8cd-411d-b7d1-14594de45425";
var OUTBOUND_CHAR_UUID = "3bb535aa-50b2-4fbe-aa09-6b06dc59a404";
var CNTRL_CHAR_UUID = "e2048b39-d4f9-4a45-9f25-1856c10d5639";

let options = {
  filters: [
    { name: "PULS" },
    { name: "PULS-BT" },
    { name: "CLv2" },
    { name: "ABCa" },
    { name: "ABC1" },
    { name: "PMBT" },
    { name: "ABC1" },
    { name: "PULSARBT" },
    { name: "PULSAR-BT" },
    { name: "CodeLess" },
    { name: "Example1" },
    { name: "Example2" },
    { name: "Example3" },
    { name: "Example4" },
    { name: "Example5" },
    { name: "Example6" },
    { name: "Example7" },
    { name: "Example8" },
    { name: "Example9" },
    { name: "CodeLess" },
    { services: [CODELESS_SVC_UUID] },
  ],
  optionalServices: [CODELESS_SVC_UUID],
};

// Global variables
var button_press = 0;
var isTraceOn = 0;
var level_var,
  distance_var,
  volume_var,
  compensated_var,
  compensated_var_m,
  mA_output_var,
  temperature_var,
  date_var,
  time_var,
  gate_start,
  gate_stop,
  echo_var,
  noise_var,
  status_var,
  near_blanking_var,
  far_blanking_var,
  empty_distance,
  mode_var,
  bit0,
  bit1,
  bit2,
  bit3,
  bit4,
  bit5,
  bit6,
  bit7;
var p104_units_val,
  p605_units_val,
  p104_units,
  p605_units,
  p104_rx_status,
  p605_rx_status,
  cmd_sent,
  param_init_query,
  power_init_query,
  p104_param_update,
  span_val;
var start_point, width_val;
let a = [];
var s, offset;
level_var = 0.0; //4.346;
distance_var = 0.0; //1.654;
volume_var = 0.0; //2.370;
compensated_var = 7.2;
compensated_var_m = 7.2;
mA_output_var = 0.0; //20.000;
temperature_var = 0.0; //20.000;
date_var = 190100.0;
time_var = 2210.0;
gate_start = 0; //202;
gate_stop = 0; //258;
echo_var = 0; //45;
noise_var = 0; //30;
status_var = 999;
near_blanking_var = 0.3;
far_blanking_var = 20.0; //6.0;
far_blanking_dist = 7.2;
empty_distance = 6.0;
mode_var = 6.0;
p104_units_val = 1;
p605_units_val = 3;
p104_units = "m";
p605_units = "m³";
p104_rx_status = 0;
p605_rx_status = 0;
cmd_sent = "";
param_init_query = 0;
power_init_query = 0;
p104_param_update = 0;
span_val = 5.7;

// set interval
var echo_tid;
var datem_tid;
//var p104_tid;
//var p605_tid;
var param_set1_tid;
var param_set2_tid;
var param_set3_tid;
var param_tid;
var param_query = 0;
var isDisconnecting = 0;
var isTerminated = 0;
var param_start_val = 0;

var login_stage = 0; // Login status

var currentlang = localStorage.getItem("lang_select_List");
var lang_map = lang_array.map((a) => a.English);
var param_num = param_info.map((a) => a.pnum);
var param_val = param_info.map((a) => a.pvalue);

//Test
let connectionType = "";
let receivedDataArray = [];
let receiveBufferHex = "";
let receiveBufferASCII = "";
let receiveTimeout;
let CommandSent = "";
let commandboxsend = false;
let param_update_flag = false;
let reader;
let combined_firstSet;
let combined_secondSet;
let combined_remainingSet;
let parsedData = [];
let xml_loaded = false;

// Resetting all the variables
function reset_params() {
  button_press = 0;
  isTraceOn = 0;
  level_var = 0.0;
  distance_var = 0.0;
  volume_var = 0.0;
  compensated_var = 7.2;
  compensated_var_m = 7.2;
  mA_output_var = 0.0;
  temperature_var = 0.0;
  date_var = 190100.0;
  time_var = 2210.0;
  gate_start = 0;
  gate_stop = 0;
  echo_var = 0;
  noise_var = 0;
  status_var = 999;
  near_blanking_var = 0.3;
  far_blanking_var = 20.0;
  far_blanking_dist = 7.2;
  empty_distance = 6.0;
  mode_var = 6.0;
  p104_units_val = 1;
  p605_units_val = 3;
  p104_units = "m";
  p605_units = "m³";
  p104_rx_status = 0;
  p605_rx_status = 0;
  cmd_sent = "";
  param_query = 0;
  isDisconnecting = 0;
  isTerminated = 0;
  param_start_val = 0;
  power_lvl = 0;
  new_power_lvl = 0;
  param_init_query = 0;
  power_init_query = 0;
  p104_param_update = 0;
  span_val = 5.7;
}

// Function to select the volume units to be displayed depending on p605 value
function p605_volume_units() {
  switch (p605_units_val) {
    default:
      p605_units = lang_map[126]; //"m³";
      break;
    case 0:
      p605_units = lang_map[127]; //"None";
      break;
    case 1:
      p605_units = lang_map[128]; //"Tons";
      break;
    case 2:
      p605_units = lang_map[129]; //"Tonnes";
      break;
    case 3:
      p605_units = lang_map[126]; //"m³";
      break;
    case 4:
      p605_units = lang_map[130]; //"Litres";
      break;
    case 5:
      p605_units = lang_map[131]; //"Imp Gal";
      break;
    case 6:
      p605_units = lang_map[132]; //"US Gal";
      break;
    case 7:
      p605_units = lang_map[133]; //"ft³";
      break;
    case 8:
      p605_units = lang_map[134]; //"Barrels";
      break;
  }
}

// Function to select the measurement units to be displayed depending on p104 value
function p104_measurement_units() {
  switch (p104_units_val) {
    default:
    case 1:
      p104_units = "m";
      break;
    case 2:
      p104_units = "cm";
      break;
    case 3:
      p104_units = "mm";
      break;
    case 4:
      p104_units = "ft";
      break;
    case 5:
      p104_units = "ins";
      break;
  }
}

function convert_to_measurement_units(val_to_convert) {
  switch (p104_units_val) {
    default:
    case 1:
      break;
    case 2:
      val_to_convert *= 100.0;
      break;
    case 3:
      val_to_convert *= 1000.0;
      break;
    case 4:
      val_to_convert *= 3.28084;
      break;
    case 5:
      val_to_convert *= 39.3701;
      break;
  }
  return val_to_convert;
}

function convert_to_mtrs(val_to_convert) {
  switch (p104_units_val) {
    default:
    case 1:
      break;
    case 2:
      val_to_convert /= 100.0;
      break;
    case 3:
      val_to_convert /= 1000.0;
      break;
    case 4:
      val_to_convert /= 3.28084;
      break;
    case 5:
      val_to_convert /= 39.3701;
      break;
  }
  return val_to_convert;
}

function settings_clear() {
  document.getElementById("p100-box").value = "";
  document.getElementById("p104-box").value = "";
  document.getElementById("p105-box").value = "";
  document.getElementById("p106-box").value = "";
  document.getElementById("p808-box").value = "";
  document.getElementById("p605-box").value = "";
  document.getElementById("p21-box").value = "";
}

function trace_start() {
  if (login_stage == 3 && isDisconnecting == 0 && isTraceOn == 0 && (presysState == 2 || presysState == 3)) {
    tids_trace_reset();
    // settings_clear();
    document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
    //setTimeout(trace_button_check, 2000);

    //log(' → Getting trace data');//log(' <- TRACE ON');
    login_stage = 4; // TRACE ON state
    isTraceOn = 1;
    document.getElementById("trace-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
    isIgnore_2 = 2; // NEED TO CHECK
    //clearTimeout(p605_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    //p104_tid = setInterval(p104_start, 1000);//5000);
    //param_set1_tid = setInterval(param_set1_start, 5000);
    param_set1_start();
    //button_press = 14;
  }
}

function p104_update() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    tids_trace_reset();
    // settings_clear();
    settings_msg_clear();
    param_start_val = 1;
    param_query = 3;
    param_tid = setInterval(param_start, 1000);
  }
}

function param_update() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    tids_trace_reset();
    // settings_clear();
    settings_msg_clear();
    /*if(param_init_query == 0) {
          param_start_val = 1;
          param_query = 0;
          param_tid = setInterval(param_start, 1000);
        }*/
  }
}

function param_start() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    switch (param_query) {
      case 0:
        button_press = 19;
        document.getElementById("btnp241").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P241");
        } else {
          sendAT("/P241");
        }
        document.getElementById("settings-message").innerHTML = lang_map[105]; //"Querying P241. Please wait...";
        break;
      case 1:
        button_press = 20;
        document.getElementById("btnp100").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P100");
        } else {
          sendAT("/P100");
        }
        document.getElementById("settings-message").innerHTML = lang_map[106]; //"Querying P100. Please wait...";
        break;
      case 2:
        button_press = 21;
        document.getElementById("btnp104").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P104");
        } else {
          sendAT("/P104");
        }
        document.getElementById("settings-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
        break;
      case 3:
        button_press = 22;
        document.getElementById("btnp105").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P105");
        } else {
          sendAT("/P105");
        }
        document.getElementById("settings-message").innerHTML = lang_map[108]; //"Querying P105. Please wait...";
        break;
      case 4:
        button_press = 23;
        document.getElementById("btnp106").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P106");
        } else {
          sendAT("/P106");
        }
        document.getElementById("settings-message").innerHTML = lang_map[109]; //"Querying P106. Please wait...";
        break;
      case 5:
        button_press = 24;
        document.getElementById("btnp808").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P808");
        } else {
          sendAT("/P808");
        }
        document.getElementById("settings-message").innerHTML = lang_map[110]; //"Querying P808. Please wait...";
        break;
      case 6:
        button_press = 25;
        document.getElementById("btnp605").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P605");
        } else {
          sendAT("/P605");
        }
        document.getElementById("settings-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
        break;
      case 7:
        button_press = 26;
        document.getElementById("btnp21").style.background = "#FFCE34"; //PULSAR YELLOW
        if (connectionType === "serial") {
          sendTX("/P21");
        } else {
          sendAT("/P21");
        }
        document.getElementById("settings-message").innerHTML = lang_map[112]; //"Querying P21. Please wait...";
        break;
      case 8:
        button_press = 0;
        clearTimeout(param_tid);
        param_start_val = 0;
        param_init_query = 1;
        settings_msg_clear();
        break;
    }
  }
}

function echo_start() {
  // do some stuff...
  // no need to recall the function (it's an interval, it'll loop forever)
  if (login_stage == 4) {
    // TRACE ON state
    clearTimeout(echo_tid);
    //clearTimeout(p104_tid);
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(param_tid);
    if (connectionType == "serial") {
      sendTX("GET ECHO");
      CommandSent = "GET ECHO";
    } else {
      sendAT("GET ECHO");
      CommandSent = "GET ECHO";
    }
    document.getElementById("trace-message").innerHTML = lang_map[113]; //"Acquiring ECHO data. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[113]; //"Acquiring ECHO data. Please wait...";
    // alert("sendAT('GET ECHO') : 1");
    button_press = 10;
    datem_tid = setInterval(datem_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}
function datem_start() {
  if (login_stage == 4) {
    // TRACE ON state
    clearTimeout(datem_tid);
    //clearTimeout(p104_tid);
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(param_tid);
    if (connectionType == "serial") {
      sendTX("GET DATEM");
      CommandSent = "GET DATEM";
    } else {
      sendAT("GET DATEM");
      CommandSent = "GET DATEM";
    }
    document.getElementById("trace-message").innerHTML = lang_map[114]; //"Acquiring DATEM data. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[114]; //"Acquiring DATEM data. Please wait...";
    button_press = 11;
    echo_tid = setInterval(echo_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function p104_start() {
  if (login_stage == 4) {
    clearTimeout(p605_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("/P104");
    } else {
      sendAT("/P104");
    }
    document.getElementById("trace-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
    button_press = 14;
    // p104_tid = setInterval(p104_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function p605_start() {
  if (login_stage == 4) {
    // TRACE ON state
    clearTimeout(p104_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType === "serial") {
      sendTX("/P605");
    } else {
      sendAT("/P605");
    }
    document.getElementById("trace-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
    button_press = 15;
    // p605_tid = setInterval(p605_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function param_set1_start() {
  if (login_stage == 4) {
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType == "serial") {
      sendTX("SENDPART1");
      CommandSent = "SENDPART1";
    } else {
      sendAT("SENDPART1");
      CommandSent = "SENDPART1";
    }

    document.getElementById("trace-message").innerHTML = lang_map[146]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[146]; //"Querying P104. Please wait...";
    button_press = 16;
    // p104_tid = setInterval(p104_start, 5000);
    param_set1_tid = setInterval(param_set1_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function param_set2_start() {
  if (login_stage == 4) {
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType == "serial") {
      sendTX("SENDPART2");
      CommandSent = "SENDPART2";
    } else {
      sendAT("SENDPART2");
      CommandSent = "SENDPART2";
    }
    document.getElementById("trace-message").innerHTML = lang_map[147]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[147]; //"Querying P104. Please wait...";
    button_press = 17;
    // p104_tid = setInterval(p104_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function param_set3_start() {
  if (login_stage == 4) {
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    if (connectionType == "serial") {
      sendTX("SENDPART3");
      CommandSent = "SENDPART3";
    } else {
      sendAT("SENDPART3");
      CommandSent = "SENDPART3";
    }
    document.getElementById("trace-message").innerHTML = lang_map[148]; //"Querying P104. Please wait...";
    document.getElementById("home-message").innerHTML = lang_map[148]; //"Querying P104. Please wait...";
    button_press = 18;
    // p104_tid = setInterval(p104_start, 5000);
  } else {
    // clearTimeout(p104_tid);
    // clearTimeout(p605_tid);
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
  }
}

function trace_button_check() {
  //log("trace_button_check :"+login_stage);
  if (login_stage == 3 /*|| login_stage == 1*/ || login_stage == 2) {
    if (isDisconnecting == 0) {
      //log(' → Getting trace data');//log(' <- TRACE ON');
      // sendAT('GET ECHO');
      if (login_stage == 2) document.getElementById("id_trace").click();
      // button_press = 10;
      // datem_tid = setInterval(datem_start, 5000);
      // clearTimeout(echo_tid);

      //sendAT('/P104');
      login_stage = 4; // TRACE ON state
      isTraceOn = 1;
      document.getElementById("trace-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      document.getElementById("home-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      isIgnore_2 = 2; // NEED TO CHECK
      //clearTimeout(p605_tid);
      //clearTimeout(param_set1_tid);
      clearTimeout(param_set2_tid);
      clearTimeout(param_set3_tid);
      clearTimeout(echo_tid);
      clearTimeout(datem_tid);
      clearTimeout(param_tid);
      //p104_tid = setInterval(p104_start, 1000);//5000);
      param_set1_tid = setInterval(param_set1_start, 500);
      //button_press = 14;
    }
  } else {
    log(lang_map[64]); //log('Device not in Normal mode!');//log('Device not in passthrough mode!');
  }
}
function Normal_mode() {
  if (login_stage >= 3 && isDisconnecting == 0) {
    // currently in PT mode
    sendAT("AT+PT=0");
    // clearTimeout(echo_tid);
    // clearTimeout(datem_tid);
    tids_trace_reset();
    // log(' <- AT+PT=0');
    login_stage = 2; //3; // back to the PT mode
    document.getElementById("btn_mode").innerHTML = "NORMAL MODE";
    // isIgnore=0;
    // isTraceOn=1;
    isIgnore = 1;
  } else if (login_stage == 2) {
    // currently in AT mode
    login_stage = 3;
    //clearTimeout(p104_tid);
    //clearTimeout(p605_tid);
    clearTimeout(param_set1_tid);
    clearTimeout(param_set2_tid);
    clearTimeout(param_set3_tid);
    clearTimeout(echo_tid);
    clearTimeout(datem_tid);
    clearTimeout(param_tid);
    document.getElementById("btn_trace").innerHTML = lang_map[9]; //'TRACE ON';
    sendATL("AT+PT=1");
    //setTimeout(trace_button_check, 1000);
    //log(' <- AT+PT=1');
    document.getElementById("btn_mode").innerHTML = "ADVANCED MODE";
  } else {
    log(lang_map[65]); //log('No device connected!');
  }
}

function tids_trace_reset() {
  login_stage = 3; // back to the PT mode
  document.getElementById("btn_trace").innerHTML = lang_map[9]; //'TRACE ON';
  //clearTimeout(p104_tid);
  //clearTimeout(p605_tid);
  clearTimeout(param_set1_tid);
  clearTimeout(param_set2_tid);
  clearTimeout(param_set3_tid);
  clearTimeout(echo_tid);
  clearTimeout(datem_tid);
  clearTimeout(param_tid);
  //p104_tid = false;
  //p605_tid = false;
  param_set1_tid = false;
  param_set2_tid = false;
  param_set3_tid = false;
  echo_tid = false;
  datem_tid = false;
  param_tid = false;
  isTraceOn = 0;
  document.getElementById("trace-message").innerHTML = "";
  document.getElementById("home-message").innerHTML = "";
}

function trace_off() {
  //alert("trace_off: isTraceOn="+isTraceOn);
  if (login_stage >= 3 && isDisconnecting == 0) {
    if (isTraceOn == 1) {
      // sendAT('TRACE OFF');
      // document.getElementById('btn_trace').innerHTML ='TRACE ON';
      // clearTimeout(echo_tid);
      // clearTimeout(datem_tid);
      tids_trace_reset();
      //log(' → Stopping trace data');//log(' <- TRACE OFF');
      login_stage = 3; // back to the PT mode
      isTraceOn = 0;
      document.getElementById("trace-message").innerHTML = "";
      document.getElementById("home-message").innerHTML = "";
      isIgnore = 1;
    } else {
      // start the static timers
      document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
      login_stage = 3;
      //clearTimeout(p104_tid);
      //clearTimeout(p605_tid);
      clearTimeout(param_set1_tid);
      clearTimeout(param_set2_tid);
      clearTimeout(param_set3_tid);
      clearTimeout(echo_tid);
      clearTimeout(datem_tid);
      clearTimeout(param_tid);
      // sendAT('TRACE ON');
      isTraceOn = 1;
      document.getElementById("trace-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      document.getElementById("home-message").innerHTML = lang_map[104]; //"Acquiring trace data. Please wait...";
      trace_button_check();
      //        isTraceOn=0;
    }
  } else {
    alert(lang_map[64]); //alert('Device not in Normal mode!');//log('Device not in passthrough mode!');
  }
}

function send_command() {
  // alert("send_command :"+login_stage);
  // log("send_command:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);

  if (document.getElementById("cmd").value == "") {
    log(lang_map[66]); //log(" → Invalid param request");
    return;
  }

  if (login_stage >= 1) {
    isIgnore = 0;
    if (login_stage == 4) {
      // log(" → Press Trace OFF to get params");
      // return;
      send_command_check();
    } else if (
      login_stage == 3 &&
      document.getElementById("cmd").value.startsWith("AT") &&
      document.getElementById("cmd").value != "AT+PT=0" &&
      document.getElementById("cmd").value != "AT+PT=1"
    ) {
      setTimeout(ptModeOFF1, 1000);
      setTimeout(sendcommand, 2000);
      setTimeout(ptModeON1, 3000);
    } else {
      if (connectionType === "serial") {
        sendTX(document.getElementById("cmd").value);
        commandboxsend = true;
      } else {
        sendAT(document.getElementById("cmd").value);
      }
      button_press = 8;
    }
  } else {
    log(lang_map[65]); //log('No device connected!');
  }
}
function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let j = 0, strLen = str.length; j < strLen; j++) {
    bufView[j] = str.charCodeAt(j);
  }
  return buf;
}

function getVal(i) {
  //param_val[i] = parseInt(hexToFloat('0x' + ('00' + s.getUint8(4*i).toString(16)).slice(-2) + ('00' + s.getUint8(4*i + 1).toString(16)).slice(-2) + ('00' + s.getUint8(4*i + 2).toString(16)).slice(-2) + ('00' + s.getUint8(4*i + 3).toString(16)).slice(-2)));
  //return (param_val[i]);
  if (connectionType === "serial") {
    // Convert hex string to array of bytes
    const byteArray = receiveBufferHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16));

    // Extract four bytes at a time and convert to float
    const startIndex = i * 4;
    const hexValue = byteArray
      .slice(startIndex, startIndex + 4)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hexToFloat("0x" + hexValue);
  } else if (connectionType === "bluetooth") {
    return hexToFloat(
      "0x" +
        ("00" + s.getUint8(4 * i).toString(16)).slice(-2) +
        ("00" + s.getUint8(4 * i + 1).toString(16)).slice(-2) +
        ("00" + s.getUint8(4 * i + 2).toString(16)).slice(-2) +
        ("00" + s.getUint8(4 * i + 3).toString(16)).slice(-2)
    );
  }
}

function param_verify(i) {
  switch (param_num[offset * 60 + i]) {
    case 241:
      document.getElementById("p241List").value = parseInt(getVal(i)) + 1;
      //console.log(document.getElementById('p241List').value);
      if (document.getElementById("p241List").value >= 2 && document.getElementById("p241List").value <= 4)
        alert(lang_map[85]);
      break;
    case 100:
      document.getElementById("p100List").value = parseInt(getVal(i));
      break;
    case 101:
      break;
    case 104:
      document.getElementById("p104List").value = parseInt(getVal(i));
      p104_units_val = parseInt(document.getElementById("p104List").value);
      p104_measurement_units(); // Update the measurement units to be displayed
      break;
    case 105:
      document.getElementById("p105-box").value = getVal(i).toFixed(3);
      break;
    case 106:
      document.getElementById("p106-box").value = getVal(i).toFixed(3);
      span_val = document.getElementById("p106-box").value;
      break;
    case 107:
      near_blanking_var = getVal(i).toFixed(3);
      break;
    case 108:
      far_blanking_var = getVal(i).toFixed(3);
      break;
    case 808:
      document.getElementById("p808List").value = parseInt(getVal(i));
      break;
    case 605:
      document.getElementById("p605List").value = parseInt(getVal(i)) + 1;
      p605_units_val = parseInt(document.getElementById("p605List").value) - 1;
      p605_volume_units(); // Update the volume units to be displayed
      break;
    case 21:
      document.getElementById("p21-box").value = getVal(i).toFixed(3);
      break;
    case 586:
      temperature_var = getVal(i);
      break;
    default:
      break;
  }
}

const utf8encoder = new TextEncoder();
const windows1251 = new TextEncoder();
var deviceName; //='REFLECT';
function utf8ToHex(s) {
  const rb = utf8encoder.encode(s);
  //const rb = windows1251.encode(s);
  let r = "";
  for (const b of rb) {
    r += ("0" + b.toString(16)).slice(-2);
    r += " ";
  }
  return r;
}

// Function to flip the hex string (if needed)
function flipHexString(hexValue, hexDigits) {
  var h = hexValue.substr(0, 2);
  for (var i = 0; i < hexDigits; ++i) {
    h += hexValue.substr(2 + (hexDigits - 1 - i) * 2, 2);
  }
  return h;
}

// Function to convert Hex values to float (Need Hex string to start with 0x)
function hexToFloat(hex) {
  var s = hex >> 31 ? -1 : 1;
  var e = (hex >> 23) & 0xff;
  return ((s * ((hex & 0x7fffff) | 0x800000) * 1.0) / Math.pow(2, 23)) * Math.pow(2, e - 127);
}

// Function to convert unsigned int 8 bit format to hex and relevant functions within it
function Uint8tohex(incoming_data) {
  a = [];
  s = incoming_data;
  var check;
  var floatval;
  const doc_value = CommandSent; //document.getElementById('cmd').value;
  for (let i = 0; i < s.byteLength; i++) {
    check = s.getUint8(i);
    if (i >= 46 && i < 246 && doc_value == "GET ECHO") {
      //(((doc_value == "GET ECHO") && (button_press == 8)) || (button_press == 10))) // Changed from (i >= 42) && (i < 242)
      echo[i - 46] = (check * 1000) / 255; // Changed from echo[i-42]
    } else if (i >= 46 && i < 246 && doc_value == "GET DATEM") {
      //(((doc_value == "GET DATEM") && (button_press == 8)) || (button_press == 11)))  // Changed from (i >= 42) && (i < 242)
      datem[i - 46] = (check * 1000) / 255; // Changed from datem[i-42]
    }
    // a.push(s.getUint8(i));
    a.push("0x" + ("00" + s.getUint8(i).toString(16)).slice(-2));
  }

  if (doc_value == "GET ECHO" || (doc_value == "GET DATEM" && s.byteLength == 246)) {
    // Populate the dynamic variables
    level_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(0).toString(16)).slice(-2) +
        ("00" + s.getUint8(1).toString(16)).slice(-2) +
        ("00" + s.getUint8(2).toString(16)).slice(-2) +
        ("00" + s.getUint8(3).toString(16)).slice(-2)
    );
    distance_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(4).toString(16)).slice(-2) +
        ("00" + s.getUint8(5).toString(16)).slice(-2) +
        ("00" + s.getUint8(6).toString(16)).slice(-2) +
        ("00" + s.getUint8(7).toString(16)).slice(-2)
    );
    volume_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(8).toString(16)).slice(-2) +
        ("00" + s.getUint8(9).toString(16)).slice(-2) +
        ("00" + s.getUint8(10).toString(16)).slice(-2) +
        ("00" + s.getUint8(11).toString(16)).slice(-2)
    );
    compensated_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(12).toString(16)).slice(-2) +
        ("00" + s.getUint8(13).toString(16)).slice(-2) +
        ("00" + s.getUint8(14).toString(16)).slice(-2) +
        ("00" + s.getUint8(15).toString(16)).slice(-2)
    );
    mA_output_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(16).toString(16)).slice(-2) +
        ("00" + s.getUint8(17).toString(16)).slice(-2) +
        ("00" + s.getUint8(18).toString(16)).slice(-2) +
        ("00" + s.getUint8(19).toString(16)).slice(-2)
    );
    temperature_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(20).toString(16)).slice(-2) +
        ("00" + s.getUint8(21).toString(16)).slice(-2) +
        ("00" + s.getUint8(22).toString(16)).slice(-2) +
        ("00" + s.getUint8(23).toString(16)).slice(-2)
    );
    gate_start = s.getUint8(24) * 256 + s.getUint8(25); //s.getUint8(32)*256 + s.getUint8(33);
    gate_stop = s.getUint8(26) * 256 + s.getUint8(27); //s.getUint8(34)*256 + s.getUint8(35);
    echo_var = s.getUint8(28) * 256 + s.getUint8(29); //s.getUint8(36)*256 + s.getUint8(37);
    noise_var = s.getUint8(30) * 256 + s.getUint8(31); //s.getUint8(38)*256 + s.getUint8(39);
    status_var = s.getUint8(32) * 256 + s.getUint8(33); //s.getUint8(40)*256 + s.getUint8(41);

    near_blanking_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(34).toString(16)).slice(-2) +
        ("00" + s.getUint8(35).toString(16)).slice(-2) +
        ("00" + s.getUint8(36).toString(16)).slice(-2) +
        ("00" + s.getUint8(37).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(42).toString(16)).slice(-2) + ('00' + s.getUint8(43).toString(16)).slice(-2) + ('00' + s.getUint8(44).toString(16)).slice(-2) + ('00' + s.getUint8(45).toString(16)).slice(-2));
    far_blanking_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(38).toString(16)).slice(-2) +
        ("00" + s.getUint8(39).toString(16)).slice(-2) +
        ("00" + s.getUint8(40).toString(16)).slice(-2) +
        ("00" + s.getUint8(41).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(46).toString(16)).slice(-2) + ('00' + s.getUint8(47).toString(16)).slice(-2) + ('00' + s.getUint8(48).toString(16)).slice(-2) + ('00' + s.getUint8(49).toString(16)).slice(-2));
    empty_distance = hexToFloat(
      "0x" +
        ("00" + s.getUint8(42).toString(16)).slice(-2) +
        ("00" + s.getUint8(43).toString(16)).slice(-2) +
        ("00" + s.getUint8(44).toString(16)).slice(-2) +
        ("00" + s.getUint8(45).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(50).toString(16)).slice(-2) + ('00' + s.getUint8(51).toString(16)).slice(-2) + ('00' + s.getUint8(52).toString(16)).slice(-2) + ('00' + s.getUint8(53).toString(16)).slice(-2));
    compensated_var_m = convert_to_mtrs(compensated_var);
    if (Math.round(compensated_var_m) == 24.0) {
      mode_var = 20.0;
    } else if (compensated_var_m.toFixed(1) == 9.6) {
      mode_var = 8.0;
    } else {
      mode_var = 40.0;
    }
    far_blanking_dist = (empty_distance * (100.0 + far_blanking_var)) / 100.0;
    near_blanking_var = convert_to_measurement_units(near_blanking_var);
    far_blanking_dist = convert_to_measurement_units(far_blanking_dist);
    empty_distance = convert_to_measurement_units(empty_distance);
    mode_var = convert_to_measurement_units(mode_var);

    var xdata = [];
    xdata[0] = 0.0;
    for (let i = 1; i <= 200; i++) {
      xdata[i] = Math.round((xdata[i - 1] + compensated_var / 200) * 1000) / 1000;
    }
    // Zooming out does not work if labels are numbers
    for (let i = 0; i <= 200; i++) {
      xdata[i] = xdata[i].toString();
    }
    myChart.data.labels = xdata;
    myChart.config.options.scales.x.title.text = p104_units;
    myChart.update();
  } else if (doc_value == "SENDPART1") {
    //(((doc_value == "SENDPART1") && (button_press == 8)) || (button_press == 16))
    offset = 0;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
      //param_verify(i);
    }
    //console.log("Got Part1");
    param_set2_start();
    param_set2_tid = setInterval(param_set2_start, 5000);
  } else if (doc_value == "SENDPART2") {
    offset = 1;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part2");
    param_set3_start();
    param_set3_tid = setInterval(param_set3_start, 5000);
  } else if (doc_value == "SENDPART3") {
    offset = 2;
    for (let i = 0; i < param_info.length - offset * 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part3");
    echo_start();
  }
  return a;
}

function data_log_update() {
  var status_str = "";
  var level_str = "";
  var dist_str = "";

  var textarea = document.getElementById("data-log");
  textarea.value = "";

  // var textarea2 = document.getElementById('main-params-log');
  // textarea2.value = "";

  var textarea2 = document.getElementById("level-log");
  textarea2.value = "";

  // var textarea3 = document.getElementById('main-params-log-t');
  // textarea3.value = "";

  var textarea3 = document.getElementById("level-log-t");
  textarea3.value = "";

  var lvlval = parseFloat(level_var);
  var dstval = parseFloat(distance_var);

  if (lvlval != 0.0 && dstval != 0.0) {
    //  if(parseFloat(level_var) > 0){
    level_str = "Lvl: " + level_var.toFixed(3) + " " + p104_units + "\n";
    //  }

    //  if(parseFloat(distance_var) >= 0){
    dist_str = "Dist: " + distance_var.toFixed(3) + " " + p104_units + "\n";
    //  }
    // textarea2.value += level_str + dist_str;
    textarea2.value = level_var.toFixed(3) + " " + p104_units;
    textarea2 = document.getElementById("distance-log");
    textarea2.value = distance_var.toFixed(3) + " " + p104_units;
    // textarea3.value += level_str + dist_str;
    textarea3.value = level_var.toFixed(3) + " " + p104_units;
    textarea3 = document.getElementById("distance-log-t");
    textarea3.value = distance_var.toFixed(3) + " " + p104_units;
  }
  if (status_var != 999) {
    bit0 = status_var & 1;
    bit1 = status_var & 2;
    bit2 = status_var & 4;
    bit3 = status_var & 8;
    bit4 = status_var & 16;
    bit5 = status_var & 32;
    bit6 = status_var & 64;
    bit7 = status_var & 128;

    if (status_var == 0) status_str = lang_map[92]; //"OK";
    else {
      if (bit4 == 16) {
        if (bit5 == 32) status_str = lang_map[93]; //"LOE fail high";
        else if (bit6 == 64) status_str = lang_map[94]; //"LOE fail low";
        else status_str = lang_map[95]; //"LOE fail";
      } else if (bit3 == 8) status_str = lang_map[96]; //"LOE";
      else if (bit2 == 4) status_str = lang_map[97]; //"Temp";
      else if (bit1 == 2) status_str = lang_map[98]; //"Voltage";
      else if (bit7 == 128) status_str = lang_map[99]; //"Alarm";
      else status_str = status_var; // + "\n\n";
    }
    // document.getElementById("sensor_status").innerHTML = "<span style='font-sze:12px; color: black; '>"+status_str+"</span>";
    // document.getElementById("sensor_status_t").innerHTML = "<span style='font-sze:12px; color: black; '>"+status_str+"</span>";
    // textarea2.value += status_str;
    textarea2 = document.getElementById("status-log");
    textarea2.value = status_str;
    // textarea3.value += "Status: " + status_str;
    textarea3 = document.getElementById("status-log-t");
    textarea3.value = status_str;
  }

  // document.getElementById("lvl").innerHTML = "<span style='font-sze:12px; color: black; '>"+level_str+"</span>";
  // document.getElementById("dist").innerHTML = "<span style='font-sze:12px;color: black;  '>"+dist_str+"</span>";

  textarea.value += lang_map[100] + /*"Volume\t= "*/ +volume_var.toFixed(3) + " " + p605_units + "\n";
  textarea.value += lang_map[101] + /*"Temp\t= "*/ +temperature_var.toFixed(1) + " °C" + "\n";
  // textarea.value += "Noise\t\t= " + noise_var.toFixed(0) + " mV" + "\n";
  textarea.value += lang_map[102] + /*"Output\t= "*/ +mA_output_var.toFixed(2) + " mA";

  // on the trace tab
  // document.getElementById("lvl_t").innerHTML = "<span style='font-sze:12px; color: black; '>"+level_str+"</span>";
  // document.getElementById("dist_t").innerHTML = "<span style='font-sze:12px;color: black;  '>"+dist_str+"</span>";
  var textarea1 = document.getElementById("data-log_t");
  textarea1.value = "";
  textarea1.value = textarea.value;
  textarea1.scrollTop = textarea.scrollHeight;
}

function populate_params(string_val) {
  if (string_val.includes("/P241:")) {
    document.getElementById("p241List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1)) + 1;
    param_query = 1;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    if (document.getElementById("p241List").value >= 2 && document.getElementById("p241List").value <= 4)
      alert(lang_map[85]); //alert('Warning: Indicator (P241) is set to installation mode. Switch to Health mode (P241 = 7) after installation!');
    document.getElementById("btnp241").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P100:")) {
    //document.getElementById('p100-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
    document.getElementById("p100List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1));
    param_query = 2;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    document.getElementById("btnp100").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P104:")) {
    //document.getElementById('p104-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
    //p104_units_val = parseInt(document.getElementById('p104-box').value);
    document.getElementById("p104List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1));
    p104_units_val = parseInt(document.getElementById("p104List").value);
    p104_measurement_units(); // Update the measurement units to be displayed
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    if (p104_param_update == 1) p104_update();
    param_query = 3;
    document.getElementById("btnp104").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P105:")) {
    document.getElementById("p105-box").value = string_val.slice(string_val.lastIndexOf(":") + 1); //string_val.substring(string_val.indexOf(':') + 1);
    param_query = 4;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    document.getElementById("btnp105").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P106:")) {
    document.getElementById("p106-box").value = string_val.slice(string_val.lastIndexOf(":") + 1); //string_val.substring(string_val.indexOf(':') + 1);
    span_val = document.getElementById("p106-box").value;
    param_query = 5;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    if (p104_param_update == 1) {
      p104_param_update = 0;
      param_query = 8;
    }
    document.getElementById("btnp106").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P808:")) {
    //document.getElementById('p808-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
    document.getElementById("p808List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1));
    param_query = 6;
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    document.getElementById("btnp808").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P605:")) {
    //document.getElementById('p605-box').value = string_val.slice(string_val.lastIndexOf(':') + 1);//string_val.substring(string_val.indexOf(':') + 1);
    //p605_units_val = parseInt(document.getElementById('p605-box').value);
    document.getElementById("p605List").value = parseInt(string_val.slice(string_val.lastIndexOf(":") + 1)) + 1;
    p605_units_val = parseInt(document.getElementById("p605List").value) - 1;
    p605_volume_units(); // Update the volume units to be displayed
    if (param_start_val == 0 || param_tid == false) settings_msg_clear();
    /*
        if(isTraceOn == 1) {

          // sendAT('GET ECHO');
          // button_press = 10;
          // datem_tid = setInterval(datem_start, 5000);
          //clearTimeout(p605_tid);
          clearTimeout(datem_tid);
          //clearTimeout(p104_tid);
          clearTimeout(param_tid);
          clearTimeout(param_set1_tid);
          clearTimeout(param_set2_tid);
          clearTimeout(param_set3_tid);
          document.getElementById("trace-message").innerHTML = lang_map[113];//"Acquiring ECHO data. Please wait...";
          document.getElementById("home-message").innerHTML = lang_map[113];//"Acquiring ECHO data. Please wait...";
          echo_tid = setInterval(echo_start, 1000);//5000);

        }
        */
    param_query = 7;
    document.getElementById("btnp605").style.background = "#33B34A"; //PULSAR GREEN
  } else if (string_val.includes("/P21:")) {
    document.getElementById("p21-box").value = string_val.slice(string_val.lastIndexOf(":") + 1); //string_val.substring(string_val.indexOf(':') + 1);
    param_query = 8;
    param_start_val = 0;
    settings_msg_clear();
    document.getElementById("btnp21").style.background = "#33B34A"; //PULSAR GREEN
  }
}
function parseMetrics(uartOutput) {
  const patterns = {
    reflect: /REFLECT-E\((\d+)\),/,
    fwversion: /fwversion\(([^)]+)\),/,
    access: /access\((\d+)\),/,
  };

  const metrics = {};

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = uartOutput.match(pattern);
    if (match) {
      metrics[key] = isNaN(match[1]) ? match[1].trim() : parseFloat(match[1]);
    } else {
      metrics[key] = null;
    }
  }

  return metrics;
}

async function listenRX() {
  reader = port.readable.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log("[readLoop] DONE");
        break;
      }
      if (value) {
        // Convert the received bytes to a hex string
        const receivedHex = Array.from(value)
          .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
          .join("");
        receiveBufferHex += receivedHex;
        // Clear any previous timeout
        clearTimeout(receiveTimeout);
        clearTimeout(noResponseTimeout);

        // Set a timeout to process data after 50 ms
        receiveTimeout = setTimeout(async () => {
          // Make the function inside setTimeout async
          // Convert the hex string to ASCII characters
          receiveBufferASCII += receiveBufferHex
            .match(/.{1,2}/g)
            .reduce((acc, char) => acc + String.fromCharCode(parseInt(char, 16)), "");

          // Process the accumulated data
          if (receiveBufferASCII.includes("success")) {
            log("Serial port connected successfully!");
            log("Ready to communicate!\n");
            document.getElementById("connectionImage").src = "img/usb-connected.svg";
            var elements = document.querySelectorAll("button[type=button]");
            for (var i = 0, len = elements.length; i < len; i++)
              document.getElementById(elements[i].id).style.background = "#33B34A"; //PULSAR GREEN
            login_stage = 2;
            button_press = 3;
            setTimeout(trace_button_check, 1000);
          }
          if (receiveBufferASCII.includes("REFLECT-E")) {
            const metrics = parseMetrics(receiveBufferASCII);
            console.log(metrics);
            const reflecte_name = metrics[Object.keys(metrics)[0]];
            const reflecte_fwversion = metrics[Object.keys(metrics)[1]];
            const reflecte_access = metrics[Object.keys(metrics)[2]];
            document.querySelector(".static_image img").src = "img/Picture1.png";
            document.getElementById("id_title").textContent = "REFLECT-E";
            document.getElementById("reflecte_devinfo-label").textContent = "REFLECT-E INFORMATION";
            document.getElementById("device_title").innerHTML = reflecte_name;
            document.getElementById("deviceInfo-box").innerText = "REFLECT-E: " + reflecte_name;
            document.getElementById("reflecte_fwversion-box").innerText = "version " + reflecte_fwversion;
            let access_string = "";
            switch (reflecte_access) {
              case 1:
                access_string = "ACCESS: CUSTOMER";
                break;
              case 2:
                access_string = "ACCESS: SERVICE";
                break;
              case 3:
                access_string = "ACCESS: GOLDCARD";
                break;
              case 4:
                access_string = "ACCESS: PRODUCTION";
                break;
              default:
                access_string = "ACCESS: CUSTOMER";
                break;
            }
            document.getElementById("reflecte_access-box").innerText = access_string;
          } else {
            await processReceivedData(); // Await here inside the async function
          }

          receiveBufferHex = "";
          receiveBufferASCII = "";
        }, 50);
      }
    }
  } catch (error) {
    console.error("[readLoop] ERROR", error);
    log("Error receiving data. Please check the connection and try again.\n");
  } finally {
    reader.releaseLock();
  }
}

// 4- HEX to ASCII conversion
function hexToAscii(hexString) {
  if (!hexString) return ""; // Return empty string if hexString is falsy (null, undefined, empty string, etc.)

  // Split hexString into pairs of characters, convert each pair from hex to ASCII, and concatenate into a string
  return hexString.match(/.{1,2}/g).reduce((acc, char) => acc + String.fromCharCode(parseInt(char, 16)), "");
}

async function processReceivedData() {
  const doc_value = CommandSent;
  if (
    doc_value == "GET ECHO" ||
    doc_value == "GET DATEM" ||
    doc_value == "SENDPART1" ||
    doc_value == "SENDPART2" ||
    doc_value == "SENDPART3"
  ) {
    var hex = interpretHex(receiveBufferHex); //create a test function for this to emulate how this is working as well, what will be the parameter here
  } else {
    //these checks are all ascii related and hence will use the ascii conversion of data
    if (hexToAscii(receiveBufferHex).includes("/SET")) {
      let afterColon = hexToAscii(receiveBufferHex).split("T")[1];
      if (afterColon.includes("1:DONE")) {
        await sendTX(combined_secondSet, true);
        CommandSent = "";
      } else if (afterColon.includes("2:DONE")) {
        await sendTX(combined_remainingSet, true);
        CommandSent = "";
      }
    }
    if (hexToAscii(receiveBufferHex).includes("/P")) {
      //
      populate_params(hexToAscii(receiveBufferHex));
    }
    if (hexToAscii(receiveBufferHex).includes("/P") || hexToAscii(receiveBufferHex).includes("/ACCESS")) {
      if (
        !(
          isTraceOn == 1 &&
          (hexToAscii(receiveBufferHex).includes("/P104") || hexToAscii(receiveBufferHex).includes("/P605"))
        )
      ) {
        log(" ← " + hexToAscii(receiveBufferHex).slice(hexToAscii(receiveBufferHex).lastIndexOf("/")));
      } else {
        log(" ← " + hexToAscii(receiveBufferHex));
      }
      if (hexToAscii(receiveBufferHex).includes("/ACCESS:")) {
        let afterColon = hexToAscii(receiveBufferHex).split(":")[1];
        document.getElementById("reflecte_access-box").innerText = "ACCESS: " + afterColon;
      }
    }
    if (
      hexToAscii(receiveBufferHex).includes("Restricted") ||
      hexToAscii(receiveBufferHex).includes("Same") ||
      hexToAscii(receiveBufferHex).includes("range") ||
      hexToAscii(receiveBufferHex).includes("Read-Only")
    ) {
      log(" ← " + hexToAscii(receiveBufferHex));
    }
    //include her which can be used to send more
  }
}
function hexToInt16(hex1, hex2) {
  return (parseInt(hex1, 16) << 8) + parseInt(hex2, 16);
}
// Function to convert unsigned int 8 bit format to hex and relevant functions within it
function interpretHex(incoming_data) {
  a = [];
  s = incoming_data;
  var check;
  var floatval;
  const doc_value = CommandSent;
  const byteArray = receiveBufferHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16));
  for (let i = 0; i < byteArray.length; i++) {
    check = byteArray[i];
    if (i >= 46 && i < 246 && doc_value == "GET ECHO") {
      // Changed from (i >= 42) && (i < 242)
      echo[i - 46] = (check * 1000) / 255; // Changed from echo[i-42]
    } else if (i >= 46 && i < 246 && doc_value == "GET DATEM") {
      // Changed from (i >= 42) && (i < 242)
      datem[i - 46] = (check * 1000) / 255; // Changed from datem[i-42]
    }
    // a.push(s.getUint8(i));
    a.push("0x" + check.toString(16).padStart(2, "0"));
  }

  if (doc_value == "GET ECHO" || doc_value == "GET DATEM") {
    // Populate the dynamic variables
    //these are wrong calculations
    level_var = getVal(0);
    distance_var = getVal(1);
    volume_var = getVal(2);
    compensated_var = getVal(3);
    mA_output_var = getVal(4);
    temperature_var = getVal(5);
    gate_start = hexToInt16(receiveBufferHex.slice(48, 50), receiveBufferHex.slice(50, 52));
    gate_stop = hexToInt16(receiveBufferHex.slice(52, 54), receiveBufferHex.slice(54, 56));
    echo_var = hexToInt16(receiveBufferHex.slice(56, 58), receiveBufferHex.slice(58, 60));
    noise_var = hexToInt16(receiveBufferHex.slice(60, 62), receiveBufferHex.slice(62, 64));
    status_var = hexToInt16(receiveBufferHex.slice(64, 66), receiveBufferHex.slice(66, 68));

    near_blanking_var = getVal(8.5);
    far_blanking_var = getVal(9.5);
    empty_distance = getVal(10.5);
    compensated_var_m = convert_to_mtrs(compensated_var);
    if (Math.round(compensated_var_m) == 24.0) {
      mode_var = 20.0;
    } else if (compensated_var_m.toFixed(1) == 9.6) {
      mode_var = 8.0;
    } else {
      mode_var = 40.0;
    }
    far_blanking_dist = (empty_distance * (100.0 + far_blanking_var)) / 100.0;
    near_blanking_var = convert_to_measurement_units(near_blanking_var);
    far_blanking_dist = convert_to_measurement_units(far_blanking_dist);
    empty_distance = convert_to_measurement_units(empty_distance);
    mode_var = convert_to_measurement_units(mode_var);

    var xdata = [];
    xdata[0] = 0.0;
    for (let i = 1; i <= 200; i++) {
      xdata[i] = Math.round((xdata[i - 1] + compensated_var / 200) * 1000) / 1000;
    }
    // Zooming out does not work if labels are numbers
    for (let i = 0; i <= 200; i++) {
      xdata[i] = xdata[i].toString();
    }
    myChart.data.labels = xdata;
    myChart.config.options.scales.x.title.text = p104_units;
    myChart.update();
  } else if (doc_value == "SENDPART1") {
    offset = 0;
    for (let i = 0; i < 60; i++) {
      //getVal(i);
      param_verify(i);
    }
    //console.log("Got Part1");
    param_set2_start();
    param_set2_tid = setInterval(param_set2_start, 5000);
  } else if (doc_value == "SENDPART2") {
    offset = 1;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part2");
    param_set3_start();
    param_set3_tid = setInterval(param_set3_start, 5000);
  } else if (doc_value == "SENDPART3") {
    offset = 2;
    for (let i = 0; i < param_info.length - offset * 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part3");
    echo_start();
  }
  return a;
}
// Function to convert unsigned int 8 bit format to hex and relevant functions within it
function Uint8tohex_test(incoming_data) {
  a = [];
  s = incoming_data;
  var check;
  var floatval;
  const doc_value = document.getElementById("cmd").value;
  for (let i = 0; i < s.byteLength; i++) {
    check = s.getUint8(i);
    if (i >= 46 && i < 246 && ((doc_value == "GET ECHO" && button_press == 8) || button_press == 10)) {
      // Changed from (i >= 42) && (i < 242)
      echo[i - 46] = (check * 1000) / 255; // Changed from echo[i-42]
    } else if (i >= 46 && i < 246 && ((doc_value == "GET DATEM" && button_press == 8) || button_press == 11)) {
      // Changed from (i >= 42) && (i < 242)
      datem[i - 46] = (check * 1000) / 255; // Changed from datem[i-42]
    }
    // a.push(s.getUint8(i));
    a.push("0x" + ("00" + s.getUint8(i).toString(16)).slice(-2));
  }

  if (
    (doc_value == "GET ECHO" ||
      (doc_value == "GET DATEM" && button_press == 8) ||
      button_press == 10 ||
      button_press == 11) &&
    s.byteLength == 246
  ) {
    // Populate the dynamic variables
    level_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(0).toString(16)).slice(-2) +
        ("00" + s.getUint8(1).toString(16)).slice(-2) +
        ("00" + s.getUint8(2).toString(16)).slice(-2) +
        ("00" + s.getUint8(3).toString(16)).slice(-2)
    );
    distance_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(4).toString(16)).slice(-2) +
        ("00" + s.getUint8(5).toString(16)).slice(-2) +
        ("00" + s.getUint8(6).toString(16)).slice(-2) +
        ("00" + s.getUint8(7).toString(16)).slice(-2)
    );
    volume_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(8).toString(16)).slice(-2) +
        ("00" + s.getUint8(9).toString(16)).slice(-2) +
        ("00" + s.getUint8(10).toString(16)).slice(-2) +
        ("00" + s.getUint8(11).toString(16)).slice(-2)
    );
    compensated_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(12).toString(16)).slice(-2) +
        ("00" + s.getUint8(13).toString(16)).slice(-2) +
        ("00" + s.getUint8(14).toString(16)).slice(-2) +
        ("00" + s.getUint8(15).toString(16)).slice(-2)
    );
    mA_output_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(16).toString(16)).slice(-2) +
        ("00" + s.getUint8(17).toString(16)).slice(-2) +
        ("00" + s.getUint8(18).toString(16)).slice(-2) +
        ("00" + s.getUint8(19).toString(16)).slice(-2)
    );
    temperature_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(20).toString(16)).slice(-2) +
        ("00" + s.getUint8(21).toString(16)).slice(-2) +
        ("00" + s.getUint8(22).toString(16)).slice(-2) +
        ("00" + s.getUint8(23).toString(16)).slice(-2)
    );
    gate_start = s.getUint8(24) * 256 + s.getUint8(25); //s.getUint8(32)*256 + s.getUint8(33);
    gate_stop = s.getUint8(26) * 256 + s.getUint8(27); //s.getUint8(34)*256 + s.getUint8(35);
    echo_var = s.getUint8(28) * 256 + s.getUint8(29); //s.getUint8(36)*256 + s.getUint8(37);
    noise_var = s.getUint8(30) * 256 + s.getUint8(31); //s.getUint8(38)*256 + s.getUint8(39);
    status_var = s.getUint8(32) * 256 + s.getUint8(33); //s.getUint8(40)*256 + s.getUint8(41);

    near_blanking_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(34).toString(16)).slice(-2) +
        ("00" + s.getUint8(35).toString(16)).slice(-2) +
        ("00" + s.getUint8(36).toString(16)).slice(-2) +
        ("00" + s.getUint8(37).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(42).toString(16)).slice(-2) + ('00' + s.getUint8(43).toString(16)).slice(-2) + ('00' + s.getUint8(44).toString(16)).slice(-2) + ('00' + s.getUint8(45).toString(16)).slice(-2));
    far_blanking_var = hexToFloat(
      "0x" +
        ("00" + s.getUint8(38).toString(16)).slice(-2) +
        ("00" + s.getUint8(39).toString(16)).slice(-2) +
        ("00" + s.getUint8(40).toString(16)).slice(-2) +
        ("00" + s.getUint8(41).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(46).toString(16)).slice(-2) + ('00' + s.getUint8(47).toString(16)).slice(-2) + ('00' + s.getUint8(48).toString(16)).slice(-2) + ('00' + s.getUint8(49).toString(16)).slice(-2));
    empty_distance = hexToFloat(
      "0x" +
        ("00" + s.getUint8(42).toString(16)).slice(-2) +
        ("00" + s.getUint8(43).toString(16)).slice(-2) +
        ("00" + s.getUint8(44).toString(16)).slice(-2) +
        ("00" + s.getUint8(45).toString(16)).slice(-2)
    ); //hexToFloat('0x' + ('00' + s.getUint8(50).toString(16)).slice(-2) + ('00' + s.getUint8(51).toString(16)).slice(-2) + ('00' + s.getUint8(52).toString(16)).slice(-2) + ('00' + s.getUint8(53).toString(16)).slice(-2));
    compensated_var_m = convert_to_mtrs(compensated_var);
    if (Math.round(compensated_var_m) == 24.0) {
      mode_var = 20.0;
    } else if (compensated_var_m.toFixed(1) == 9.6) {
      mode_var = 8.0;
    } else {
      mode_var = 40.0;
    }
    far_blanking_dist = (empty_distance * (100.0 + far_blanking_var)) / 100.0;
    near_blanking_var = convert_to_measurement_units(near_blanking_var);
    far_blanking_dist = convert_to_measurement_units(far_blanking_dist);
    empty_distance = convert_to_measurement_units(empty_distance);
    mode_var = convert_to_measurement_units(mode_var);

    var xdata = [];
    xdata[0] = 0.0;
    for (let i = 1; i <= 200; i++) {
      xdata[i] = Math.round((xdata[i - 1] + compensated_var / 200) * 1000) / 1000;
    }
    // Zooming out does not work if labels are numbers
    for (let i = 0; i <= 200; i++) {
      xdata[i] = xdata[i].toString();
    }
    myChart.data.labels = xdata;
    myChart.config.options.scales.x.title.text = p104_units;
    myChart.update();
  } else if ((doc_value == "SENDPART1" && button_press == 8) || button_press == 16) {
    offset = 0;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
      //param_verify(i);
    }
    //console.log("Got Part1");
    param_set2_start();
    param_set2_tid = setInterval(param_set2_start, 5000);
  } else if ((doc_value == "SENDPART2" && button_press == 8) || button_press == 17) {
    offset = 1;
    for (let i = 0; i < 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part2");
    param_set3_start();
    param_set3_tid = setInterval(param_set3_start, 5000);
  } else if ((doc_value == "SENDPART3" && button_press == 8) || button_press == 18) {
    offset = 2;
    for (let i = 0; i < param_info.length - offset * 60; i++) {
      param_verify(i);
    }
    //console.log("Got Part3");
    echo_start();
  }
  return a;
}
function hexToFloat_test(hex) {
  var s = hex >> 31 ? -1 : 1;
  var e = (hex >> 23) & 0xff;
  var result = ((s * ((hex & 0x7fffff) | 0x800000) * 1.0) / Math.pow(2, 23)) * Math.pow(2, e - 127);
  // Round very low values to three decimal places
  if (Math.abs(result) < 0.001) {
    result = parseFloat(result.toFixed(3));
  }
  return result;
}

// Simulation of getVal function
function getVal_test(i) {
  if (connectionType === "serial") {
    // Convert hex string to array of bytes
    const byteArray = receiveBufferHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16));

    // Extract four bytes at a time and convert to float
    const startIndex = i * 4;
    const hexValue = byteArray
      .slice(startIndex, startIndex + 4)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    console.log(hexToFloat_test("0x" + hexValue));
  }
  //else continue as it is, for the BT mode
}
// Incoming GATT notification was received
async function incomingData(event) {
  // Read data from BLE CodeLess peer
  let readInValue = await outboundChar.readValue();
  let decoder = new TextDecoder("utf-8");
  // var checkBox = document.getElementById("myCheck");
  const doc_value = CommandSent; //document.getElementById('cmd').value;
  const string_check = decoder.decode(readInValue).replace("\r", "\r ← ").replace("\n", "").replace("\0", "");
  //alert("button_press="+button_press+" readInValue="+readInValue+"login_stage="+login_stage+" string_check="+string_check);
  //alert(login_stage + " " +isIgnore);
  // alert(string_check + "1");
  //log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);

  if (isIgnore_2 === 2) {
    //NEED TO CHECK
    isIgnore_2 = 0;
    //await sleep(2 * 1000);
    //return;
  }

  if (isIgnore == 1) {
    isIgnore = 0;
    return; //--> need to check
  }

  //alert(string_check + "2");
  if (
    /*(button_press == 10) || (button_press == 11) || (button_press == 16) || (button_press == 17) || (button_press == 18) ||*/ /*(button_press == 8) &&*/ doc_value ==
      "GET ECHO" ||
    doc_value == "GET DATEM" ||
    doc_value == "SENDPART1" ||
    doc_value == "SENDPART2" ||
    doc_value == "SENDPART3"
  ) {
    var hex = Uint8tohex(readInValue);
    // if((button_press == 10) || ((button_press == 8) && (doc_value == "GET ECHO")))
    //   log(" ← ECHO Received");
    // else if ((button_press == 11) || ((button_press == 8) && (doc_value == "GET DATEM")))
    //   log(" ← DATEM Received");
  } else {
    //alert(string_check + "3");
    if (string_check.includes("Entered PASSTHROUGH mode")) {
      login_stage = 3; // Entered PT mode
      log(lang_map[67]); //log(" ← Log in Success");
    } else if (string_check.includes("Exit PASSTHROUGH mode")) {
      //alert("Exit : isIgnore="+isIgnore+" login_stage="+login_stage+" isDisconnecting="+isDisconnecting+" string_check="+string_check);
      login_stage = 2; // moving to AT mode
    } else if (string_check.includes("PASSTHROUGH failed")) {
      login_stage = 2;
      log(lang_map[68]); //log(" ← Normal mode failed");
    } else if (string_check.includes("Logged In Success") || (string_check.includes("OK") && login_stage == 1)) {
      login_stage = 2; // Logged in success mode
      closeForm();
      if (isDisconnecting == 0) {
        log(lang_map[69]); //log(" ← Connected");
        document.getElementById("connectionImage").src = "img/bluetooth-active.svg";
        var elements = document.querySelectorAll("button[type=button]");
        for (var i = 0, len = elements.length; i < len; i++)
          document.getElementById(elements[i].id).style.background = "#33B34A"; //PULSAR GREEN

        //sendATL('AT+PT=1');
        sendAT("AT+PWRLVL");
        setTimeout(ptLModeON, 1000);
        setTimeout(trace_button_check, 3000); //2000); // UNDER TEST 1
      } else {
        // alert(isDisconnecting+" ::"+string_check);
        log(lang_map[70]); //log(" ← Disconnecting");
      }
    } else if ((string_check.includes("ERROR") || string_check.includes("Logged In failed")) && login_stage == 1) {
      document.getElementById("lblpsw").innerHTML = lang_map[125]; //'Login failed';
      document.getElementById("lblpsw").style.color = "red";
      document.getElementById("pswbox").value = "";
      openForm();
    } else {
      var disp = 0;
      if ((button_press >= 20 && button_press <= 26) || string_check.includes("/P")) populate_params(string_check);
      //alert(string_check+"st");
      if (isTerminated === 1 || isDisconnecting === 1 || isDisconnecting === 2) {
        disp = 1;
        await sleep(2 * 1000);
      }

      if (disp == 0) {
        if (sysState == 2 && string_check.length > 12) {
          //log(" ← param state" + sysState );
        } else if (string_check.includes("/P")) {
          if (!(isTraceOn == 1 && (string_check.includes("/P104") || string_check.includes("/P605"))))
            log(" ← " + string_check.slice(string_check.lastIndexOf("/"))); //   alert(string_check.slice(string_check.lastIndexOf('/')));
        } else {
          if (cmd_sent == "AT+PWRLVL") {
            update_range(parseInt(string_check));
          } else if (cmd_sent == "AT+PWRLVL=") {
            if (string_check.includes("ERROR")) update_range(power_lvl);
            else if (string_check.includes("OK")) update_range(new_power_lvl);
          }
          log(" ← " + string_check);
        }
      }

      //alert(string_check + "2");
      // Log the incoming string (format slightly)
      //var res=decoder.decode(readInValue).replace('\r','\r <- ').replace('\n','').replace('\0','');
      //log(" <- " + sizeof(res) + " "+res);
      //await sleep(2 * 1000);
    }
  }
}

function reload_webpage() {
  window.location = window.location.href; //window.location.reload();
}

async function onDisconnected() {
  tids_trace_reset();
  reset_params();
  document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
  log(lang_map[71]); //log(" → Bluetooth connection terminated!");
  button_press = 0;
  login_stage = 0;
  isDisconnecting = 0; // completed
  isTerminated = 1;
  var elements = document.querySelectorAll("button[type=button]");
  for (var i = 0, len = elements.length; i < len; i++) document.getElementById(elements[i].id).style.background = "#F37021";
  /*The below mentioned experimental functionality currently available in Chrome 101 works fine. 
        But requires the user to enable the chrome://flags/#enable-web-bluetooth-new-permissions-backend flag.
        This functionality is ideal and it does not requires the page to reload*/
  //await device.forget();

  setTimeout(reload_webpage, 1000);
}

async function bleTDisconnect() {
  try {
    //log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);
    if (device == null) log(lang_map[73]);
    else if (device.gatt.connected) {
      device.gatt.disconnect();
      log(lang_map[72]); //log(" → Disconnected");
    } else {
      log(lang_map[73]); //log(' → Bluetooth Device is already disconnected');
    }
    var elements = document.querySelectorAll("button[type=button]");
    for (var i = 0, len = elements.length; i < len; i++)
      document.getElementById(elements[i].id).style.background = "#F37021";
    button_press = 0;
    login_stage = 0;
    isDisconnecting = 0; // completed

    /*The below mentioned experimental functionality currently available in Chrome 101 works fine. 
          But requires the user to enable the chrome://flags/#enable-web-bluetooth-new-permissions-backend flag.
          This functionality is ideal and it does not requires the page to reload*/
    //await device.forget();

    setTimeout(reload_webpage, 1000);
    // isTerminated=0;
    //await sleep(3 * 1000);  // NOT NECESSARY
  } catch (error) {
    console.error(error);
  }
}

async function bleT1Disconnect() {
  if (login_stage >= 2) {
    sendATL("AT+PT=0"); //--> BB: commented
    await sleep(3 * 1000);
    isDisconnecting = 1;
    // log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);
    bleTDisconnect(); //setTimeout(bleTDisconnect,1000);
  } else if (login_stage == 1) {
    bleTDisconnect(); //setTimeout(bleTDisconnect,1000);
  } else {
    log(lang_map[65]); //log('No device connected!');
  }
}
async function testDisconnect() {
  if (connectionType === "serial") {
    serialDisconnect();
  } else {
    bleDisconnect();
  }
}
async function serialDisconnect() {
  if (reader) {
    sendTX("+++");
    await reader.cancel();
    await reader.releaseLock();
    reader = null;
    console.log("Reader cancelled and released.");
    reload_webpage();
  }

  if (port) {
    await port.close();
    port = null;
    console.log("Serial port closed.");
  }
}
async function bleDisconnect() {
  isIgnore_2 = 1;
  isDisconnecting = 2;
  //log("login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" button_press="+button_press);

  // if(login_stage == 4){
  //   sendAT('TRACE OFF');
  // }
  // clearTimeout(echo_tid);
  // clearTimeout(datem_tid);
  tids_trace_reset();
  document.getElementById("btn_trace").innerHTML = lang_map[8]; //'TRACE OFF';
  // document.getElementById('btn_mode').innerHTML ='ADVANCED MODE';

  log(lang_map[74]); //log(" → Disconnecting");
  bleT1Disconnect(); //setTimeout(bleT1Disconnect,1000);
}

// go to the reflect manual page
async function bleExit1Page() {
  if (login_stage > 0) {
    bleDisconnect();
  }
  login_stage = 0;
  window.open("https://pulsarmeasurement.com/reflect", "_blank").focus;
}

// go to Pulsar home page
async function bleExitPage() {
  if (login_stage > 0) {
    bleDisconnect();
  }
  login_stage = 0;
  window.open("https://pulsarmeasurement.com", "_blank").focus;
}

async function bleExitPage2() {
  if (login_stage > 0) {
    bleDisconnect();
    login_stage = 0;
  }
}

/*
    sendATL commandto be used for only the AT+PT or AT+AUTH
    rest, use the sendAT command
*/
// Send an AT command to the CodeLess BLE peer
async function sendATL(cmd) {
  //log("ww"+cmd);
  //log("sendATL:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isTerminated="+isTerminated+" isDisconnecting="+isDisconnecting);

  if (isIgnore_2 == 1 || isDisconnecting == 2) {
    return;
  }

  if (cmd === "AT+PT=1") {
    log(lang_map[75]); //log(' → Logging ...'   );
    await sleep(2 * 1000); // needed
    isIgnore = 1;
  } else if (cmd.includes("AT+AUTH=")) {
  } else if (cmd === "AT+PT=0") {
    //log(' → Connecting ...'   );
  } else if (isDisconnecting == 2) {
    log(lang_map[76]); //log(' → Disconnecting ...'   );
    isDisconnecting = 0;
  } else {
    log(lang_map[77]); //log(' → Connecting ...'   );
  }

  // Append an extra character as expected by CodeLess
  var commandToSend = cmd + "\0";
  try {
    let encoder = new TextEncoder("utf-8");
    // Send command via GATT Write request
    await inboundChar.writeValue(encoder.encode(commandToSend));
  } catch (error) {
    log(lang_map[78] + error); //log('Failed: ' + error);
  }
}
function refreshUniteInfo() {
  // send +++ to put Unite into normal information mode
  //
}

async function test_connect() {
  if (connectionType === "serial") {
    if (navigator.serial) {
      await connectToSerialPort();
    } else {
      await ble_connect();
    }
  } else if (connectionType === "bluetooth") {
    await ble_connect();
  }
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectToSerialPort() {
  try {
    log("Requesting serial port connection...\n");
    port = await navigator.serial.requestPort();
    const baudRate = 115200; // Set baud rate to 115200
    await port.open({ baudRate: baudRate });
    await sendTX("");
    await delay(1000); // Delay for 2 second
    //await sendTX("node show");
    //await delay(2000); // Delay for 2 second
    //await sendTX("modem status");
    //await delay(2000); // Delay for 2 second
    log("Opening host tunnel through to Reflect...");
    await sendTX("host tunnel");
    await delay(1000); // Delay for 1 second
    await sendTX("host tunnel");
    await delay(1000); // Delay for 1 second
    await sendTX("/DEVINFO");
    await delay(1000); // Delay for 1 second
    noResponseTimeout = setTimeout(() => {
      log('Error: No response received after sending "host tunnel"');
      //disconnect from serial port
    }, 2000);
    await listenRX();
  } catch (err) {
    console.error("Error connecting to serial port:", err);
    log(err + "\n");
  }
}
async function sendTX(data, isHex = false) {
  try {
    if (!port) {
      log("Serial port is not connected.");
      return;
    }

    const writer = port.writable.getWriter();
    let encodedData;

    if (isHex) {
      // Data is already a Uint8Array, no need to encode further
      encodedData = new Uint8Array(data);
      console.log("Data sent (binary):", encodedData);
    } else {
      // Treat data as ASCII string
      let stringToSend = data;
      if (stringToSend !== "+++") {
        stringToSend += "\r\n";
      }

      // Log only if it's not one of the excluded strings
      if (
        !stringToSend.includes("GET ECHO") &&
        !stringToSend.includes("GET DATEM") &&
        !stringToSend.includes("SENDPART1") &&
        !stringToSend.includes("SENDPART2") &&
        !stringToSend.includes("SENDPART3") &&
        !stringToSend.includes("host tunnel") &&
        stringToSend !== "+++" &&
        stringToSend !== "\r\n" &&
        !(isTraceOn === 1 && (stringToSend.includes("/P104") || stringToSend.includes("/P605")))
      ) {
        log(" → " + stringToSend);
      }

      // Encode ASCII string to send
      encodedData = new TextEncoder().encode(stringToSend);
      console.log("Data sent (ASCII):", stringToSend);
    }

    // Write the encoded data to the port
    await writer.write(encodedData);
    writer.releaseLock();
  } catch (error) {
    console.error("Error sending data:", error);
    log("Error sending data. Please check the connection and try again.");
  }
}

// Function to toggle connection type
function toggle_connection_type() {
  if (connectionType === "serial") {
    connectionType = "bluetooth";
    document.getElementById("connectionImage").src = "img/bluetooth-disabled.svg";
    //document.querySelector('.static_image img').src = "img/tank1.png";
    document.getElementById("bt_range").style.display = "block";
    document.getElementById("reflecte_devinfo").style.display = "none";
    sendTX("+++");
    reload_webpage();
  } else {
    if (navigator.serial) {
      connectionType = "serial";
      document.getElementById("connectionImage").src = "img/usb-disconnected.svg";
      //document.querySelector('.static_image img').src = "img/Picture1.png";
      document.getElementById("bt_range").style.display = "none";
      document.getElementById("reflecte_devinfo").style.display = "block";
      reload_webpage();
    }
  }

  // Save the updated connection type to local storage
  localStorage.setItem("connectionType", connectionType);
}
async function ble_connect() {
  isIgnore_2 = 0;
  isDisconnecting = 0;
  isTerminated = 0;

  try {
    // Define a scan filter and prepare for interaction with Codeless Service
    log("");
    log(lang_map[79]); ////log('Requesting Bluetooth Device...');
    device = await navigator.bluetooth.requestDevice(options);
    log(lang_map[80] + device.name); ////log('Name: ' + device.name);
    deviceName = lang_map[0] + ":"; /*'REFLECT: '+ '\n' + device.name;*/
    document.getElementById("id_title").innerHTML = deviceName;
    document.getElementById("device_title").innerHTML = device.name;
    document.getElementById("deviceName-box").value = device.name;

    device.addEventListener("gattserverdisconnected", onDisconnected);
    // Connect to device GATT and perform attribute discovery
    server = await device.gatt.connect();
    const service = await server.getPrimaryService(CODELESS_SVC_UUID);
    inboundChar = await service.getCharacteristic(INBOUND_CHAR_UUID);
    outboundChar = await service.getCharacteristic(OUTBOUND_CHAR_UUID);
    const flowcontrolChar = await service.getCharacteristic(CNTRL_CHAR_UUID);
    await flowcontrolChar.startNotifications();
    flowcontrolChar.addEventListener("characteristicvaluechanged", incomingData);
    log(lang_map[81]); //log('Ready to communicate!\n');
    login_stage = 1;
    // sendATL('AT+AUTH=123321'); //--> BB: commented
    //sendATL('AT+AUTH=123654'); //--> BB: commented
    sendATL("AT+AUTH=000000"); //--> BB: commented
    button_press = 3;
  } catch (error) {
    log(lang_map[78] + error); //log('Failed: ' + error);
  }
}

// Send an AT command to the CodeLess BLE peer
async function sendAT(cmd) {
  CommandSent = cmd;
  if (cmd === "AT+PWRLVL") cmd_sent = "AT+PWRLVL";
  else if (cmd.includes("AT+PWRLVL=")) {
    cmd_sent = "AT+PWRLVL=";
    new_power_lvl = parseInt(cmd.slice(cmd.lastIndexOf("=") + 1));
  }
  // Display the command in the log
  if (cmd.includes("AT+SETA=")) {
    let pwd = cmd.substring(cmd.indexOf("=") + 1);
    let cmd1 = pwd.replace(/[0-9]/g, "*");
    log(" → AT+SETA=" + cmd1);
  } else if (cmd.includes("/ACCESS:")) {
    let pwd = cmd.substring(cmd.indexOf(":") + 1);
    let cmd1 = pwd.replace(/[0-9]/g, "*");
    log(" → /ACCESS:" + cmd1);
  } else if (
    cmd != "GET ECHO" &&
    cmd != "GET DATEM" &&
    cmd != "SENDPART1" &&
    cmd != "SENDPART2" &&
    cmd != "SENDPART3" &&
    !(isTraceOn == 1 && (cmd == "/P104" || cmd == "/P605"))
  ) {
    if (cmd_sent == "AT+PWRLVL" && power_init_query == 0) log(lang_map[82]); //log(' → Checking bluetooth power level');
    else log(" → " + cmd);
  }
  // Append an extra character as expected by CodeLess
  var commandToSend = cmd + "\0";
  try {
    let encoder = new TextEncoder("utf-8");
    // Send command via GATT Write request
    await inboundChar.writeValue(encoder.encode(commandToSend));
  } catch (error) {
    log(lang_map[78] + error); //log('Failed: ' + error);
  }
}

function send_command_check() {
  tids_trace_reset();
  log(lang_map[83]); //log(' → Sending command. Please wait...');
  if (document.getElementById("cmd").value == "AT+PT=0") {
    setTimeout(ptModeOFF1, 3000);
  } else if (document.getElementById("cmd").value.startsWith("AT")) {
    setTimeout(ptModeOFF1, 3000);
    setTimeout(sendcommand, 5000);
    setTimeout(ptModeON1, 7000);
    setTimeout(restart_trace_after_send, 9000);
  } else {
    setTimeout(sendcommand, 3000);
    setTimeout(restart_trace_after_send, 5000);
  }
}

// If enter key was pressed by user while editing, send command immediately
function wasEnter(elem) {
  if (event.key == "Enter") {
    if (login_stage >= 1) {
      isIgnore = 0;

      if (document.getElementById("cmd").value == "") {
        log(lang_map[66]); //log(" → Invalid param request");
        return;
      }

      if (login_stage == 4) {
        // log(" → Press Trace OFF to get params");
        // return;
        send_command_check();
      } else if (
        login_stage == 3 &&
        document.getElementById("cmd").value.startsWith("AT") &&
        document.getElementById("cmd").value != "AT+PT=0" &&
        document.getElementById("cmd").value != "AT+PT=1"
      ) {
        setTimeout(ptModeOFF1, 1000);
        setTimeout(sendcommand, 2000);
        setTimeout(ptModeON1, 3000);
      } else {
        if (connectionType === "serial") {
          sendTX(document.getElementById("cmd").value);
          CommandSent = "";
        } else {
          sendAT(document.getElementById("cmd").value);
        }
        button_press = 8;
      }
    } else {
      log(lang_map[65]); //log('No device connected!');
    }
  } else if (
    document.getElementById("cmd").value.includes("/ACCESS:") ||
    document.getElementById("cmd").value.includes("AT+SETA=")
  ) {
    document.getElementById("cmd").type = "password";
  } else {
    document.getElementById("cmd").type = "text";
  }
}

function writeBTrange() {
  sendAT("AT+PWRLVL=" + new_power_lvl);
}

function writedeviceName() {
  sendAT("AT+NAME=" + document.getElementById("deviceName-box").value);
}

function writePassword() {
  sendAT("AT+SETA=" + document.getElementById("pWord-box").value);
}

function ptLModeON() {
  sendATL("AT+PT=1");
}

function ptModeON() {
  sendAT("AT+PT=1");
  settings_msg_clear();
  if (button_press == 28) {
    document.getElementById("btndeviceName").style.background = "#33B34A"; //PULSAR GREEN
    button_press = 0;
  } else if (button_press == 29) {
    document.getElementById("btnpWord").style.background = "#33B34A"; //PULSAR GREEN
    button_press = 0;
  }
}

function ptModeON1() {
  sendAT("AT+PT=1");
  button_press = 8;
}

function sendcommand() {
  if (connectionType === "serial") {
    sendTX(document.getElementById("cmd").value);
    CommandSent = "";
  } else {
    sendAT(document.getElementById("cmd").value);
  }
  button_press = 8;
}

function restart_trace_after_send() {
  button_press = 10;
  trace_off();
}

function ptModeOFF() {
  sendAT("AT+PT=0");
  login_stage = 2;
}

function ptModeOFF1() {
  sendAT("AT+PT=0");
  login_stage = 2;
  button_press = 8;
}

// Function to set Bluetooth password
function set_bt_pwd() {
  document.getElementById("settings-message").innerHTML = lang_map[115]; //"Setting new Bluetooth password. Please wait...";
  document.getElementById("btnpWord").style.background = "#FFCE34"; //PULSAR YELLOW
  if (login_stage >= 3 && isDisconnecting == 0) {
    setTimeout(ptModeOFF, 1000); //sendAT('AT+PT=0');
    login_stage = 2; // back to the PT mode
    //document.getElementById('btn_mode').innerHTML ='NORMAL MODE';
  }
  setTimeout(writePassword, 2000);
  setTimeout(ptModeON, 3000);
}

// Creates an impromptu dialog with input request
var recon_pwd = {
  recon_pwd0: {
    title: lang_map[135], //"RECONFIRM PASSWORD",
    modal: true,
    html:
      '<label id="recon_msg1" name="recon_msg1">' +
      lang_map[136] +
      '</label> <input type="password" id="password" name="password" autocomplete="off" value="" style="font-size: 24pt; font-weight: 500; width:220px; height:65px;"><br />' +
      '<label id="recon_msg2" name="recon_msg2" span class="emphasized">' +
      lang_map[137] +
      "</label> <br />",
    buttons: { OK: 1 },
    //position: { container: 'h1', x: 200, y: 60, height: 400, width: 1000, arrow: 'tc' },
    position: { height: 400, width: 900 },
    submit: function (e, v, m, f) {
      if (v) {
        // console.log($("#password").val()); // Value entered in the password box
        if (document.getElementById("pWord-box").value == $("#password").val())
          // Password match
          set_bt_pwd();
        else alert(lang_map[86]); //alert("Passwords do not match!");
      }
    },
  },
};

function reconfirm_password() {
  // let reconfirm_pwd = prompt('Please reconfirm the password!');
  // if(reconfirm_pwd == document.getElementById("pWord-box").value)
  //   set_bt_pwd();
  // else
  //   alert('The passwords do not match!');
  // Added jquery-impromptu plugin
  //$.prompt(recon_pwd); // Disabled due to the reinitialisation required for language parameters (lang_map[135], lang_map[136] and lang_map[137]).
  // The below method requires the html to be info to be added before the impromptu element.
  $.prompt(
    '<label id="recon_msg1" name="recon_msg1">' +
      lang_map[136] +
      '</label> <input type="password" id="password" name="password" autocomplete="off" value="" style="font-size: 24pt; font-weight: 500; width:220px; height:65px;"><br />' +
      '<label id="recon_msg2" name="recon_msg2" span class="emphasized">' +
      lang_map[137] +
      "</label> <br />",
    {
      title: lang_map[135], //"RECONFIRM PASSWORD",
      modal: true,
      // html:'<label id="recon_msg1" name="recon_msg1">' + lang_map[136] + '</label> <input type="password" id="password" name="password" autocomplete="off" value="" style="font-size: 24pt; font-weight: 500; width:220px; height:65px;"><br />' +
      //     '<label id="recon_msg2" name="recon_msg2" span class="emphasized">' + lang_map[137] + '</label> <br />',
      buttons: { OK: 1 },
      //position: { container: 'h1', x: 200, y: 60, height: 400, width: 1000, arrow: 'tc' },
      position: { height: 400, width: 900 },
      submit: function (e, v, m, f) {
        if (v) {
          // console.log($("#password").val()); // Value entered in the password box
          if (document.getElementById("pWord-box").value == $("#password").val())
            // Password match
            set_bt_pwd();
          else alert(lang_map[86]); //alert("Passwords do not match!");
        }
      },
    }
  );
}

function bluetooth_param_check() {
  if (login_stage >= 2 && isDisconnecting == 0) {
    tids_trace_reset();
    isIgnore = 0;
    var alphanumericPattern = /^[A-za-z0-9]+$/; // alphanumericPattern to poll the Input String
    switch (button_press) {
      case 28:
        if (document.getElementById("deviceName-box").value == "") {
          alert(lang_map[87]); //alert('Device Name is empty!');
          settings_msg_clear();
        } else {
          if (document.getElementById("deviceName-box").value.length > 4) {
            alert(lang_map[88]); //alert('Device Name can only have a maximum of 4 alphanumeric characters!');
            settings_msg_clear();
          } else if (!alphanumericPattern.test(document.getElementById("deviceName-box").value)) {
            alert(lang_map[145]); // alert(Please enter A-Z,a-z,0-9! Device Name can not contain special characters!)
            settings_msg_clear();
          } else {
            document.getElementById("settings-message").innerHTML = lang_map[144]; //"Setting new Bluetooth device name. Please wait...";
            document.getElementById("btndeviceName").style.background = "#FFCE34"; //PULSAR YELLOW
            if (login_stage >= 3 && isDisconnecting == 0) {
              setTimeout(ptModeOFF, 1000); //sendAT('AT+PT=0');
              login_stage = 2; // back to the PT mode
              //document.getElementById('btn_mode').innerHTML ='NORMAL MODE';
            }
            setTimeout(writedeviceName, 2000);
            setTimeout(ptModeON, 3000);
          }
        }
        break;
      case 29:
        if (document.getElementById("pWord-box").value == "") {
          alert(lang_map[89]); //alert('Password is empty');
          settings_msg_clear();
        } else {
          if (/^\d+$/.test(document.getElementById("pWord-box").value)) {
            if (document.getElementById("pWord-box").value.length > 6) {
              alert(lang_map[90]); //alert('Password can only have a maximum of 6 numeric characters!');
              settings_msg_clear();
            } else {
              reconfirm_password();
              // document.getElementById("settings-message").innerHTML = "Setting new Bluetooth password. Please wait...";
              // document.getElementById("btnpWord").style.background = '#FFCE34';   //PULSAR YELLOW
              // if((login_stage >= 3) && (isDisconnecting == 0)) {
              //   setTimeout(ptModeOFF, 1000);//sendAT('AT+PT=0');
              //   login_stage = 2; // back to the PT mode
              //   //document.getElementById('btn_mode').innerHTML ='NORMAL MODE';
              // }
              // setTimeout(writePassword, 2000);
              // setTimeout(ptModeON, 3000);
            }
          } else {
            alert(lang_map[91]); //alert('Password should only contain numeric characters!');
            settings_msg_clear();
          }
        }
        break;
      default:
        break;
    }
  } else {
    //log('No device connected!');
    alert(lang_map[65]); //alert('No device connected!');
  }
}

// If enter key was pressed by user while editing the bluetooth parameters, send command immediately
function wasEnter3(elem) {
  if (event.key == "Enter") {
    bluetooth_param_check();
  }
}

function settings_msg_clear() {
  document.getElementById("settings-message").innerHTML = "";
}

function trace_msg_clear() {
  document.getElementById("trace-message").innerHTML = "";
  document.getElementById("home-message").innerHTML = "";
}

// Check and decide the parameter recall for selected number of parameters
function param_check() {
  let list_value;
  if (login_stage >= 3 && isDisconnecting == 0) {
    tids_trace_reset();
    isIgnore = 0;
    document.getElementById("settings-message").innerHTML = lang_map[116]; //"Acquiring RADAR Parameters. Please wait...";
    switch (button_press) {
      case 19:
        document.getElementById("btnp241").style.background = "#FFCE34"; //PULSAR YELLOW
        list_value = document.getElementById("p241List").value; // Checking list value rather than list selected index
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P241");
          } else {
            sendAT("/P241");
          }
          document.getElementById("settings-message").innerHTML = lang_map[105]; //"Querying P241. Please wait...";
          CommandSent = "";
        } else {
          list_value--;
          if (connectionType === "serial") {
            sendTX("/P241:" + list_value.toString());
          } else {
            sendAT("/P241:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[117]; //"Updating P241. Please wait...";
          CommandSent = "";
        }
        break;
      case 20:
        document.getElementById("btnp100").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p100-box").value == "")
        list_value = document.getElementById("p100List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P100");
          } else {
            sendAT("/P100");
          }
          document.getElementById("settings-message").innerHTML = lang_map[106]; //"Querying P100. Please wait...";
        } else {
          //sendAT('/P100:'+ document.getElementById("p100-box").value);
          if (connectionType === "serial") {
            sendTX("/P100:" + list_value.toString());
          } else {
            sendAT("/P100:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[118]; //"Updating P100. Please wait...";
          CommandSent = "";
        }
        //document.getElementById("p100-box").value = "";
        break;
      case 21:
        document.getElementById("btnp104").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p104-box").value == "")
        list_value = document.getElementById("p104List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P104");
          } else {
            sendAT("/P104");
          }
          document.getElementById("settings-message").innerHTML = lang_map[107]; //"Querying P104. Please wait...";
        } else {
          //sendAT('/P104:'+ document.getElementById("p104-box").value);
          if (connectionType === "serial") {
            sendTX("/P104:" + list_value.toString());
          } else {
            sendAT("/P104:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[119]; //"Updating P104. Please wait...";
          CommandSent = "";
          p104_param_update = 1;
        }
        //document.getElementById("p104-box").value = "";
        break;
      case 22:
        document.getElementById("btnp105").style.background = "#FFCE34"; //PULSAR YELLOW
        if (document.getElementById("p105-box").value == "") {
          if (connectionType === "serial") {
            sendTX("/P105");
          } else {
            sendAT("/P105");
          }
          document.getElementById("settings-message").innerHTML = lang_map[108]; //"Querying P105. Please wait...";
        } else {
          if (connectionType === "serial") {
            sendTX("/P105:" + document.getElementById("p105-box").value);
          } else {
            sendAT("/P105:" + document.getElementById("p105-box").value);
          }
          document.getElementById("settings-message").innerHTML = lang_map[120]; //"Updating P105. Please wait...";
          CommandSent = "";
        }
        document.getElementById("p105-box").value = "";
        break;
      case 23:
        document.getElementById("btnp106").style.background = "#FFCE34"; //PULSAR YELLOW
        if (document.getElementById("p106-box").value == "") {
          if (connectionType === "serial") {
            sendTX("/P106");
          } else {
            sendAT("/P106");
          }
          document.getElementById("settings-message").innerHTML = lang_map[109]; //"Querying P106. Please wait...";
        } else {
          if (connectionType === "serial") {
            sendTX("/P106:" + document.getElementById("p106-box").value);
          } else {
            sendAT("/P106:" + document.getElementById("p106-box").value);
          }
          document.getElementById("settings-message").innerHTML = lang_map[121]; //"Updating P106. Please wait...";
          CommandSent = "";
        }
        document.getElementById("p106-box").value = "";
        break;
      case 24:
        document.getElementById("btnp808").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p808-box").value == "")
        list_value = document.getElementById("p808List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P808");
          } else {
            sendAT("/P808");
          }
          document.getElementById("settings-message").innerHTML = lang_map[110]; //"Querying P808. Please wait...";
        } else {
          //sendAT('/P808:'+ document.getElementById("p808-box").value);
          if (connectionType === "serial") {
            sendTX("/P808:" + list_value.toString());
          } else {
            sendAT("/P808:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[122]; //"Updating P808. Please wait...";
          CommandSent = "";
        }
        //document.getElementById("p808-box").value = "";
        break;
      case 25:
        document.getElementById("btnp605").style.background = "#FFCE34"; //PULSAR YELLOW
        //if(document.getElementById("p605-box").value == "")
        list_value = document.getElementById("p605List").value;
        if (list_value == 0) {
          if (connectionType === "serial") {
            sendTX("/P605");
          } else {
            sendAT("/P605");
          }
          document.getElementById("settings-message").innerHTML = lang_map[111]; //"Querying P605. Please wait...";
        } else {
          //sendAT('/P605:'+ document.getElementById("p605-box").value);
          list_value--;
          if (connectionType === "serial") {
            sendTX("/P605:" + list_value.toString());
          } else {
            sendAT("/P605:" + list_value.toString());
          }
          document.getElementById("settings-message").innerHTML = lang_map[123]; //"Updating P605. Please wait...";
          CommandSent = "";
        }
        //document.getElementById("p605-box").value = "";
        break;
      case 26:
        document.getElementById("btnp21").style.background = "#FFCE34"; //PULSAR YELLOW
        if (document.getElementById("p21-box").value == "") {
          if (connectionType === "serial") {
            sendTX("/P21");
          } else {
            sendAT("/P21");
          }
          document.getElementById("settings-message").innerHTML = lang_map[112]; //"Querying P21. Please wait...";
        } else {
          if (connectionType === "serial") {
            sendTX("/P21:" + document.getElementById("p21-box").value);
          } else {
            sendAT("/P21:" + document.getElementById("p21-box").value);
          }
          document.getElementById("settings-message").innerHTML = lang_map[124]; //"Updating P21. Please wait...";
          CommandSent = "";
        }
        document.getElementById("p21-box").value = "";
        break;
      default:
        break;
    }
  } else {
    //log('Device not in Normal mode!');
    alert(lang_map[64]); //alert('Device not in Normal mode!');
  }
}

// If enter key was pressed by user while editing the parameters, send command immediately
function wasEnter2(elem) {
  if (event.key == "Enter") {
    param_check();
  }
}

function log_2(text) {
  //log("log:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting);

  var textarea = document.getElementById("log");
  if (textarea.value == "") textarea.value = text;
  else textarea.value += "\n" + text;
  textarea.scrollTop = textarea.scrollHeight;
}

// Display text in log field text area
function log(text) {
  // log_2("log:: login_stage="+login_stage+" isIgnore="+isIgnore+" isIgnore_2="+isIgnore_2+" isDisconnecting="+isDisconnecting+" isTerminated="+isTerminated);
  // log_2("");
  if (isIgnore_2 == 1 || isDisconnecting == 1 || isDisconnecting == 2 || isTerminated == 1) {
    if (isIgnore_2 == 1) isIgnore_2 = 0;
    // if(isTerminated==1) isTerminated=0;
    //log_2("log::size "+sizeof(text));
    // if(sizeof(text) > 100)  return;
  }

  var textarea = document.getElementById("log");
  if (textarea.value == "") textarea.value = text;
  else textarea.value += "\n" + text;
  textarea.scrollTop = textarea.scrollHeight;
}

// Clears text in log field text area
function clearlog() {
  var textarea = document.getElementById("log");
  textarea.value = "";
  textarea.scrollTop = textarea.scrollHeight;
}

function page_lang_switch() {
  var textarea1 = document.getElementById("data-log");
  textarea1.value = "";
  textarea1 = document.getElementById("data-log_t");
  textarea1.value = "";
  document.getElementById("id_title").innerHTML = lang_map[0];
  document.getElementById("id_home").innerHTML = lang_map[1];
  document.getElementById("id_trace").innerHTML = lang_map[2];
  document.getElementById("id_parameters").innerHTML = lang_map[3];
  document.getElementById("btnScan").innerHTML = lang_map[4];
  document.getElementById("btnEnd").innerHTML = lang_map[5];
  document.getElementById("data-log-label").innerHTML = lang_map[11];
  document.getElementById("parameters-label").innerHTML = lang_map[12];
  document.getElementById("level-label").innerHTML = lang_map[13];
  document.getElementById("distance-label").innerHTML = lang_map[14];
  document.getElementById("status-label").innerHTML = lang_map[15];
  document.getElementById("command-box-label").innerHTML = lang_map[16];
  document.getElementsByName("command-box")[0].placeholder = lang_map[103];
  document.getElementsByName("pswbox")[0].placeholder = lang_map[142];
  document.getElementById("btnSend").innerHTML = lang_map[6];
  document.getElementById("btnClear").innerHTML = lang_map[7];
  document.getElementById("lang_select").innerHTML = lang_map[138];
  document.getElementsByName("lang_select_dropdown")[0].options[0].innerHTML = lang_map[139];
  document.getElementsByName("lang_select_dropdown")[0].options[1].innerHTML = lang_map[140];
  document.getElementsByName("lang_select_dropdown")[0].options[2].innerHTML = lang_map[141];
  document.getElementById("btn_trace").innerHTML = lang_map[8];
  document.getElementById("parameters-label-t").innerHTML = lang_map[12];
  document.getElementById("level-label-t").innerHTML = lang_map[13];
  document.getElementById("distance-label-t").innerHTML = lang_map[14];
  document.getElementById("status-label-t").innerHTML = lang_map[15];
  document.getElementById("btndeviceName").innerHTML = lang_map[10];
  document.getElementById("btnpWord").innerHTML = lang_map[10];
  document.getElementById("btnp241").innerHTML = lang_map[10];
  document.getElementById("btnp100").innerHTML = lang_map[10];
  document.getElementById("btnp104").innerHTML = lang_map[10];
  document.getElementById("btnp105").innerHTML = lang_map[10];
  document.getElementById("btnp106").innerHTML = lang_map[10];
  document.getElementById("btnp808").innerHTML = lang_map[10];
  document.getElementById("btnp605").innerHTML = lang_map[10];
  document.getElementById("btnp21").innerHTML = lang_map[10];
  document.getElementById("bluetooth-parameters-label").innerHTML = lang_map[17];
  document.getElementById("bt-range-label1").innerHTML = lang_map[18];
  document.getElementById("deviceName").innerHTML = lang_map[19];
  document.getElementById("pWord").innerHTML = lang_map[20];
  document.getElementById("radar-parameters-label").innerHTML = lang_map[21];
  document.getElementById("p241").innerHTML = lang_map[22];
  document.getElementById("p100").innerHTML = lang_map[23];
  document.getElementById("p104").innerHTML = lang_map[24];
  document.getElementById("p105").innerHTML = lang_map[25];
  document.getElementById("p106").innerHTML = lang_map[26];
  document.getElementById("p808").innerHTML = lang_map[27];
  document.getElementById("p605").innerHTML = lang_map[28];
  document.getElementById("p21").innerHTML = lang_map[29];
  document.getElementsByName("p241dropdown")[0].options[0].innerHTML = lang_map[30];
  document.getElementsByName("p241dropdown")[0].options[1].innerHTML = lang_map[31];
  document.getElementsByName("p241dropdown")[0].options[2].innerHTML = lang_map[32];
  document.getElementsByName("p241dropdown")[0].options[3].innerHTML = lang_map[33];
  // document.getElementsByName('p241dropdown')[0].options[4].innerHTML = lang.p241_dropdown_4;
  document.getElementsByName("p241dropdown")[0].options[4].innerHTML = lang_map[34];
  document.getElementsByName("p241dropdown")[0].options[5].innerHTML = lang_map[35];
  // document.getElementsByName('p241dropdown')[0].options[7].innerHTML = lang.p241_dropdown_7;
  document.getElementsByName("p241dropdown")[0].options[6].innerHTML = lang_map[36];
  document.getElementsByName("p100dropdown")[0].options[0].innerHTML = lang_map[37];
  document.getElementsByName("p100dropdown")[0].options[1].innerHTML = lang_map[38];
  document.getElementsByName("p100dropdown")[0].options[2].innerHTML = lang_map[39];
  document.getElementsByName("p100dropdown")[0].options[3].innerHTML = lang_map[40];
  document.getElementsByName("p100dropdown")[0].options[4].innerHTML = lang_map[41];
  document.getElementsByName("p104dropdown")[0].options[0].innerHTML = lang_map[42];
  document.getElementsByName("p104dropdown")[0].options[1].innerHTML = lang_map[43];
  document.getElementsByName("p104dropdown")[0].options[2].innerHTML = lang_map[44];
  document.getElementsByName("p104dropdown")[0].options[3].innerHTML = lang_map[45];
  document.getElementsByName("p104dropdown")[0].options[4].innerHTML = lang_map[46];
  document.getElementsByName("p104dropdown")[0].options[5].innerHTML = lang_map[47];
  document.getElementsByName("p808dropdown")[0].options[0].innerHTML = lang_map[48];
  document.getElementsByName("p808dropdown")[0].options[1].innerHTML = lang_map[49];
  document.getElementsByName("p808dropdown")[0].options[2].innerHTML = lang_map[50];
  document.getElementsByName("p808dropdown")[0].options[3].innerHTML = lang_map[51];
  document.getElementsByName("p808dropdown")[0].options[4].innerHTML = lang_map[52];
  document.getElementsByName("p808dropdown")[0].options[5].innerHTML = lang_map[53];
  document.getElementsByName("p605dropdown")[0].options[0].innerHTML = lang_map[54];
  document.getElementsByName("p605dropdown")[0].options[1].innerHTML = lang_map[55];
  document.getElementsByName("p605dropdown")[0].options[2].innerHTML = lang_map[56];
  document.getElementsByName("p605dropdown")[0].options[3].innerHTML = lang_map[57];
  document.getElementsByName("p605dropdown")[0].options[4].innerHTML = lang_map[58];
  document.getElementsByName("p605dropdown")[0].options[5].innerHTML = lang_map[59];
  document.getElementsByName("p605dropdown")[0].options[6].innerHTML = lang_map[60];
  document.getElementsByName("p605dropdown")[0].options[7].innerHTML = lang_map[61];
  document.getElementsByName("p605dropdown")[0].options[8].innerHTML = lang_map[62];
  document.getElementsByName("p605dropdown")[0].options[9].innerHTML = lang_map[63];
  clearlog();
  save_curr_lang();
}

addLanguageScript = function (lang) {
  var head = document.getElementsByTagName("head")[0],
    script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "js/lang." + lang + ".js";
  head.appendChild(script);
};

function save_curr_lang() {
  localStorage.setItem("lang_select_List", document.getElementById("lang_select_List").value);
  // console.log(document.getElementById('lang_select_List').value);
}

function lang_switch() {
  let list_value;
  var scriptTag;
  var head;
  var script;
  var el = document.createElement("script");
  list_value = document.getElementById("lang_select_List").value; // Checking list value rather than list selected index
  if (list_value == 1) {
    // $("script[src='js/lang.de.js']").remove();
    // addLanguageScript('en');

    // alert("English");

    // scriptTag = document.createElement('script');
    // scriptTag.setAttribute('src','js/lang.en.js');
    // document.head.appendChild(scriptTag);

    // head= document.getElementsByTagName('head')[0];
    // script= document.createElement('script');
    // script.src= 'js/lang.en.js';
    // head.appendChild(script);

    // el.src = "js/lang.en.js";
    // document.body.appendChild(el);

    el.setAttribute("src", "js/lang.en.js");
    document.head.appendChild(el);

    page_lang_switch();
    //alert(list_value);
  } else if (list_value == 2) {
    // $("script[src='js/lang.en.js']").remove();
    // addLanguageScript('de');

    // alert("German");

    // scriptTag = document.createElement('script');
    // scriptTag.setAttribute('src','js/lang.de.js');
    // document.head.appendChild(scriptTag);

    // head= document.getElementsByTagName('head')[0];
    // script= document.createElement('script');
    // script.src= 'js/lang.de.js';
    // head.appendChild(script);

    // el.src = "js/lang.de.js";
    // document.body.appendChild(el);

    el.setAttribute("src", "js/lang.de.js");
    document.head.appendChild(el);

    page_lang_switch();
    //alert(list_value);
  }
}

function lang_array_switch() {
  let list_value;
  list_value = document.getElementById("lang_select_List").value; // Checking list value rather than list selected index
  if (list_value == 2) lang_map = lang_array.map((a) => a.German);
  // Default selection
  else lang_map = lang_array.map((a) => a.English);
  page_lang_switch();
  // console.log(lang_map[1]);
}
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let os = "Unknown OS";
  if (userAgent.indexOf("Win") != -1) os = "Windows";
  if (userAgent.indexOf("Mac") != -1) os = "MacOS";
  if (userAgent.indexOf("X11") != -1) os = "UNIX";
  if (userAgent.indexOf("Linux") != -1) os = "Linux";
  const browser = navigator.userAgent;
  const deviceInfo = `OS: ${os}, Browser: ${browser}`;
}
function table_update(parsedData) {
  document.getElementById("myTable").style.display = "block";
  var tableBody = document.getElementById("tableBody");

  // Clear existing rows
  tableBody.innerHTML = "";

  for (var i = 0; i < parsedData.length; i++) {
    var row = tableBody.insertRow();

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    cell1.textContent = parsedData[i].parameter;
    cell2.textContent = parsedData[i].value;

    // Applying styles to cells programmatically
    row.style.borderTop = "1px solid black";
    row.style.borderBottom = "1px solid black";

    const cells = [cell1, cell2];
    cells.forEach((cell) => {
      cell.style.borderRight = "1px solid black";
      cell.style.textAlign = "center";
      cell.style.fontFamily = "'Segoe UI SemiBold'";
      cell.style.fontSize = "24pt";
      cell.style.fontWeight = "500";
      cell.style.width = "431px";
      cell.style.height = "80px";
    });
  }
}

// Function to get data from a file
async function openXML() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".xml"; // Accept only XML files
  fileInput.onchange = async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const filereader = new FileReader();
    filereader.onload = async function (e) {
      xml_loaded = true;
      const xmlString = e.target.result;
      const parsedData = parseXML(xmlString);
      document.getElementById("next-arrow").style.display = "block";
      table_update(parsedData);
      const firstSet = createUint8Array(parsedData, 0, 60); // First 60 parameters
      const secondSet = createUint8Array(parsedData, 60, 60); // Second 60 parameters
      const remainingSet = createUint8Array(parsedData, 120, 37); // Remaining parameters up to 157

      combined_firstSet = concatenateStringAndUint8Array("/SET1(60):", firstSet);
      combined_secondSet = concatenateStringAndUint8Array("/SET2(60):", secondSet);
      combined_remainingSet = concatenateStringAndUint8Array("/SET3(37):", remainingSet);
    };
    filereader.readAsText(file);
  };
  fileInput.click(); // Click the file input programmatically
}

function concatenateStringAndUint8Array(string, byteArray) {
  // Encode the string to Uint8Array
  const stringEncoded = new TextEncoder().encode(string);
  // Create a new Uint8Array to hold the concatenated result
  const combinedArray = new Uint8Array(stringEncoded.length + byteArray.length);
  // Set the encoded string in the new array
  combinedArray.set(stringEncoded, 0);
  // Set the byteArray after the encoded string
  combinedArray.set(byteArray, stringEncoded.length);
  return combinedArray;
}

async function send_paramset() {
  try {
    await sendTX(combined_firstSet, true);
    CommandSent = "";
  } catch (error) {
    console.error("Error sending data:", error);
    log("Error sending data. Please check the connection and try again.");
  }
}

function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const parametersList = xmlDoc.getElementsByTagName("Parameters");
  parsedData = [];
  const indexSet = new Set();

  for (let i = 0; i < parametersList.length; i++) {
    const parameters = parametersList[i];
    const index = parameters.getElementsByTagName("Index")[0].textContent;
    if (indexSet.has(index)) {
      continue; // Skip if index already exists
    }
    const parameter = parameters.getElementsByTagName("Parameter")[0].textContent;
    const value = parameters.getElementsByTagName("Value")[0].textContent;
    const floatValueHex = floatToBigEndianHex(value);

    // Convert float to uint8 array
    const floatArray = new Float32Array(1);
    floatArray[0] = value;
    const uintArray = new Uint8Array(floatArray.buffer).reverse();

    // Push parsed data into array
    parsedData.push({
      index,
      parameter,
      value,
      floatValueHex,
      uint8Array: Array.from(uintArray), // Store the uint8 array
    });

    indexSet.add(index); // Add index to set to track uniqueness
  }
  return parsedData;
}

function floatToBigEndianHex(value) {
  const floatArray = new Float32Array(1);
  floatArray[0] = value;
  const uintArray = new Uint8Array(floatArray.buffer);

  // Reverse byte order to convert to big endian
  const reversedBytes = uintArray.reverse();

  return Array.from(reversedBytes, (byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join("");
}
// Function to create Uint8Array of a set of values
function createUint8Array(parsedData, start, count) {
  const length = Math.min(count, parsedData.length - start) * 4; // Each float is 4 bytes
  const uint8Array = new Uint8Array(length); // Create a Uint8Array with appropriate length
  let currentIndex = 0;

  for (let i = start; i < start + count && i < parsedData.length; i++) {
    const data = parsedData[i];
    const uintArray = data.uint8Array;

    for (let j = 0; j < uintArray.length; j++) {
      uint8Array[currentIndex++] = uintArray[j];
    }
  }

  return uint8Array;
}
// Function to edit XML data and save to a file
function edit_XML() {
  if (!xml_loaded) {
    return;
  }
  parsedData = parsedData.map((data) => {
    return {
      ...data,
      value: Number(data.value) + 1, // Add 1 to each value
    };
  });
  saveXML();
}
// Function to convert parsed data back to XML string
function convertDataToXML(parsedData) {
  let xmlString = '<?xml version="1.0" encoding="UTF-8"?><Root>';

  parsedData.forEach((data) => {
    xmlString += `
                    <Parameters>
                        <Index>${data.index}</Index>
                        <Parameter>${data.parameter}</Parameter>
                        <Value>${data.value}</Value>
                    </Parameters>
                `;
  });

  xmlString += "</Root>";
  return xmlString;
}
// Function to save XML data to a file
function saveXML() {
  xmlString = convertDataToXML(parsedData);
  const blob = new Blob([xmlString], { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "edited_data.xml";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
// function displayContent(contentId) {
//   const sections = document.querySelectorAll(".content-section");
//   sections.forEach((section) => {
//     section.classList.remove("accordion-active");
//   });
//   document.getElementById(contentId).classList.add("accordion-active");
// }

function checkSerialSupport() {
  if (!("serial" in navigator)) {
    //document.getElementById("connectionImage").style.visibility = "hidden";
    //document.getElementById("connectionImage").style.visibility = "hidden";
    //var tab = document.querySelector('.accordion-item[data-actab-group="0"][data-actab-id="1"]');
    //tab.style.display = 'none';
    document.getElementById("connectionImage").style.cursor = "default"; //set the toggle button to be default cursor
    document.getElementById("connectionImage").onmouseover = "default";
    document.getElementById("connectionImage").onmouseleave = "default";
    document.getElementById("connectionImage").title = "";
    alert("Web Serial API not supported in this browser. Please use a compatible browser.");
  }
}

document.addEventListener("DOMContentLoaded", function () //this is what happens as soon as the page loads
{
  getDeviceInfo();
  checkSerialSupport();
  document.getElementById("myTable").style.display = "none";
  connectionType = localStorage.getItem("connectionType");
  if ("serial" in navigator && connectionType === "serial") {
    document.getElementById("connectionImage").src = "img/usb-disconnected.svg";
    document.getElementById("connectionImage").style.display = "block";
    document.getElementById("bt_range").style.display = "none";
    document.getElementById("reflecte_devinfo").style.display = "block";
  } else {
    connectionType = "bluetooth";
    document.getElementById("connectionImage").src = "img/bluetooth-disabled.svg";
    document.getElementById("connectionImage").style.display = "block";
    document.getElementById("bt_range").style.display = "block";
    document.getElementById("reflecte_devinfo").style.display = "none";
  }
  //document.getElementById('reflecte_devinfo').style.display= "none";
});

function myLoadFunction() {
  log(lang_map[84]); //log("Click on 'Device scan' to scan");
}

function search(ele) {
  if (event.key === "Enter") {
    //alert(ele.value);
    event.preventDefault();
    document.getElementById("btnLogin").click();
  }
}

function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function sendLoginCmd() {
  //alert("sendLoginCmd"+'AT+AUTH='+document.getElementById("pswbox").value);
  sendATL("AT+AUTH=" + document.getElementById("pswbox").value);
}
function closeForm2() {
  document.getElementById("lblpsw").innerHTML = "";
  document.getElementById("lblpsw").style.color = "black";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}
function updateState(cur_state) {
  // log(cur_state);
  presysState = sysState;
  sysState = cur_state;
}

currentlang = localStorage.getItem("lang_select_List");
if (currentlang == 2) lang_map = lang_array.map((a) => a.German);
// Default selection
else lang_map = lang_array.map((a) => a.English);

document.getElementById("id_home").innerHTML = lang_map[1];
document.getElementById("id_trace").innerHTML = lang_map[2];
document.getElementById("id_parameters").innerHTML = lang_map[3];

document.getElementById("btnScan").innerHTML = lang_map[4];
document.getElementById("btnEnd").innerHTML = lang_map[5];
document.getElementById("data-log-label").innerHTML = lang_map[11];
document.getElementById("parameters-label").innerHTML = lang_map[12];
document.getElementById("level-label").innerHTML = lang_map[13];
document.getElementById("distance-label").innerHTML = lang_map[14];
document.getElementById("status-label").innerHTML = lang_map[15];
document.getElementById("command-box-label").innerHTML = lang_map[16];
document.getElementsByName("command-box")[0].placeholder = lang_map[103];
document.getElementById("btnSend").innerHTML = lang_map[6];
document.getElementById("btnClear").innerHTML = lang_map[7];
document.getElementById("lang_select").innerHTML = lang_map[138];
document.getElementsByName("lang_select_dropdown")[0].options[0].innerHTML = lang_map[139];
document.getElementsByName("lang_select_dropdown")[0].options[1].innerHTML = lang_map[140];
document.getElementsByName("lang_select_dropdown")[0].options[2].innerHTML = lang_map[141];
if (currentlang != null) document.getElementById("lang_select_List").value = currentlang;

// X points/labels
var xdata = [];
var pts = 0.5; //0.036;//7.2/200;
xdata[0] = 0.0;
for (let i = 1; i <= 200; i++) {
  xdata[i] = Math.round((xdata[i - 1] + 0.036) * 1000) / 1000;
}
// Zooming out does not work if labels are numbers
for (let i = 0; i <= 200; i++) {
  xdata[i] = xdata[i].toString();
}

// Echo variables
var echo = [];

// Datem variables
var datem = [];
for (let i = 0; i < 200; i++) {
  echo[i] = 0;
  datem[i] = 0;
}
// setup block
var data = {
  labels: xdata,
  datasets: [
    {
      type: "line",
      label: "DATEM", // Datem array
      data: datem,
      radius: 1,
      pointRadius: 1,
      borderWidth: 2,
      backgroundColor: "rgba(75, 119, 190, 1)",
      borderColor: "rgba(75, 119, 190, 1)",
    },
    {
      type: "line",
      label: "Echo", // Echo array
      data: echo,
      radius: 1,
      pointRadius: 1,
      borderWidth: 2,
      backgroundColor: "rgba(255, 0, 0, 1)",
      borderColor: "rgba(255, 0, 0, 1)",
    },
  ],
};

// arbitraryLine Plugin
var arbitraryLine = {
  // Fills near & far blanking areas, Plots Distance, gate start and stop. Shows dynamic variables
  id: "arbitraryLine",
  beforeDraw(chart, args, options) {
    const ctx = chart.canvas.getContext("2d");
    var {
      ctr,
      chartArea: { top, right, bottom, left, width, height },
      scales: { x, y },
    } = chart;
    ctx.save();
    //alert("Near = " + near_blanking_var + ", Far = " + far_blanking_dist + ", Empty = " + empty_distance + ", Compensated = " + compensated_var + ", Mode = " + mode_var);
    ctx.fillStyle = "yellow";
    //ctx.fillRect(x.getPixelForValue(0), top, near_blanking_var*width/compensated_var, height); // Near blanking area (x.getPixelForValue(0), top, 0.3*width/7.2, height)
    start_point = Math.max(x.getPixelForValue(0), left);
    width_val = Math.max(x.getPixelForValue((near_blanking_var * width) / compensated_var), left) - start_point;
    ctx.fillRect(start_point, top, width_val, height); // Near blanking area

    //console.log(start_point + ", " + near_blanking_var*width/compensated_var + ", " + width_val);

    ctx.fillStyle = "#EFFFE8";
    //ctx.fillRect(x.getPixelForValue((200.0/1.2)*(empty_distance - span_val)/mode_var), top, span_val*width/compensated_var, height); // Span
    start_point = Math.max(
      x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * (empty_distance - span_val)) / mode_var),
      left
    );
    width_val =
      Math.max(x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * empty_distance) / mode_var), left) -
      start_point;
    ctx.fillRect(start_point, top, width_val, height); // Span

    ctx.fillStyle = "yellow";
    start_point = Math.max(
      x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * empty_distance) / mode_var),
      left
    );
    width_val =
      Math.max(x.getPixelForValue(((200.0 / ((100.0 + far_blanking_var) / 100.0)) * far_blanking_dist) / mode_var), left) -
      start_point;
    ctx.fillRect(start_point, top, width_val, height); // Far blanking area

    if (
      Math.max(x.getPixelForValue((distance_var * 200) / compensated_var), left) <=
      x.getPixelForValue((distance_var * 200) / compensated_var)
    ) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(x.getPixelForValue((distance_var * 200) / compensated_var), top, 0, height); // Distance//(x0, y0, x1, y1); (x.getPixelForValue(distance_var*200/7.2), top, 0, height)
    }
    if (Math.max(x.getPixelForValue(gate_start / 5), left) <= x.getPixelForValue(gate_start / 5)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(x.getPixelForValue(gate_start / 5), top, 0, height); // Gate start (x.getPixelForValue((distance_var - 0.20)*200/7.2), top, 0, height)
    }
    if (Math.max(x.getPixelForValue(gate_stop / 5), left) <= x.getPixelForValue(gate_stop / 5)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(x.getPixelForValue(gate_stop / 5), top, 0, height); // Gate stop (x.getPixelForValue((distance_var + 0.20)*200/7.2), top, 0, height)
    }
    data_log_update();
    ctx.restore();
  },
};

const plugin = {
  // For white background plot
  id: "custom_canvas_background_color",
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "White"; //'Transparent';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

var valtest = Math.round((0.5 * 200) / compensated_var_m); //7.2);
var rounding;

// config block
var config = {
  type: "line",
  data: data,
  options: {
    plugins: {
      legend: {
        labels: {
          // This more specific font property overrides the global property
          font: {
            size: 24,
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            mode: "xy",
          },
          pinch: {
            enabled: true,
            mode: "xy",
          },
          drag: {
            enabled: true,
            mode: "y",
          },
          // mode: "x",
          speed: 0.1,
          threshold: 10,
          sensitivity: 3,
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
        limits: {
          y: { minRange: 200, min: 0, max: 1000 /*, minRange: 100*/ },
          x: { minRange: 20, min: 0, max: xdata.length /*, minRange: 1000*/ },
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        //type: 'linear',
        title: {
          display: true,
          text: p104_units, //'mtrs',
          font: {
            size: 24,
          },
        },
        grid: {},
        ticks: {
          maxTicksLimit: xdata.length,
          // For a category axis, the val is the index so the lookup via getLabelForValue is needed
          callback: function (val, index) {
            // Hide the label of every 14th dataset
            rounding = Math.round(this.getLabelForValue(val) * 100) / 100; // Rounded precision
            if (index == 0) return index % valtest === 0 ? rounding.toFixed(1) : undefined;
            else return (index + 1) % valtest === 0 ? rounding.toFixed(1) : undefined; // Shows rounded value in Xaxis aling with gridline,
          }, // undefined don't shows gridlines
          maxRotation: 90, // Rotate the tick labels to show horizontally
          font: {
            size: 24,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "mV",
          font: {
            size: 24,
          },
        },
        max: 1000,
        min: 0,
        ticks: {
          callback: function (value) {
            // if (Math.floor(value) === value) {
            //   return value
            // }
            return Math.floor(value);
          },
          stepSize: 100,
          font: {
            size: 24,
          },
        },
        beginAtZero: true,
      },
    },
  },
  plugins: [plugin, arbitraryLine], // Uses both plugins
};

var myChart = new Chart(document.getElementById("myChart"), config);
document.getElementById("btn_trace").innerHTML = lang_map[8];
document.getElementById("parameters-label-t").innerHTML = lang_map[12];
document.getElementById("level-label-t").innerHTML = lang_map[13];
document.getElementById("distance-label-t").innerHTML = lang_map[14];
document.getElementById("status-label-t").innerHTML = lang_map[15];
document.getElementById("btndeviceName").innerHTML = lang_map[10];
document.getElementById("btnpWord").innerHTML = lang_map[10];
document.getElementById("btnp241").innerHTML = lang_map[10];
document.getElementById("btnp100").innerHTML = lang_map[10];
document.getElementById("btnp104").innerHTML = lang_map[10];
document.getElementById("btnp105").innerHTML = lang_map[10];
document.getElementById("btnp106").innerHTML = lang_map[10];
document.getElementById("btnp808").innerHTML = lang_map[10];
document.getElementById("btnp605").innerHTML = lang_map[10];
document.getElementById("btnp21").innerHTML = lang_map[10];
document.getElementById("bluetooth-parameters-label").innerHTML = lang_map[17];
document.getElementById("bt-range-label1").innerHTML = lang_map[18];
document.getElementById("deviceName").innerHTML = lang_map[19];
document.getElementById("pWord").innerHTML = lang_map[20];
document.getElementById("radar-parameters-label").innerHTML = lang_map[21];
document.getElementById("p241").innerHTML = lang_map[22];
document.getElementById("p100").innerHTML = lang_map[23];
document.getElementById("p104").innerHTML = lang_map[24];
document.getElementById("p105").innerHTML = lang_map[25];
document.getElementById("p106").innerHTML = lang_map[26];
document.getElementById("p808").innerHTML = lang_map[27];
document.getElementById("p605").innerHTML = lang_map[28];
document.getElementById("p21").innerHTML = lang_map[29];
document.getElementsByName("p241dropdown")[0].options[0].innerHTML = lang_map[30];
document.getElementsByName("p241dropdown")[0].options[1].innerHTML = lang_map[31];
document.getElementsByName("p241dropdown")[0].options[2].innerHTML = lang_map[32];
document.getElementsByName("p241dropdown")[0].options[3].innerHTML = lang_map[33];
document.getElementsByName("p241dropdown")[0].options[4].innerHTML = lang_map[34];
document.getElementsByName("p241dropdown")[0].options[5].innerHTML = lang_map[35];
document.getElementsByName("p241dropdown")[0].options[6].innerHTML = lang_map[36];
document.getElementsByName("p100dropdown")[0].options[0].innerHTML = lang_map[37];
document.getElementsByName("p100dropdown")[0].options[1].innerHTML = lang_map[38];
document.getElementsByName("p100dropdown")[0].options[2].innerHTML = lang_map[39];
document.getElementsByName("p100dropdown")[0].options[3].innerHTML = lang_map[40];
document.getElementsByName("p100dropdown")[0].options[4].innerHTML = lang_map[41];
document.getElementsByName("p104dropdown")[0].options[0].innerHTML = lang_map[42];
document.getElementsByName("p104dropdown")[0].options[1].innerHTML = lang_map[43];
document.getElementsByName("p104dropdown")[0].options[2].innerHTML = lang_map[44];
document.getElementsByName("p104dropdown")[0].options[3].innerHTML = lang_map[45];
document.getElementsByName("p104dropdown")[0].options[4].innerHTML = lang_map[46];
document.getElementsByName("p104dropdown")[0].options[5].innerHTML = lang_map[47];
document.getElementsByName("p808dropdown")[0].options[0].innerHTML = lang_map[48];
document.getElementsByName("p808dropdown")[0].options[1].innerHTML = lang_map[49];
document.getElementsByName("p808dropdown")[0].options[2].innerHTML = lang_map[50];
document.getElementsByName("p808dropdown")[0].options[3].innerHTML = lang_map[51];
document.getElementsByName("p808dropdown")[0].options[4].innerHTML = lang_map[52];
document.getElementsByName("p808dropdown")[0].options[5].innerHTML = lang_map[53];
document.getElementsByName("p605dropdown")[0].options[0].innerHTML = lang_map[54];
document.getElementsByName("p605dropdown")[0].options[1].innerHTML = lang_map[55];
document.getElementsByName("p605dropdown")[0].options[2].innerHTML = lang_map[56];
document.getElementsByName("p605dropdown")[0].options[3].innerHTML = lang_map[57];
document.getElementsByName("p605dropdown")[0].options[4].innerHTML = lang_map[58];
document.getElementsByName("p605dropdown")[0].options[5].innerHTML = lang_map[59];
document.getElementsByName("p605dropdown")[0].options[6].innerHTML = lang_map[60];
document.getElementsByName("p605dropdown")[0].options[7].innerHTML = lang_map[61];
document.getElementsByName("p605dropdown")[0].options[8].innerHTML = lang_map[62];
document.getElementsByName("p605dropdown")[0].options[9].innerHTML = lang_map[63];
