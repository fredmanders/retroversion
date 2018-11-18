import React from "react";

export default class Camera extends React.Component {
  componentDidMount() {
    this.started = false;
    
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then((stream) => {
      this.video.srcObject = stream;
      this.video.play();
    })
    .catch(function (err) {
      console.log("An error occurred! " + err);
    });
    
    console.log("mounted");
    this.video.addEventListener('canplay', this.videoCanPlay.bind(this), false);
  }
  
  videoCanPlay() {
    console.log("canPlay!");
    if(this.started) {
      return;
    }
    
    this.started = true;
    
    this.width = 500;
  
    this.height = this.video.videoHeight / (this.video.videoWidth / this.width);
  
    this.video.setAttribute('width', this.width);
    this.video.setAttribute('height', this.height);
    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);
  }
  
  takePicture() {
    let context = this.canvas.getContext('2d');
    context.drawImage(this.video, 0, 0, this.width, this.height);
  
    this.canvas.toBlob(this.props.onImageBlob)
  }
  
  render() {
    return <div>
      <video id="video"/>
      <canvas id="canvas" style={{display:"none"}} />
      <button onClick={this.takePicture.bind(this)}>Take picture</button>
    </div>
  }
}