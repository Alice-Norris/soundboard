var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ipcRenderer = require('electron').ipcRenderer;
var contextBridge = require('electron').contextBridge;
var audioElements = [];
var soundFilenames = [];
var characters = [
    { 'abbr': 'FM', 'name': 'Fox McCloud' },
    { 'abbr': 'FL', 'name': 'Falco Lombardi' },
    { 'abbr': 'PH', 'name': 'Peppy Hare' },
    { 'abbr': 'ST', 'name': 'Slippy Toad' },
    { 'abbr': 'R64', 'name': 'ROB64' },
    { 'abbr': 'GP', 'name': 'General Pepper' },
    { 'abbr': 'WO', 'name': 'Wolf O\'Donnel' },
    { 'abbr': 'AO', 'name': 'Andrew Oikonny' },
    { 'abbr': 'A', 'name': 'Andross' },
    { 'abbr': 'B', 'name': 'Bill' },
    { 'abbr': 'K', 'name': 'Katt Munroe' }
];
window.addEventListener('DOMContentLoaded', function (event) {
    setupAudioDevices();
    fetchLocalData();
    setupSetSoundDiv();
    setupSounds();
    setupSoundboard();
});
var ipc = {
    'render': {
        'send': [
            'message:fromRender'
        ],
        'receive': [
            'message:toRender'
        ],
        'sendReceive': [
            'invoke:fromRender'
        ]
    }
};
contextBridge.exposeInMainWorld('ipcRender', {
    send: function (channel, args) {
        var validChannels = ipc.render.send;
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, args);
        }
    },
    receive: function (channel, listener) {
        var validChannels = ipc.render.receive;
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return listener.apply(void 0, args);
            });
        }
    },
    invoke: function (channel, args) {
        var validChannels = ipc.render.sendReceive;
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, args);
        }
    }
});
function getSoundData() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ipcRenderer.invoke('invoke:fromRender', 'reqFileList')];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function setupSetSoundDiv() {
    return __awaiter(this, void 0, void 0, function () {
        var selectBtn, soundData, soundSel, _i, characters_1, character, headerOpt, _a, _b, clipInfo, clipOpt;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    selectBtn = document.getElementById('soundSelBtn').addEventListener('click', function (event) {
                        addSound();
                    });
                    return [4 /*yield*/, getSoundData().then(function (result) {
                            return result;
                        })];
                case 1:
                    soundData = _c.sent();
                    soundSel = document.getElementById('soundSel');
                    for (_i = 0, characters_1 = characters; _i < characters_1.length; _i++) {
                        character = characters_1[_i];
                        headerOpt = document.createElement('option');
                        headerOpt.setAttribute('disabled', 'true');
                        headerOpt.innerText = character.name;
                        soundSel.appendChild(headerOpt);
                        for (_a = 0, _b = JSON.parse(soundData); _a < _b.length; _a++) {
                            clipInfo = _b[_a];
                            if (character.abbr === clipInfo.character) {
                                clipOpt = document.createElement('option');
                                clipOpt.setAttribute('value', clipInfo.number);
                                clipOpt.value = clipInfo.number.toString();
                                clipOpt.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + clipInfo.contents;
                                soundSel.appendChild(clipOpt);
                            }
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function setupSoundboard() {
    var btns = document.getElementsByClassName('soundBtn');
    var _loop_1 = function (i) {
        var btn = btns[i];
        btn.id = i.toString();
        audioElements.push(btn.previousElementSibling);
        if (soundFilenames[i] != undefined) {
            btn.addEventListener('click', function (event) {
                audioElements[i].play().then(function (_) {
                    audioElements[i].pause();
                });
            });
        }
        else {
            btn.innerHTML = 'NONE';
            btn.addEventListener('click', function (event) {
                btn.disabled = true;
                btn.classList.add('selecting');
                document.getElementById('addSound').classList.remove('hidden');
            });
        }
    };
    for (var i = 0; i < btns.length; i++) {
        _loop_1(i);
    }
}
function setupSounds() {
    console.log('SetupSounds: ' + soundFilenames);
    for (var i = 0; i < soundFilenames.length; i++) {
        if (soundFilenames[i] != null) {
            console.log(soundFilenames[i]);
            var source = document.getElementById('sound' + i.toString());
            console.log(source);
            source.setAttribute('src', 'res/sound/' + soundFilenames[i]);
        }
    }
}
function addSound() {
    var select = document.querySelector('#soundSel');
    var opt = select.options[select.selectedIndex];
    var btn = document.getElementsByClassName('selecting').item(0);
    var clipId = 'VOI_EU_' + opt.value.padStart(5, '0') + '.wav';
    btn.previousElementSibling.children.item(0).setAttribute('src', clipId);
    btn.disabled = false;
    btn.innerText = select.options[select.selectedIndex].innerText;
    var btnId = btn.id;
    var btnNum = btnId;
    audioElements[btnNum - 1] = btn.previousElementSibling;
    document.getElementById('addSound').classList.add('hidden');
    localStorage.setItem('sound' + ((btnNum - 1).toString()), clipId);
}
function fetchLocalData() {
    for (var i = 0; i < 16; i++) {
        var fileName = localStorage.getItem('sound' + i.toString());
        soundFilenames[i] = fileName;
    }
    console.log(soundFilenames);
}
function setupAudioDevices() {
    return __awaiter(this, void 0, void 0, function () {
        var audioDevs, devId, _i, audioDevs_1, devInfo, _a, audioElements_1, element;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                case 1:
                    audioDevs = _b.sent();
                    devId = '';
                    for (_i = 0, audioDevs_1 = audioDevs; _i < audioDevs_1.length; _i++) {
                        devInfo = audioDevs_1[_i];
                        if (devInfo.kind === 'audiooutput' && devInfo.deviceId === 'default') {
                            devId = devInfo.deviceId;
                        }
                    }
                    console.log(devId);
                    console.log(audioElements);
                    for (_a = 0, audioElements_1 = audioElements; _a < audioElements_1.length; _a++) {
                        element = audioElements_1[_a];
                        element.setSinkId(devId);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=preload.js.map