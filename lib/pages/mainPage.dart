import 'package:casinokenan/widgets/clickyButton.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_glow/flutter_glow.dart';

class MainPage extends StatefulWidget {
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  double height;
  double width;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: MediaQuery.of(context).size.width,
          color: Colors.black,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Padding(
                padding: const EdgeInsets.all(30.0),
                child:ClickyButton(
                  child: Text("Twitch"),
                  onPressed: (){

                  },
                  color: Colors.purple,

                ),
              ),
              Padding(
                padding: const EdgeInsets.all(30.0),
                child:ClickyButton(
                  child: Text("Youtube"),
                  onPressed: (){

                  },
                  color: Colors.red,

                ),
              ),
              Padding(
                padding: const EdgeInsets.all(30.0),
                child:ClickyButton(
                  child: Text("Discord"),
                  onPressed: (){

                  },
                  color: Colors.blueGrey,

                ),
              ),
              Padding(
                padding: const EdgeInsets.all(30.0),
                child:ClickyButton(
                  child: Text("Twitter"),
                  onPressed: (){

                  },
                  color: Colors.cyan,

                ),
              )
            ],
          )),
    );
  }
}
