import Firebase
import FirebaseAuth
import FirebaseCore
import Foundation
import GoogleSignIn
import GoogleSignInSwift

enum AuthState {
    case unauthenticated
    case authenticating
    case authenticated
}

enum AuthError: Error {
    case tokenError(message: String)
}

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isValid: Bool = false
    @Published var authState: AuthState = .unauthenticated
    @Published var errMsg: String = ""
    @Published var user: User?
    @Published var displayName: String = ""

    init() {
      registerAuthStateHandler()
    }

    private var authStateHandler: AuthStateDidChangeListenerHandle?
    func registerAuthStateHandler() {
        if authStateHandler == nil {
            authStateHandler = Auth.auth().addStateDidChangeListener {
                _, user in
                self.user = user
                self.authState = user == nil ? .unauthenticated : .authenticated
                self.displayName = user?.displayName ?? ""
            }
        }
    }

    func signOut() {
        do {
            try Auth.auth().signOut()
        } catch {
            print(error)
            errMsg = error.localizedDescription
        }
    }

    func deleteAccount() async -> Bool {
        do {
            try await user?.delete()
        } catch {
            errMsg = error.localizedDescription
            return false
        }

        return true
    }
}

extension AuthViewModel {
    func signInWithGoogle() async -> Bool {
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            print("No clientID found in firebase")
            return false
//      fatalError(
//        "No client ID found in Firebase configuration"
//      )
        }

        let config = GIDConfiguration(
            clientID: clientID
        )
        GIDSignIn.sharedInstance.configuration = config
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootViewController = window.rootViewController
        else {
            print("There is no root view controller")
            return false
        }

        do {
            let userAuth = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)

            let user = userAuth.user
            guard let idToken = user.idToken else { throw AuthError.tokenError(message: "ID token missing") }
            let accessToken = user.accessToken

            let credential = GoogleAuthProvider.credential(withIDToken: idToken.tokenString, accessToken: accessToken.tokenString)

            let result = try await Auth.auth().signIn(with: credential)
            let firebaseUser = result.user

            print("User \(firebaseUser.uid) signed in")
            return true
        } catch {
            print(error.localizedDescription)
            errMsg = error.localizedDescription
            return false
        }
    }
}
