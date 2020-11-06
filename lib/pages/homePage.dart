import 'package:casinokenan/blocs/navBarBloc.dart';
import 'package:casinokenan/pages/contentPage.dart';
import 'package:casinokenan/pages/mainPage.dart';
import 'package:casinokenan/pages/tacticsPage.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:line_awesome_flutter/line_awesome_flutter.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  BottomNavBarBloc _bottomNavBarBloc;

  @override
  void initState() {
    // TODO: implement initState
    _bottomNavBarBloc = BottomNavBarBloc();
    super.initState();
  }
  @override
  void dispose() {
    // TODO: implement dispose
    _bottomNavBarBloc.close();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    GlobalKey _curvedKey = GlobalKey();
    return Scaffold(
      resizeToAvoidBottomPadding: false,
      body: StreamBuilder(
        //bloc yapımızı seçimlerden haberdar etmek
        stream: _bottomNavBarBloc.itemStream,
        initialData: _bottomNavBarBloc.defaultItem,
        builder:
        // ignore: missing_return
            (BuildContext context, AsyncSnapshot<NavBarItem> snapshot) {
          switch (snapshot.data) {
            case NavBarItem.MAIN:
              return MainPage();
            case NavBarItem.TACTICS:
              return TacticsPage();
            case NavBarItem.CONTENT:
              return ContentPage();

          }
        },
      ),
      bottomNavigationBar: SafeArea(
        //BottomNavBar'ı telefon ui'ı engellememesi için
        child: StreamBuilder(
          //blocdaki streami dinlemek
            stream: _bottomNavBarBloc.itemStream,
            initialData: _bottomNavBarBloc.defaultItem,
            builder: (context, snapshot) {
              return CurvedNavigationBar(
                key: _curvedKey,
                index: 0,
                height: 50.0,
                items: <Widget>[
                  Icon(LineAwesomeIcons.home,
                      color: Theme.of(context).primaryColor, size: 30),
                  Icon(LineAwesomeIcons.code,
                      color: Theme.of(context).primaryColor, size: 30),
                  Icon(LineAwesomeIcons.user,
                      color: Theme.of(context).primaryColor, size: 30),
                ],
                buttonBackgroundColor: Theme.of(context).accentColor,
                color: Theme.of(context).accentColor,
                backgroundColor: Theme.of(context).primaryColor,
                onTap: (index) {
                  _bottomNavBarBloc.pickItem(index);
                },
              );
            }),
      ),
    );
  }
}
