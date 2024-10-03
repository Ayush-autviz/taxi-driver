//Fixed
import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { screenHeight, screenWidth, bold, api_url, regular, f_25, f_s, GOOGLE_KEY, normal, gth_location_change, loader } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DropShadow from "react-native-drop-shadow";
import axios from 'axios';
import LottieView from 'lottie-react-native';

const SelectGthLocation = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const search = useRef();
  const [loading, setLoading] = useState(false);

  const go_back = () => {
    navigation.goBack();
  }

  const get_location = (data, details, type) => {
    setLoading(true)
    console.log({ gth_lat: details.geometry.location.lat, gth_lng: details.geometry.location.lng, gth_location: data.description, driver_id: global.id })
    axios({
      method: 'post',
      url: api_url + gth_location_change,
      data: { gth_lat: details.geometry.location.lat, gth_lng: details.geometry.location.lng, gth_location: data.description, driver_id: global.id }
    })
      .then(async response => {
        setLoading(false)
        go_back();
      })
      .catch(error => {
        setLoading(false)
        alert(error)
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <View style={[styles.header]}>
        <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
          <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
        </TouchableOpacity>
      </View>
      <ScrollView keyboardShouldPersistTaps='always'>
        <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 }}>
          <Text ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_25, fontFamily: bold }}>Enter Location</Text>
        </View>
        <View style={{ margin: 10 }} />
        <View>
          <DropShadow
            style={{
              width: '90%',
              marginLeft: '5%',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 5,
            }}
          >
            <View style={{ borderRadius: 10, backgroundColor: colors.theme_bg_three }}>
              <GooglePlacesAutocomplete
                ref={search}
                minLength={2}
                placeholder={"Search..."}
                listViewDisplayed='auto'
                fetchDetails={true}
                GooglePlacesSearchQuery={{
                  rankby: 'distance',
                  types: 'food'
                }}
                debounce={200}
                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
                textInputProps={{
                  placeholderTextColor: colors.text_grey,
                  returnKeyType: "search"
                }}
                styles={{
                  textInputContainer: {
                    backgroundColor: colors.theme_bg_three,
                    borderRadius: 10,
                  },
                  description: {
                    color: '#000'
                  },
                  textInput: {
                    height: 45,
                    color: colors.theme_fg_two,
                    fontFamily: normal,
                    fontSize: 14,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10
                  },
                  predefinedPlacesDescription: {
                    color: colors.theme_fg_two,
                  }
                }}
                currentLocation={true}
                enableHighAccuracyLocation={true}
                onPress={(data, details = null) => {
                  get_location(data, details);
                }}
                query={{
                  key: GOOGLE_KEY,
                  language: 'en',
                  radius: '1500',
                  types: ['geocode', 'address']
                }}
              />
            </View>
          </DropShadow>
          <View style={{ margin: 10 }} />
        </View>
        {loading == true &&
          <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
            <LottieView style={{flex: 1}} source={loader} autoPlay loop />
          </View>
        }
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: screenHeight,
    width: screenWidth,
    backgroundColor: colors.theme
  },
  header: {
    height: 60,
    backgroundColor: colors.lite_bg,
    flexDirection: 'row',
    alignItems: 'center'
  },
});

export default SelectGthLocation;