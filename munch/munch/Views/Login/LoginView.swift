import Firebase
import SwiftUI

struct LoginView: View {
  @EnvironmentObject var viewModel: AuthViewModel
  @Environment(
    \.colorScheme
  ) var colorScheme
  @Environment(
    \.dismiss
  ) var dismiss
  
    //    private func signInWithGoogle() {
    //        Task {
    //            if await viewModel.signInWithGoogle() == true {
    //                dismiss()
    //            }
    //        }
    //    }
  
  var body: some View {
    ZStack {
      Color.primary
      RoundedRectangle(
        cornerRadius: 30,
        style: .continuous
      ).frame(
        width: 1000,
        height: 400,
        alignment: .center
      ).rotationEffect(
        .degrees(
          135
        )
      ).offset(
        y: -35
      )
      
      VStack(
        spacing: 21
      ) {
        Button{
          Task {
            await viewModel.signInWithGoogle()
          }
        } label: {
          Text(
            "Sign in with Google"
          ).bold().frame(
            width: 200,
            height: 40,
            alignment: .center
          ).background(
            RoundedRectangle(
              cornerRadius: 10,
              style: /*@START_MENU_TOKEN@*/ .continuous/*@END_MENU_TOKEN@*/
            ).fill(
              .white
            )
          ).foregroundColor(
            colorScheme == .dark ? .white : .black
          )
        }
        
          //        Button (
          //          action: ){
          //          Text(
          //            "Sign in with Apple"
          //          ).bold().frame(
          //            width: 200,
          //            height: 40,
          //            alignment: .center
          //          ).background(
          //            RoundedRectangle(
          //              cornerRadius: 10,
          //              style: .continuous
          //            )
          //            .fill(
          //              .white
          //            )
          //          ).foregroundColor(
          //            colorScheme == .dark ? .white : .black
          //          )
          //        }
      }
    }.ignoresSafeArea()
  }
}

struct LoginView_Previews: PreviewProvider {
  static var previews: some View {
    LoginView()
  }
}
