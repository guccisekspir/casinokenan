import 'package:casinokenan/helpers/notificationHelper.dart';
import 'package:flutter/material.dart';

import 'homePage.dart';


class LandPage extends StatefulWidget {
  @override
  _LandPageState createState() => _LandPageState();
}

class _LandPageState extends State<LandPage> {

  bool isMis=true;
  @override
  void initState() {
    // TODO: implement initState
    NotificationHelper().initializeFCMNotification(context);
    super.initState();
  }
  @override
  Widget build(BuildContext context) {


    if(isMis){
      return HomePage();
    }else{
      return Container();
    }

  }
}
