import SwiftUI

struct ContentView: View {
    @StateObject  var viewModel = AuthViewModel()
    var body: some View {
      Group {
        if viewModel.authState != .unauthenticated {
          //
        }
        else {
          LoginView().environmentObject(
            viewModel
          )
        }
      }
    }
}

#Preview {
    ContentView()
}
