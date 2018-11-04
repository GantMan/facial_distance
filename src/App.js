import React, {Component} from "react";
import * as faceapi from 'face-api.js'

export default class App extends Component {
  state={
    distance: 0
  }

  async componentDidMount ()  {
    await faceapi.loadSsdMobilenetv1Model('/face_model')
    await faceapi.loadFaceLandmarkModel('/face_model')
    await faceapi.loadFaceRecognitionModel('/face_model')
    this.setState({
      classification: 'done loading model'
    })

    const nic = await faceapi.fetchImage('https://i.imgur.com/ASvFZxs.jpg')
    const nicDescript = await faceapi.allFacesSsdMobilenetv1(nic)

    const otherURL = 'https://i.imgur.com/xCzhUwe.png' //this.state.thing
    const other = await faceapi.fetchImage(otherURL)

    const otherDescript = await faceapi.allFacesSsdMobilenetv1(other)


    const distance = faceapi.round(
      faceapi.euclideanDistance(nicDescript[0].descriptor, otherDescript[0].descriptor)
    )

    console.log('DISTANCE', distance)
    this.setState({distance})
  }


  render() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>{this.state.distance}</h2>
    </div>
  );
  }
}

