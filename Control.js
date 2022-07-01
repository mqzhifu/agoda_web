import AgoraRTM from "agora-rtm-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";

let show = function(msg){
    console.log("show:",msg)
}

export {
    show,
    initRtc,
    initRtm,
    initRtcPre,
}



let rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
    client: null,
    remoteVideoTrack:null,
};

let options = {
    appId: "8ff429463a234c7bae327d74941a5956",
    channel: "ckck",
    rtc_user:{
        token: "0068ff429463a234c7bae327d74941a5956IAB/R5p6ic9fTQey5wybWvaJEa1mms4XqNq79MC9+v1+94Qj5dgAAAAAEAC0+3p1hlm+YgEAAQCGWb5i",
        // Set the user ID.
        uid: 123456,
    },
    rtm_user :{
        uid : "test_user",
        token: "0068ff429463a234c7bae327d74941a5956IACV/S62FPHCZqzTRqWTKpxK4i2DJGe819/q2WCEQz1FIob86ogAAAAAEAAgFA0DX1q+YgEA6AOvKDdW"
    },
}


const client = AgoraRTM.createInstance(options.appId);
let channel = client.createChannel(options.channel);

//截取 - 对方视频 - 图片
let screenshots = function (){
    var imagedata = rtc.remoteVideoTrack.getCurrentFrameData();

    // var canvas = document.createElement('canvas');
    var  canvas = document.getElementById("my_canvas");
    var ctx = canvas.getContext('2d');
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);

    var resized_img = new Image();
    resized_img.src = canvas.toDataURL("image/jpeg",0.7);

    request_service(resized_img);
    // var image = new Image();
    // image.src = canvas.toDataURL();

    // document.body.appendChild(image);
    // console.log("image:=========",image);

}

let initRtcPre = function(){
    console.log("initRtcPre~2~33322:");
    // Create an AgoraRTCClient object.
    rtc.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});

    // Listen for the "user-published" event, from which you can get an AgoraRTCRemoteUser object.
    rtc.client.on("user-published", async (user, mediaType) => {
        // Subscribe to the remote user when the SDK triggers the "user-published" event
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");
        // If the remote user publishes a video track.
        if (mediaType === "video") {
            // Get the RemoteVideoTrack object in the AgoraRTCRemoteUser object.
            const remoteVideoTrack = user.videoTrack;
            rtc.remoteVideoTrack = remoteVideoTrack;
            // Dynamically create a container in the form of a DIV element for playing the remote video track.
            const remotePlayerContainer = document.createElement("div");
            // Specify the ID of the DIV container. You can use the uid of the remote user.
            remotePlayerContainer.id = user.uid.toString();
            remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
            remotePlayerContainer.style.width = "640px";
            remotePlayerContainer.style.height = "480px";
            document.body.append(remotePlayerContainer);

            // Play the remote video track.
            // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
            remoteVideoTrack.play(remotePlayerContainer);

            // setTimeout(aaa,5000);
            // console.log("=====remoteVideoTrack.getMediaStreamTrack().getSettings():",remoteVideoTrack.getMediaStreamTrack().getSettings());
        }

        // If the remote user publishes an audio track.
        if (mediaType === "audio") {
            // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
            const remoteAudioTrack = user.audioTrack;
            // Play the remote audio track. No need to pass any DOM element.
            remoteAudioTrack.play();
        }

        // Listen for the "user-unpublished" event
        rtc.client.on("user-unpublished", user => {
            // Get the dynamically created DIV container.
            const remotePlayerContainer = document.getElementById(user.uid);
            // Destroy the container.
            remotePlayerContainer.remove();
        });
    });
}


let initRtc = function (){
    console.log("initRtc:");

    document.getElementById("join").onclick = async function () {
        // Join an RTC channel.
        await rtc.client.join(options.appId, options.channel, options.rtc_user.token, options.rtc_user.uid);
        // Create a local audio track from the audio sampled by a microphone.
        rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        // Create a local video track from the video captured by a camera.
        rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        // Publish the local audio and video tracks to the RTC channel.
        await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
        // Dynamically create a container in the form of a DIV element for playing the local video track.
        const localPlayerContainer = document.createElement("div");
        // Specify the ID of the DIV container. You can use the uid of the local user.
        localPlayerContainer.id = options.uid;
        localPlayerContainer.textContent = "Local user " + options.uid;
        localPlayerContainer.style.width = "640px";
        localPlayerContainer.style.height = "480px";
        document.body.append(localPlayerContainer);

        // Play the local video track.
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the local video track.
        rtc.localVideoTrack.play(localPlayerContainer);
        console.log("publish success!");
    };

    document.getElementById("leave").onclick = async function () {
        // Destroy the local audio and video tracks.
        rtc.localAudioTrack.close();
        rtc.localVideoTrack.close();

        // Traverse all remote users.
        rtc.client.remoteUsers.forEach(user => {
            // Destroy the dynamically created DIV containers.
            const playerContainer = document.getElementById(user.uid);
            playerContainer && playerContainer.remove();
        });

        // Leave the channel.
        await rtc.client.leave();
    };

    var bnt_screenshots = document.getElementById("bnt_screenshots");
    bnt_screenshots.addEventListener('click',screenshots);
}

let initRtm = function (){
    console.log("initRtm:");
    // 按钮逻辑
    // 登录
    document.getElementById("login").onclick = async function () {
        options.rtm_user.uid = document.getElementById("userID").value.toString()
        await client.login(options.rtm_user)
    }


    // 创建并加入频道
    document.getElementById("rtm_join").onclick = async function () {
        // Channel event listeners
        // Display channel messages
        await channel.join().then (() => {
            document.getElementById("log").appendChild(document.createElement('div')).append("You have successfully joined channel " + channel.channelId)
        })
    }

    // 发送频道消息
    document.getElementById("send_channel_message").onclick = async function () {

        let channelMessage = document.getElementById("channelMessage").value.toString()

        if (channel != null) {
            await channel.sendMessage({ text: channelMessage }).then(() => {

                    document.getElementById("log").appendChild(document.createElement('div')).append("Channel message: " + channelMessage + " from " + channel.channelId)

                }

            )
        }
    }
}

//将截图后图片 推送到服务端
let request_service = function (resized_img){
    console.log("request_service resized_img:",resized_img);

    // var form = new FormData();
    // form.append("stream", resized_img.src, "a.jpg");
    // 后端公共HTTP接口-头信息
    var header_X_Source_Type = "11";
    var header_X_Project_Id = "6";
    var header_X_Access = "imzgoframe";

    $.ajax({
        headers: {
            "X-Source-Type": header_X_Source_Type,
            "X-Project-Id": header_X_Project_Id,
            "X-Access": header_X_Access,
        },
        // dataType: "json",
        type: "POST",
        // data: JSON.stringify({"path": "apache-tomcat-8.5.81-fulldocs.tar.gz"}),
        // data:form,
        data :{"stream":resized_img.src},
        // contentType: "application/json;charset=utf-8",
        url: "http://127.0.0.1:1111/file/upload/img/one/stream/base64",
        // url: "http://localhost:1111/persistence/file/upload/stream",
        success: function(backData){
            // alert("ok");
            console.log("backData:",backData);
            backData = eval(   backData  );
            if(backData.code != 200){
                return alert("ajax req back data err");
            }

            var r= Math.random();
            var url = "http://192.168.192.146:1111/"+backData.data.local_url + "?r="+r;
            console.log("url:",url);

            channel.sendMessage({ text: url }).then(() => {
                document.getElementById("log").appendChild(document.createElement('div')).append("Channel message: " + url + " from " + channel.channelId)
            });

        }
    });
}