import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from 'agora-rtm-sdk';
import * as Control from './Control'

// Control.show();

async function startBasicCall() {
    Control.initRtcPre();

    window.onload = function () {
        Control.initRtc();
        Control.initRtm();
    };

}


startBasicCall();