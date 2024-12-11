import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import {
  bold,
  regular,
  api_url,
  trip_request_details,
  img_url,
  accept,
  reject,
  loader,
  f_l,
  f_m,
  f_xl,
  f_s,
  f_xs,
} from "../config/Constants";
import * as colors from "../assets/css/Colors";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { connect } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import LottieView from "lottie-react-native";
import database from "@react-native-firebase/database";
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from "react-native-dropdownalert";

var Sound = require("react-native-sound");

Sound.setCategory("Playback");

var whoosh = new Sound("uber.mp3", Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log("failed to load the sound", error);
    return;
  }
  // loaded successfully
  console.log(
    "duration in seconds: " +
      whoosh.getDuration() +
      "number of channels: " +
      whoosh.getNumberOfChannels()
  );
});

const BookingRequest = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [trip_id, setTripId] = useState(route.params.trip_id);
  const [data, setData] = useState("");
  const [disabled, setdisabled] = useState(false);

  let dropDownAlertRef = useRef(
    (_data?: DropdownAlertData) =>
      new Promise() < DropdownAlertData > ((res) => res)
  );

  const vehicle_type = route.params.vehicle_type;

  useEffect(() => {
    call_trip_request_details();
    const onValueChange = database()
      .ref(`/drivers/${vehicle_type}/${global.id}`)
      .on("value", (snapshot) => {
        console.log("snapBookReq", snapshot.val());

        if (snapshot.val()?.booking?.booking_id === 0) {
          whoosh.stop();
          setdisabled(true);
          dropDownAlertRef({
            type: DropdownAlertType.Info,
            title: "Cancelled",
            message: "Your trip has been cancelled!",
          });
          setTimeout(() => {
            navigate();
          }, 1500);
        }
      });

    whoosh.play();
    whoosh.setNumberOfLoops(-1);

    const _unblur = navigation.addListener("blur", async () => {
      whoosh.stop();
    });

    // Cleanup function to remove the listener
    return () => {
      database()
        .ref(`/drivers/${vehicle_type}/${global.id}`)
        .off("value", onValueChange);
      _unblur();
      whoosh.stop();
    };
  }, [vehicle_type]);

  const call_trip_request_details = async () => {
    await axios({
      method: "post",
      url: api_url + trip_request_details,
      data: { trip_request_id: trip_id },
    })
      .then(async (response) => {
        setData(response.data.result);
      })
      .catch((error) => {});
  };

  const call_accept = async () => {
    console.log("gID", global.id, trip_id);

    setLoading(true);
    await axios({
      method: "post",
      url: api_url + accept,
      data: { trip_id: trip_id, driver_id: global.id },
    })
      .then(async (response) => {
        setLoading(false);
        whoosh.stop();
        navigate();
      })
      .catch((error) => {
        console.log("booking error", error);

        setLoading(false);
      });
  };

  const call_reject = async () => {
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + reject,
      data: { trip_id: trip_id, driver_id: global.id, from: 1 },
    })
      .then(async (response) => {
        setLoading(false);
        whoosh.stop();
        navigate();
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const navigate = () => {
    navigation.goBack();
  };

  return (
    // <TouchableOpacity activeOpacity={1} onPress={call_accept.bind(this)}>
    <View>
      <StatusBar backgroundColor={colors.theme_bg} />
      {loading == false ? (
        <View>
          <View style={styles.header}>
            <Text
              style={{
                color: colors.theme_fg_three,
                fontFamily: bold,
                fontSize: f_l,
              }}
            >
              Hi! New booking arrived
            </Text>
          </View>
          <View style={styles.container}>
            <Text
              style={{
                fontSize: f_xl,
                color: colors.theme_fg,
                fontFamily: bold,
              }}
            >
              Pickup Location
            </Text>
            <View style={{ margin: 5 }} />
            <Text
              style={{
                fontSize: f_s,
                color: colors.theme_fg_two,
                fontFamily: regular,
              }}
            >
              {data?.pickup_address}
            </Text>
            <View style={{ margin: 10 }} />
            <CountdownCircleTimer
              // isPlaying={1}
              duration={30}
              colors={[colors.theme_bg]}
              onComplete={() => {
                call_reject();
              }}
            >
              {() => (
                <Image
                  source={{ uri: img_url + data.static_map }}
                  style={{ height: 160, width: 160, borderRadius: 80 }}
                />
              )}
            </CountdownCircleTimer>
            <Text
              style={{
                color: "#000",
                textAlign: "center",
                width: "80%",
                marginTop: 10,
              }}
            >
              The ride will be automatically canceled if not accepted within 30
              seconds of the booking.
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginHorizontal: 24,
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={call_accept}
                disabled={disabled}
                activeOpacity={1}
                style={{
                  width: "55%",
                  backgroundColor: colors.btn_color,
                  borderRadius: 10,
                  height: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: f_m,
                    // color: colors.error,
                    fontFamily: bold,
                  }}
                >
                  Accept
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={call_reject}
                disabled={disabled}
                activeOpacity={1}
                style={{
                  width: "55%",
                  backgroundColor: colors.btn_color,
                  borderRadius: 10,
                  height: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: f_m,
                    // color: colors.error,
                    fontFamily: bold,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ margin: 10 }} />
            <Text
              style={{
                fontSize: f_xl,
                color: colors.theme_fg,
                fontFamily: bold,
              }}
            >
              Drop Location
            </Text>
            <View style={{ margin: 5 }} />
            <Text
              style={{
                fontSize: f_s,
                color: colors.theme_fg_two,
                fontFamily: regular,
              }}
            >
              {data?.drop_address}
            </Text>
            <View style={{ margin: 10 }} />
            <View
              style={{
                borderColor: colors.theme_fg_two,
                borderWidth: 0.5,
                width: "80%",
              }}
            />
            <View style={{ margin: 10 }} />
            <Text
              style={{
                fontSize: f_xl,
                color: colors.theme_fg_two,
                fontFamily: bold,
              }}
            >
              {data.trip_type_name}
            </Text>
            <Text
              style={{
                fontSize: f_xl,
                color: colors.theme_fg_two,
                fontFamily: bold,
              }}
            >
              {global.currency}
              {data.total}
            </Text>
            <Text
              style={{
                fontSize: f_xs,
                color: colors.theme_fg_two,
                fontFamily: bold,
              }}
            >
              Estimated Fare
            </Text>
          </View>
          <View style={styles.footer}>
            <Text
              style={{
                color: colors.theme_fg_three,
                fontFamily: bold,
                fontSize: f_xl,
              }}
            >
              {data?.first_name}
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={{
            height: "100%",
            width: "100%",
            alignSelf: "center",
            justifyContent: "center",
          }}
        >
          <LottieView style={{ flex: 1 }} source={loader} autoPlay loop />
        </View>
      )}
      <DropdownAlert alert={(func) => (dropDownAlertRef = func)} />
    </View>
    // </TouchableOpacity>
  );
};

export default connect(null, null)(BookingRequest);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.theme_bg_three,
    height: "86%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  header: {
    backgroundColor: colors.theme_bg,
    alignItems: "center",
    justifyContent: "center",
    height: "7%",
  },
  footer: {
    backgroundColor: colors.theme_bg,
    alignItems: "center",
    justifyContent: "center",
    height: "7%",
  },
});
