"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayer = void 0;
var AudioPlayer = /** @class */ (function () {
    function AudioPlayer(audio) {
        this.audioElement = audio;
    }
    AudioPlayer.prototype.play = function () {
        this.audioElement.play();
    };
    return AudioPlayer;
}());
exports.AudioPlayer = AudioPlayer;
;
//# sourceMappingURL=AudioPlayer.js.map