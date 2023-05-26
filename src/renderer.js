let deleteFlag = false;
let muteFlag = false;
const deleteSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="deleteIcon"><use xlink:href="./res/bootstrap-icons.svg#trash"/></svg>';
import { Soundboard } from './soundboard.js';
// soundData is JSON fetched from ./res/soundData.json
const soundData = [];
// catData is JSON feteched from ./res/catData.json
const catData = [];
// soundboard object
let soundboard;
// sound Option lists for selecting a sound
const soundOptList = [];

window.addEventListener('DOMContentLoaded', async () => {
  //localStorage.removeItem('init') // clears out initialization variable for debugging
  //if 'init' is not set in local storage, initialize.
  if (localStorage.getItem('init') != 'true') {
    initialize();
  }
  
  soundboard = new Soundboard();
  // setting up data (used to create option lists for sound selection)
  soundData.push(...await window.Messenger.invokeMsg('invoke:fromRender', 'reqFileList'));
  catData.push(...await window.Messenger.invokeMsg('invoke:fromRender', 'reqCatList'));
  // setting up listener for messages from main
  window.Messenger.receiveMsg('message:toRender', Receiver);
  document.getElementById('volSlider').value = soundboard.input('getVol') * 100;
  // set up buttons with callbacks and styling
  updateSoundBtns();
  // create option lists
  initOpts();
  // settings button handlers set here
  setSettingsHandlers();
});

// receiver of messages from main
const Receiver = (event, req, data) => {
  switch (req) {
    case 'play':// sent when global sound shortcut activated
        document.getElementById('btn' + data.toString()).click()
      break;
    default:
      console.log('Unknown request: ' + req);
      break;
  }
}

function toggleSetSound() {
  document.querySelectorAll('.setSound').forEach(element => {
    console.log(element);
    if (element.classList.contains('hidden')) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  });
}

// called when 'init' is not set in local storage. Initializes local data.
function initialize() {
  localStorage.setItem('init', 'true');
  // setting sound data object up and storing it
  localStorage.setItem('data', 
    JSON.stringify([
      {'sound': null}, {'sound': null}, {'sound': null}, {'sound': null},
      {'sound': null}, {'sound': null}, {'sound': null}, {'sound': null},
      {'sound': null}, {'sound': null}, {'sound': null}, {'sound': null},
      {'sound': null}, {'sound': null}, {'sound': null}, {'sound': null}
    ])
  );
  // setting volume in local storage
  localStorage.setItem('vol', '0.5');
}

function getSoundDataBy(attrType, attr) {
  let data = null;
  switch (attrType) {
    case 'number':
      data = soundData.find(data => data.number == attr)
      break;
    case 'category':
      data = soundData.filter(data => data.character == attr);
      break;
    case 'contents':
      data = soundData.find(data => data.contents == attr);
      break;
    default:
      break;
  }
  return data
}

// sets up click handlers and styles for sound buttons
function updateSoundBtns() {
  const data = soundboard.input('getData');
  document.querySelectorAll('.soundBtn').forEach((btn, index) => {
    const btn_clone = btn.cloneNode(true);
    const datum = data[index].sound;
    btn_clone.classList = 'soundBtn';
    if (deleteFlag) {
      btn_clone.classList = 'soundBtn deleteBtn';
      btn_clone.addEventListener('click', soundBtnDelCallback);
      btn_clone.lastElementChild.classList = 'deleteIcon';
    } else {
        btn_clone.lastElementChild.classList = 'deleteIcon hidden';
        if (datum != null) {
          btn_clone.classList = 'soundBtn playBtn';
          btn_clone.addEventListener('click', soundBtnPlayCallback);
          btn_clone.firstElementChild.innerText = datum.contents;
      } else {
          btn_clone.classList = 'soundBtn setBtn';
          btn_clone.addEventListener('click', soundBtnSetCallback);
          btn_clone.firstElementChild.innerText = 'Click to set.'
      }
    }
    btn.parentNode.replaceChild(btn_clone, btn);
  });
}

function initOpts() {
  const catSel = document.getElementById('catSel');
  const soundSel = document.getElementById('soundSel');
  const xmlSerial = new XMLSerializer();
  catSel.addEventListener('change', catSelCallback);
  catSel.appendChild(new Option('', '0'))
  catData.filter( (cat, index) => {
    catSel.appendChild(new Option(cat.name, index));
    const catSoundData = getSoundDataBy('category', cat.abbr);
    let soundOpts = xmlSerial.serializeToString(new Option('', '0'));
    for (const data of catSoundData) {
      soundOpts += xmlSerial.serializeToString(new Option(data.contents, data.number));
    }
    soundOptList.push(soundOpts);
  });
}

function setSettingsHandlers() {
  document.getElementById('settingsBtn').addEventListener('click', settingsBtnCallback);
  document.getElementById('volBtn').addEventListener('click', volBtnCallback);
  document.getElementById('soundSelBtn').addEventListener('click', selectBtnCallback);
  document.getElementById('cancel').addEventListener('click', cancelBtnCallback);
  document.getElementById('resetBtn').addEventListener('click', resetBtnCallback);
  document.getElementById('volSlider').addEventListener('change', volSliderCallback);
  document.getElementById('modal-form').addEventListener('submit', modalClearCallback);
}

// callback functions

// soundBtn callbacks
async function soundBtnPlayCallback(event) {
  const btn = event.srcElement;
  btn.classList = 'soundBtn playingBtn';
  await soundboard.input('playSound', btn.value);
  btn.classList = 'soundBtn playBtn';
}

function soundBtnSetCallback(event) {
  event.srcElement.classList = 'soundBtn editBtn';
  localStorage.setItem('setBtn', event.srcElement.value);
  toggleSetSound();
}

function soundBtnDelCallback(event) {
  const index= event.srcElement.value;
  soundboard.input('delSound', parseInt(index));
  const btn = document.getElementById('btn' + index);
  btn.firstElementChild.innerText = 'Click to set.'
  updateSoundBtns();
}
// end soundBtn callbacks

function volSliderCallback(event) {
  soundboard.input('setVol', event.srcElement.value / 100);
}

function settingsBtnCallback() {
  deleteFlag = !deleteFlag;
  const resetBtn = document.getElementById('resetBtn');
  if (deleteFlag) resetBtn.classList.remove('hidden')
  else resetBtn.classList.add('hidden');
  updateSoundBtns();
}

function volBtnCallback(event) {
  muteFlag = !muteFlag;
  let volSlider = document.getElementById('volSlider');
  const volBtnImg = event.srcElement.querySelector('use');
  let imgName;
  soundboard.input('mute');
  if (muteFlag) {
    imgName = './res/bootstrap-icons.svg#volume-mute';
    volSlider.value = 0;
  } else {
    const volume = localStorage.getItem('lastVol')
    imgName = './res/bootstrap-icons.svg#volume-up'
    volSlider.value = volume * 100;
    soundboard.input('setVol', volSlider.value / 100);
  }
  volSlider.disabled = muteFlag;
  
  volBtnImg.setAttribute('xlink:href', imgName);
}

function selectBtnCallback() {
  const index = parseInt(localStorage.getItem('setBtn'));
  const selVal = document.getElementById('soundSel').value;
  const data = getSoundDataBy('number', selVal);
  soundboard.input('setSound', data, index)
  const btn = document.getElementById('btn' + index);
  btn.classList = 'soundBtn playBtn';
  btn.firstElementChild.innerText = data.contents;
  btn.removeEventListener('click', soundBtnSetCallback);
  btn.addEventListener('click', soundBtnPlayCallback);
  toggleSetSound();
}

function cancelBtnCallback(event) {
  toggleSetSound();
  const btnNum = localStorage.getItem('setBtn');
  document.getElementById('btn' + btnNum).classList = 'soundBtn setBtn';

}

function catSelCallback(event) {
  const catSel = event.srcElement;
  const soundSel = document.getElementById('soundSel');
  soundSel.innerHTML = soundOptList[parseInt(catSel.value)];
}

function resetBtnCallback(event) {
  document.querySelectorAll('body>div').forEach(div => {
    if (div.id == 'modal') div.classList.remove('hidden');
    if (div.id != 'modal') div.classList.add('hidden');
  });

}

function modalClearCallback(event) {
  if (event.submitter.value === "reset") {
    localStorage.removeItem('init');
    localStorage.removeItem('vol');
    localStorage.removeItem('sounds');
  } else if (event.submitter.value === "cancel") {
    return;
  }
}

// end callbacks