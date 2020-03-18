
import React, { Component } from 'react';
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
  Button
} from 'react-native';

import db from './firebase';
import {decode, encode} from 'base-64'

if (!global.btoa) {  global.btoa = encode }

if (!global.atob) { global.atob = decode }

export default class testfb extends Component{
    fecthUser = (objToken) => {
        console.log("fetchUser");
        console.log(typeof(objToken));
        
        
        let MemberRef = db.collection('Member');
        // console.log(MemberRef);
        
        MemberRef.where('ObjectToken', '==', objToken).get()
          .then(snapshot => {
            
            let data = [];
    
            if (snapshot.empty) {
              console.log('No matching documents.');
            } else {
              snapshot.forEach(doc => {
                console.log(doc.data());
                
                if (doc.exists) {
                //   data.push(doc.data());
                //   this.setState({ datalist: [...data] });
                  console.log("success");
                  
                  
                  
                  // this._showModal();
                } else {
                  console.log("Data empty");
                }
              });
            }
          })
          .catch(err => {
            console.log('Error getting documents', err);
          });
      }

    render(){
        return(
            <View style= {{justifyContent:'center',alignContent:'center'}}>
                <Button
                    title="Press me"
                    onPress={() => this.fecthUser('D4CFE546-C67F-4BB3-B5FA-F3DD32443201')}
                />
            </View>
        )
    }
}