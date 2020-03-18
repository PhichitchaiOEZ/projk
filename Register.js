/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Text,
  Modal,
} from 'react-native';
import {CvCamera} from 'react-native-opencv3';
import axios from 'axios';


const img = 'file:///data/user/0/com.faceaccesscontrol/files/takepic.jpg';
const usericon = 'https://i.ya-webdesign.com/images/add-image-icon-png-6.png';
const appKey = '6532df5b8bdde79af2fe55b2216b66a1';
const appSecret = '8c3ca06c7d33eb3c05fdedf7d0ff3639';
const libraryId = '4af53671-dfc4-4bfc-a0de-6012d18c8b90';

let confidence = null;
let objTSe = null;




export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      facing: 'front',
      image: true,
      email: '',
    };
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  takePic = async () => {
    const {uri, width, height} = await this.cvCamera.takePicture('takepic.jpg');
    console.log('SnapPhoto : success');

    this.setState({image: false});
    this.setModalVisible(false)


    // add data ....{}
  };

  faceDectect (){
    let formData = new FormData();
    formData.append('appKey', appKey);
    formData.append('appSecret', appSecret);
    formData.append('imageData', {
      uri: img,
      name: 'takepic.jpg',
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
        objTSe = response.data.collection[0].objectToken;
        this.setState({objecttoken: objTSe})
       })
      .catch(response => {
        alert('No face');
      });
  }
  addObjectToken(){
    axios({
        method: 'post',
        url: 'https://api-live.wiseai.tech/face/v2/library/addFace',
        data: {
            appKey: appKey,
            appSecret: appSecret,
            libraryId: libraryId,
            objectTokens: objTSe,
        }
      })
      .then(response => {
        console.log('success');
        
      })
      .catch(error => {
        console.log('error');
        
      })
  }

  



  createUser(){
      let data = {
          FirstName: this.state.firstname,
          LastName: this.state.lastname,
          Image: this.state.image,
          ObjectToken: this.state.objecttoken,
          Position: this.state.position,
      }
  }

  render() {
    console.log('photo : ', this.state.image);
    let i = this.state.image ? usericon : img;
    return (
      <View style={{flex: 1}}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(52, 73, 94, 0.3)',
            }}>
            <View
              style={{
                // flexDirection: 'row',
                backgroundColor: 'white',
                borderRadius: 20,
                //paddingRight: 10,
                alignItems: 'center',
                width: '50%',
                height: '70%',
              }}>
              <CvCamera
                ref={ref => {
                  this.cvCamera = ref;
                }}
                style={{
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  position: 'absolute',
                }}
                facing={this.state.facing}
              />

              <TouchableHighlight
                style={{
                  //   top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '10%',
                  position: 'absolute',
                  backgroundColor: '#FFF',
                  opacity: 0.75,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                // onPress={() => this.takePic()}>
                onPress={() => this.takePic()}>
                <Text>Hide Modal</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'stretch',
          }}>
          <View
            style={{
              width: '33%',
              height: '100%',
              backgroundColor: 'powderblue',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                width: 200,
                height: 200,
                marginTop: 30,
                borderRadius: 100,
                borderColor: 'black',
              }}
              source={{
                uri: this.state.image ? usericon : img,
              }}
            />
            <TouchableHighlight
              style={[
                styles.buttonContainer,
                styles.signupButton,
                {marginTop: 20},
              ]}
              onPress={() => this.setModalVisible(true)}>
              <Text style={styles.signUpText}>Add Photo</Text>
            </TouchableHighlight>
          </View>
          <View
            style={{
              width: '0.5%',
              height: '80%',
              backgroundColor: 'black',
              marginTop: '6%',
            }}
          />

          <View
            style={{
              width: '66.5%',
              height: '100%',
              backgroundColor: 'rgba(0,255,0,0.2)',
              flex: 1,
            //   justifyContent: 'center',
            //   alignItems: 'center',
            }}>
            <View style={{backgroundColor: 'white',height:'10%', justifyContent:'center'}}>
                <Text style={{fontWeight: 'bold', fontSize: 40, marginLeft: 10}}>Register</Text>
            </View>
            <View style={{height:'90%',padding:'5%',marginLeft:20, marginRight:20}}>
                <View style={styles.inputContainer}>
                <Image
                    style={styles.inputIcon}
                    source={{
                    uri:
                        'https://th.seaicons.com/wp-content/uploads/2015/06/Users-User-Male-2-icon.png',
                    }}
                />
                <TextInput
                    style={styles.inputs}
                    placeholder="First name"
                    keyboardType="email-address"
                    underlineColorAndroid="transparent"
                    onChangeText={firstname => this.setState({firstname})}
                />
                </View>

                <View style={styles.inputContainer}>
                <Image
                    style={styles.inputIcon}
                    source={{
                    uri:
                        'https://th.seaicons.com/wp-content/uploads/2015/06/Users-User-Male-2-icon.png',
                    }}
                />
                <TextInput
                    style={styles.inputs}
                    placeholder="Last name"
                    keyboardType="email-address"
                    underlineColorAndroid="transparent"
                    onChangeText={lastname => this.setState({lastname})}
                />
                </View>

                <View style={styles.inputContainer}>
                <Image
                    style={styles.inputIcon}
                    source={{
                    uri:
                        'https://img.favpng.com/1/20/13/email-computer-icons-gmail-png-favpng-0eDE1jiptFVC3nzaK2d6zeHEM.jpg',
                    }}
                />
                <TextInput
                    style={styles.inputs}
                    placeholder="Position"
                    keyboardType="email-address"
                    underlineColorAndroid="transparent"
                    onChangeText={position => this.setState({position})}
                />
                </View>

                <TouchableHighlight
                style={[styles.buttonContainer, styles.signupButton]}
                onPress={() => this.onClickListener('sign_up')}>
                <Text style={styles.signUpText}>Sign up</Text>
                </TouchableHighlight>
            </View>
            
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00b5ec',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderBottomWidth: 1,
    width: 400,
    height: 60,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
  },
  signupButton: {
    backgroundColor: '#2C3E50',
  },
  signUpText: {
    color: 'white',
  },
});
