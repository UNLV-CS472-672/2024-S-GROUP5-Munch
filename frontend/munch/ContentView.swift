import SwiftUI
import Firebase

struct LoginView: View {
  var body: some View {
    ZStack{
      Color.primary
      RoundedRectangle(
        cornerRadius: 30,
        style: .continuous
      )
      .frame(
        width: 1000,
        height: 400,
        alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/
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

        }label:  {
          Text(
            "Sign in with Google"
          ).bold().frame(
            width: 200,
            height: 40,
            alignment: .center
          ).background(
            RoundedRectangle(
              cornerRadius: 10,
              style: /*@START_MENU_TOKEN@*/.continuous/*@END_MENU_TOKEN@*/
            ).fill(
              .white
            )
          ).foregroundColor(
            .blue)}

        Button {
            //sign in apple
        } label: {
          Text("Sign in with Apple").bold().frame(
            width: 200,
            height: 40,
            alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/
          ).background(
            RoundedRectangle(
              cornerRadius: 10,
              style: /*@START_MENU_TOKEN@*/.continuous/*@END_MENU_TOKEN@*/
            ).fill(.white).foregroundColor(
              .blue
            )
          )
        }
      }
    }
    .ignoresSafeArea()
  }

  func login(){
    Auth.auth()
  }
}
#Preview {
  LoginView()
}
