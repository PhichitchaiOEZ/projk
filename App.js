/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  DeviceEventEmitter,
  TouchableOpacity,
  Image,
  Modal,
  Text,
  Alert,
  Button,
} from 'react-native';

import {CvCamera} from 'react-native-opencv3';
import axios from 'axios';
import db from './firebase';
import {decode, encode} from 'base-64';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

const img = 'file:///data/user/0/com.faceaccesscontrol/files/myimage1.jpg';
const appKey = '6532df5b8bdde79af2fe55b2216b66a1';
const appSecret = '8c3ca06c7d33eb3c05fdedf7d0ff3639';
const libraryId = '4af53671-dfc4-4bfc-a0de-6012d18c8b90';

let confidence = null;
let objTSe = null;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      faces: '',
      datalist: [],
      facing: 'front',
      status: true,
    };
  }

  componentDidMount = () => {
    DeviceEventEmitter.addListener('onFacesDetected', this.onFacesDetected);
  };

  showModal = () => {
    this.setState({
      modalVisible: true,
    });
    setTimeout(() => {
      this.setState({
        modalVisible: false,
      });
    }, 4000);
  };

  takePic = async () => {
    const {uri, width, height} = await this.cvCamera.takePicture(
      'myimage1.jpg',
    );
    console.log('SnapPhoto : success');
    this.faceSearch();
  };

  faceSearch = () => {
    let formData = new FormData();
    formData.append('appKey', appKey);
    formData.append('appSecret', appSecret);
    formData.append('uniquenessId', libraryId);
    formData.append('imageDataOne', {
      uri: img,
      name: 'myimage1.jpg',
      type: 'image/jpg',
    });
    formData.append('returnTop', '1');

    axios({
      method: 'post',
      url: 'https://api-live.wiseai.tech/face/v2/search',
      data: formData,
      headers: {'Content-Type': 'multipart/form-data'},
    })
      .then(response => {
        confidence = response.data.collection[0].results[0].confidence;
        objTSe = response.data.collection[0].results[0].objectToken;
        console.log('confidence : ', confidence);
        if (confidence > 0.8) {
          console.log('User : Pass');
          this.fecthUser(objTSe);
        } else {
          this.setState({datalist: []});
          console.log('User : NoPass');
          this.showModal();
        }
      })
      .catch(response => {
        alert('No face');
      });
  };

  fecthUser = objToken => {
    console.log('UserToken : ', objToken);

    let MemberRef = db.collection('Member');
    MemberRef.where('ObjectToken', '==', objToken)
      .get()
      .then(snapshot => {
        let data = [];

        if (snapshot.empty) {
          console.log('No matching documents.');
        } else {
          snapshot.forEach(doc => {
            if (doc.exists) {
              data.push(doc.data());
              this.setState({datalist: [...data]});
              console.log(doc.data());
              console.log('SearchUser : success');
              this.showModal();
            } else {
              console.log('SearchUser : Unsuccess');
            }
          });
        }
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
  };

  openAccessControl = () => {
    axios
      .post('http://192.168.68.109:8000/sceneControl', {
        accessToken: '9cb136f94a4b4b3c85ec6ecc3fd21241',
        sceneId: '143f32c013874919af5985a4d650f160',
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  //ฟังก์ชัน
  onFacesDetected = e => {
    if (Platform.OS === 'ios') {
      if (
        (!e.nativeEvent.payload && this.state.faces) ||
        (e.nativeEvent.payload && !this.state.faces) ||
        (e.nativeEvent.payload && this.state.faces)
      ) {
        this.setState({faces: e.nativeEvent.payload});
      }
    } else {
      if (
        this.state.status &&
        ((!e.payload && this.state.faces) ||
          (e.payload && !this.state.faces) ||
          (e.payload && this.state.faces))
      ) {
        this.setState({faces: e.payload});
        console.log(e.payload);
        //เช็คขนาดของหน้าเพื่อจะแคปรูป
        const facesJSON1 = JSON.parse(e.payload);

        if (
          facesJSON1.faces[0].width > 0.15 &&
          facesJSON1.faces[0].height > 0.25
        ) {
          console.log('==============Accept====================');
          this.setState({status: false});
          console.log('Detect status : ', this.state.status);
          this.takePic();
        }

        //*******************************************/
      }
    }
  };

  renderFaceBoxes() {
    if (this.state.faces) {
      const facesJSON = JSON.parse(this.state.faces);
      let views = facesJSON.faces.map((face, i) => {
        let box = {
          position: 'absolute',
          top: `${100.0 * face.y}%`,
          left: `${100.0 * face.x}%`,
          width: '100%',
          height: '100%',
        };
        let style = {
          width: `${100.0 * face.width}%`,
          height: `${100.0 * face.height}%`,
          borderWidth: 3,
          borderColor: '#0f0',
        };

        let e1box = {},
          e1style = {};
        if (face.firstEye) {
          e1box = {
            position: 'absolute',
            top: `${100.0 * face.firstEye.y}%`,
            left: `${100.0 * face.firstEye.x}%`,
            width: '100%',
            height: '100%',
          };
          e1style = {
            width: `${100.0 * face.firstEye.width}%`,
            height: `${100.0 * face.firstEye.height}%`,
            borderWidth: 2,
            borderColor: '#ff0',
          };
        }

        let e2box = {},
          e2style = {};
        if (face.secondEye) {
          e2box = {
            position: 'absolute',
            top: `${100.0 * face.secondEye.y}%`,
            left: `${100.0 * face.secondEye.x}%`,
            width: '100%',
            height: '100%',
          };
          e2style = {
            width: `${100.0 * face.secondEye.width}%`,
            height: `${100.0 * face.secondEye.height}%`,
            borderWidth: 2,
            borderColor: '#ff0',
          };
        }

        let nbox = {},
          nstyle = {};
        if (face.nose) {
          nbox = {
            position: 'absolute',
            top: `${100.0 * face.nose.y}%`,
            left: `${100.0 * face.nose.x}%`,
            width: '100%',
            height: '100%',
          };
          nstyle = {
            width: `${100.0 * face.nose.width}%`,
            height: `${100.0 * face.nose.height}%`,
            borderWidth: 2,
            borderColor: '#00f',
          };
        }

        let mbox = {},
          mstyle = {};
        if (face.mouth) {
          mbox = {
            position: 'absolute',
            top: `${100.0 * face.mouth.y}%`,
            left: `${100.0 * face.mouth.x}%`,
            width: '100%',
            height: '100%',
          };
          mstyle = {
            width: `${100.0 * face.mouth.width}%`,
            height: `${100.0 * face.mouth.height}%`,
            borderWidth: 2,
            borderColor: '#f00',
          };
        }

        return (
          <View key={face.faceId} style={box}>
            <View style={style}>
              <View style={e1box}>
                <View style={e1style} />
              </View>
              <View style={e2box}>
                <View style={e2style} />
              </View>
              <View style={nbox}>
                <View style={nstyle} />
              </View>
              <View style={mbox}>
                <View style={mstyle} />
              </View>
            </View>
          </View>
        );
      });

      return <View style={styles.allFaceBoxes}>{views}</View>;
    }
  }

  modolRender() {
    console.log('ShowModal ', this.state.modalVisible);

    if (this.state.datalist.length !== 0) {
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          supportedOrientations={['landscape']}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={styles.list}>
              <View
                style={{
                  flex: 1.3,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#45EA25',
                  alignItems: 'center',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}>
                <Image
                  style={{width: 50, height: 50, marginTop: 10}}
                  source={require('./images/unlock.png')}
                />
              </View>
              <Image
                style={styles.image}
                source={{uri: this.state.datalist[0].Image}}
              />

              <View
                style={{
                  flex: 3,
                  marginLeft: 10,
                  marginTop: 20,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: 'bold', fontSize: 30}}>
                  {this.state.datalist[0].FirstName}{' '}
                  {this.state.datalist[0].LastName}
                </Text>
                <Text numberOfLines={1}>
                  ____________________________________________
                </Text>
                <Text style={{marginTop: 10, marginBottom: 25, fontSize: 22}}>
                  {this.state.datalist[0].Position}
                </Text>
              </View>

              <View
                style={{
                  flex: 2,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#45EA25',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                }}>
                <Text
                  style={{fontWeight: 'bold', fontSize: 40, color: 'white'}}>
                  Welcome!
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      );
    } else {
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          supportedOrientations={['landscape']}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={styles.list}>
              <View
                style={{
                  flex: 1.3,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'red',
                  alignItems: 'center',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}>
                <Image
                  style={{width: 50, height: 50, marginTop: 10}}
                  source={require('./images/lock.png')}
                />
              </View>
              <Image
                style={styles.image}
                source={{
                  uri:
                    'https://www.shareicon.net/data/256x256/2016/08/20/817726_close_395x512.png',
                }}
              />

              <View
                style={{
                  flex: 3,
                  marginLeft: 10,
                  marginTop: 20,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: 'bold', fontSize: 30}}>
                  Unknow User
                </Text>
                <Text numberOfLines={1}>
                  ____________________________________________
                </Text>
                {/* <Text style={{ marginTop: 10, marginBottom: 25, fontSize: 22 }}>Internship</Text> */}
                {/* <Button
                  title="No"
                  onPress={() => {
                    this.setState({ modalVisible: false }),
                      setTimeout(() => {
                        this.setState({
                          status: true
                        })
                      }, 5000)
                  }}
                /> */}
              </View>

              <View
                style={{
                  flex: 2,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'red',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                }}>
                <Text
                  style={{fontWeight: 'bold', fontSize: 40, color: 'white'}}>
                  Try again!
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      );
    }
  }

  modolRender2() {
    console.log('ShowModal ', this.state.modalVisible);

    if (this.state.datalist.length !== 0) {
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          supportedOrientations={['landscape']}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={styles.list}>
              <View
                style={{
                  flex: 1.3,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#45EA25',
                  alignItems: 'center',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}>
                <Image
                  style={{width: 50, height: 50, marginTop: 10}}
                  source={require('./images/unlock.png')}
                />
              </View>
              <Image
                style={styles.image}
                source={{uri: this.state.datalist[0].Image}}
              />

              <View
                style={{
                  flex: 3,
                  marginLeft: 10,
                  marginTop: 20,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: 'bold', fontSize: 30}}>
                  {this.state.datalist[0].FirstName}{' '}
                  {this.state.datalist[0].LastName}
                </Text>
                <Text numberOfLines={1}>
                  ____________________________________________
                </Text>
                <Text style={{marginTop: 10, marginBottom: 25, fontSize: 22}}>
                  {this.state.datalist[0].Position}
                </Text>
              </View>

              <View
                style={{
                  flex: 2,
                  flexDirection: 'row',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'white',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                }}>
                {/* <Text style={{ fontWeight: 'bold', fontSize: 40, color:'white' }}>Welcome!</Text> */}
                <TouchableOpacity
                  onPress={() => this.setState({modalVisible: false})}>
                  <Image
                    style={{width: 70, height: 70}}
                    source={require('./images/correct.png')}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => this.setState({modalVisible: false})}>
                  <Image
                    style={{width: 70, height: 70}}
                    source={require('./images/incorrect.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    } else {
      setTimeout(() => {
        this.setState({
          modalVisible: false,
        });
      }, 8000);
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          supportedOrientations={['landscape']}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={styles.list}>
              <View
                style={{
                  flex: 1.3,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'red',
                  alignItems: 'center',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}>
                <Image
                  style={{width: 50, height: 50, marginTop: 10}}
                  source={require('./images/lock.png')}
                />
              </View>
              <Image
                style={styles.image}
                source={{
                  uri:
                    'https://www.shareicon.net/data/256x256/2016/08/20/817726_close_395x512.png',
                }}
              />

              <View
                style={{
                  flex: 3,
                  marginLeft: 10,
                  marginTop: 20,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: 'bold', fontSize: 30}}>
                  Unknow User
                </Text>
                <Text numberOfLines={1}>
                  ____________________________________________
                </Text>
                {/* <Text style={{ marginTop: 10, marginBottom: 25, fontSize: 22 }}>Internship</Text> */}
                {/* <Button
                  title="No"
                  onPress={() => {
                    this.setState({ modalVisible: false }),
                      setTimeout(() => {
                        this.setState({
                          status: true
                        })
                      }, 5000)
                  }}
                /> */}
              </View>

              <View
                style={{
                  flex: 2,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'red',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                }}>
                <Text
                  style={{fontWeight: 'bold', fontSize: 40, color: 'white'}}>
                  Try again!
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      );
    }
  }

  render() {
    if (this.state.modalVisible) {
      console.log('modal is show');

      setTimeout(() => {
        this.setState({
          status: true,
        });
      }, 10000);
    }
    return (
      <View style={styles.preview}>
        <CvCamera
          ref={ref => {
            this.cvCamera = ref;
          }}
          style={styles.preview}
          facing={this.state.facing}
          faceClassifier="haarcascade_frontalface_alt2"
          onFacesDetected={this.onFacesDetected}
        />
        {this.renderFaceBoxes()}
        {/* <TouchableOpacity
          style={
            Platform.OS === 'android' ? styles.androidButton : styles.iosButton
          }
          onPress={() => this.takePic()}>
          <Image
            style={
              Platform.OS === 'android' ? styles.androidImg : styles.iosImg
            }
            source={require('./images/flipCamera.png')}
          />
        </TouchableOpacity> */}
        {this.modolRender()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  androidImg: {
    transform: [{rotate: '-90deg'}],
    backgroundColor: 'transparent',
    width: 50,
    height: 50,
  },
  iosImg: {
    backgroundColor: 'transparent',
    width: 50,
    height: 50,
  },
  androidButton: {
    top: 0,
    bottom: 0,
    right: 0,
    width: '10%',
    position: 'absolute',
    backgroundColor: '#FFF',
    opacity: 0.75,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosButton: {
    left: 0,
    right: 0,
    bottom: 0,
    height: '10%',
    position: 'absolute',
    backgroundColor: '#FFF',
    opacity: 0.75,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allFaceBoxes: {
    backgroundColor: 'transparent',
    position: 'absolute',
    alignItems: 'center',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  preview: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
  },
  list: {
    // flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 15,
    borderRadius: 20,
    //paddingRight: 10,
    alignItems: 'center',
    width: '30%',
    height: '70%',
  },
  image: {
    width: 150,
    height: 150,
    marginTop: 30,
    borderRadius: 75,
    borderColor: 'black',
    // borderWidth:1
    // backgroundColor: 'skyblue'
  },
});
