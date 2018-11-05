import React, { Component } from 'react'
import * as faceapi from 'face-api.js'
import logo from './NicOrNot.png'
import Dropzone from 'react-dropzone'
import './App.css'

const threshHold = 0.6

export default class App extends Component {
  state = {
    distance: 0,
    graphic: logo,
    status: 'Loading Models'
  }

  async componentDidMount() {
    await faceapi.loadSsdMobilenetv1Model('/face_model')
    await faceapi.loadFaceLandmarkModel('/face_model')
    await faceapi.loadFaceRecognitionModel('/face_model')
    this.setState({
      status: 'Ready'
    })
  }

  checkFaces = async () => {
    this.setState({
      status: 'Processing Faces'
    })
    const nic = await faceapi.fetchImage('./nic_face.jpg')
    const nicDescript = await faceapi.allFacesSsdMobilenetv1(nic)

    const otherURL = this.state.graphic
    const other = await faceapi.fetchImage(otherURL)
    const otherDescript = await faceapi.allFacesSsdMobilenetv1(other)
    let closestFace = 1

    // const distance = faceapi.round(
    //   faceapi.euclideanDistance(
    //     nicDescript[0].descriptor,
    //     otherDescript[0].descriptor
    //   )
    // )

    const dropped = this.refs.dropped
    const overlay = this.refs.overlay
    overlay.width = dropped.width
    overlay.height = dropped.height

    let boxesWithText = []
    const faces = otherDescript.map(det => {
      // Distance of each face
      let distance = faceapi.round(
        faceapi.euclideanDistance(nicDescript[0].descriptor, det.descriptor)
      )

      if (distance < threshHold) {
        const face = det.forSize(overlay.width, overlay.height)
        closestFace = distance
        const { box } = face.alignedRect
        boxesWithText.push(
          new faceapi.BoxWithText(
            new faceapi.Rect(box.x, box.y, box.width, box.height),
            'Nic'
          )
        )
      }

      // return det.forSize(overlay.width, overlay.height)
    })
    // const { box } = faces[0].alignedRect
    // boxesWithText = [
    //   new faceapi.BoxWithText(
    //     new faceapi.Rect(box.x, box.y, box.width, box.height),
    //     'Nic'
    //   )
    // ]

    faceapi.drawDetection(this.refs.overlay, boxesWithText)

    this.setState({
      status: 'Ready',
      classification: closestFace
    })
  }

  setFile = file => {
    const reader = new FileReader()
    reader.onload = e => {
      this.setState({ classification: null, graphic: e.target.result })
    }

    reader.readAsDataURL(file)
  }

  onDrop = (accepted, rejected) => {
    if (rejected.length > 0) window.alert('JPG or PNG only plz')
    this.setFile(accepted[0])
    this.checkFaces()
  }

  renderNicImage = () => {
    let nicPath = ''
    if (this.state.status === 'Ready') {
      if (this.state.classification) {
        nicPath =
          Number(this.state.classification) < threshHold
            ? './yes.png'
            : './no.png'
      }
    } else {
      nicPath = './processingFaces.gif'
    }
    return <img src={nicPath} id="detection" />
  }

  render() {
    return (
      <div className="App">
        <p id="opener">
          Identify if a person <em>is</em> or <em>is NOT</em> Nicolas Cage with
          ease.
        </p>
        {this.renderNicImage()}
        <header className="App-header">
          <Dropzone
            accept="image/jpeg, image/png"
            className="photo-box"
            onDrop={this.onDrop.bind(this)}
          >
            <img
              src={this.state.graphic}
              className="dropped-photo"
              ref="dropped"
            />
            <canvas
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                maxHeight: '400px'
              }}
              ref="overlay"
            />
            <p>Drop your image here or click to browse.</p>
          </Dropzone>
        </header>
        <div>
          <h2>Also: Available in Mobile App</h2>
          <img src="nic_clip.gif" />
          <p>
            This is useful when{' '}
            <a
              href="http://declarationofindependencethief.com/"
              target="_blank"
            >
              someone steals the Declaration of Independence
            </a>
            , or if you're just looking to{' '}
            <a
              href="https://shift.infinite.red/cage-against-the-machine-a419b6980424"
              target="_blank"
            >
              learn more about facial recognition
            </a>
            . If either of those are your need, then this is the app for you!{' '}
            <a
              href="https://itunes.apple.com/us/app/nic-or-not/id1437819644?ls=1&mt=8"
              target="_blank"
            >
              This App is <strong>currently available on iOS App Store</strong>
            </a>
            .
          </p>
          <img src="app.png" className="appStore" alt="app store image" />
        </div>
        <footer id="footer">
          <ul>
            <li>Copyright Now(ish)</li>
            <li>
              <a href="http://declarationofindependencethief.com/">
                Declaration of Independence Thief Site
              </a>
            </li>
            <li>
              <a href="https://github.com/gantman/nicornot">GitHub Repo</a>
            </li>
            <li>
              <a href="https://shift.infinite.red/cage-against-the-machine-a419b6980424">
                Blog Post
              </a>
            </li>
            <li>
              <a href="https://slides.com/gantlaborde/cage#/">Slides</a>
            </li>
          </ul>
        </footer>
      </div>
    )
  }
}
