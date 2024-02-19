import SwiftUI
import Firebase
@main
struct munchApp: App {
  
  init(){
    FirebaseApp.configure()
  }
    var body: some Scene {
        WindowGroup {
            LoginView()
        }
    }
}
