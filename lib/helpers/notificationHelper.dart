

import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io' show Platform;

Future<dynamic> myBackgroundMessageHandler(Map<String, dynamic> message) async {
  if (message.containsKey('data')) {
    // Handle data message
    final dynamic  data = message['data'];
    debugPrint("background tetiklendi"+data.toString());
    debugPrint("bububububu "+data['payload']);
    Platform.isAndroid?NotificationHelper.showNotification(message):NotificationHelper.onDidReceiveLocalNotification(1, message["data"]["title"], message["data"]["message"], jsonEncode(message));
    
  }


  // Or do other work.
}

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
FlutterLocalNotificationsPlugin();

class NotificationHelper{

  final FirebaseMessaging _firebaseMessaging=FirebaseMessaging();

  static final NotificationHelper singleton=NotificationHelper._internal();
  factory NotificationHelper(){
    return singleton;
  }

  NotificationHelper._internal();

  initializeFCMNotification(BuildContext context)async{
    debugPrint("aaaaa geldi");


    try {
      const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('app_icon');

      /// Note: permissions aren't requested here just to demonstrate that can be
      /// done later
      final IOSInitializationSettings initializationSettingsIOS =
      IOSInitializationSettings(

        onDidReceiveLocalNotification: onDidReceiveLocalNotification,
          requestAlertPermission: false,
          requestBadgePermission: false,
          requestSoundPermission: false,
          );
      final InitializationSettings initializationSettings = InitializationSettings(
          android: initializationSettingsAndroid,
          iOS: initializationSettingsIOS);
      await flutterLocalNotificationsPlugin.initialize(initializationSettings,
          onSelectNotification: onSelectNotification);


    } catch(e) {
      print(e.toString());
    }




    _firebaseMessaging.subscribeToTopic("eben");

    _firebaseMessaging.configure(
        onMessage: (Map<String,dynamic> message)async{
          debugPrint("onmessage tetiklendi $message");
          Platform.isAndroid?showNotification(message):onDidReceiveLocalNotification(1, message["title"], message["message"], jsonEncode(message));


        },
        onLaunch: (Map<String,dynamic> message)async{
          Platform.isAndroid?showNotification(message):onDidReceiveLocalNotification(1, message["title"], message["message"], jsonEncode(message));

        },
        onResume: (Map<String,dynamic> message)async{
          Platform.isAndroid?showNotification(message):onDidReceiveLocalNotification(1, message["title"], message["message"], jsonEncode(message));

        },
        onBackgroundMessage:myBackgroundMessageHandler
    );

  }


  static Future<void> showNotification(Map<String,dynamic > message) async {

    if(Platform.isAndroid){

      debugPrint("oluyo mu bati");
      const AndroidNotificationDetails androidPlatformChannelSpecifics =
      AndroidNotificationDetails(
          '123', 'deneme', 'deneme casino',
          importance: Importance.max,
          priority: Priority.high,
          color: Colors.purpleAccent,
          ticker: 'ticker');
      const NotificationDetails platformChannelSpecifics =
      NotificationDetails(android: androidPlatformChannelSpecifics);
      await flutterLocalNotificationsPlugin.show(
          0, message["data"]["title"], message["data"]["message"], platformChannelSpecifics,
          payload: jsonEncode(message));

    }else{
      debugPrint("buraya geliyo");
      const IOSNotificationDetails iOSPlatformChannelSpecifics =
      IOSNotificationDetails();
      const NotificationDetails platformChannelSpecifics = NotificationDetails(
          iOS: iOSPlatformChannelSpecifics);
      await flutterLocalNotificationsPlugin.show(
          0,
          "ne alaka",
          "amk",
          platformChannelSpecifics,
          payload: jsonEncode(message));

    }

  }


  static Future<void> onDidReceiveLocalNotification(int id, String title, String body, String payload) async{
    debugPrint("ondide geliyo");
    const IOSNotificationDetails iOSPlatformChannelSpecifics =
    IOSNotificationDetails();
    const MacOSNotificationDetails macOSPlatformChannelSpecifics =
    MacOSNotificationDetails(subtitle: 'the subtitle');
    const NotificationDetails platformChannelSpecifics = NotificationDetails(
        iOS: iOSPlatformChannelSpecifics, macOS: macOSPlatformChannelSpecifics);
    await flutterLocalNotificationsPlugin.show(
        0,
        title,
        body,
        platformChannelSpecifics,
        payload: payload);
  }



  Future onSelectNotification(String payload)async {

    if(payload!=null){
      Map<String,dynamic> clicked =await jsonDecode(payload);
      if(clicked["data"]["fromm"].toString()=="1"){
        launch("twitch://open?stream=casinokenantv");
        debugPrint("bu tiviç");
      }
      else if(clicked["data"]["fromm"].toString()=="2"){
        if(await canLaunch('https://www.youtube.com/watch?v=opJLR_nbtyE')){
    launch('https://www.youtube.com/watch?v=opJLR_nbtyE',forceSafariVC: false,forceWebView: false);

    }
    }
    debugPrint("payload "+payload);
    }else{
    debugPrint("Ne alaka aq");
    }
  }
}