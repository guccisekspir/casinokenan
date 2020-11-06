import 'dart:async';

enum NavBarItem { MAIN, TACTICS, CONTENT}

class BottomNavBarBloc {
  final StreamController<NavBarItem> _navBarController =
  StreamController<NavBarItem>.broadcast();

  NavBarItem defaultItem = NavBarItem.MAIN;

  Stream<NavBarItem> get itemStream => _navBarController.stream;

  void pickItem(int i) {
    switch (i) {
      case 0:
        _navBarController.sink.add(NavBarItem.MAIN);
        break;
      case 1:
        _navBarController.sink.add(NavBarItem.TACTICS);
        break;
      case 2:
        _navBarController.sink.add(NavBarItem.CONTENT);
        break;
    }
  }

  close() {
    _navBarController?.close();
  }
}
