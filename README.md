## Music App

This is a work in progress music application for School.

---

## Development

1.  Clone this repository:

    ```bash
    git clone https://github.com/AndreSmalheer/music-app.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd music-app
    ```

3.  Install dependencies:

    ```bash
    npm install
    ```

4.  Run the development server:

    ```bash
    npm run dev
    ```

---

### Running on iOS Simulator

1.  Build the project:

    ```bash
    npm run build
    ```

2.  Sync the changes with cap

    ```bash
    npx cap sync
    ```

3.  Open the simulator with CapStart:

    ```bash
    npx cap open ios
    ```

4.  Configure Signing and Capabilities:
    - Modify signing certificates and provisioning profiles within your Xcode setup to add a development team.

---

### Exporting to IPA App

1.  Navigate to the iOS project directory:

    ```bash
    cd ios/App
    ```

2.  Build the Release version:

    ```bash
    xcodebuild \
      -project App.xcodeproj \
      -scheme App \
      -configuration Release \
      -derivedDataPath build \
      CODE_SIGNING_ALLOWED=NO \
      build
    ```

3.  Create Payload directory:

    ```bash
    mdkir Payload
    ```

4.  Copy the built app to the Payload directory:

    ```bash
    cp -R build/Build/Products/Release-iphoneo/App.app Payload/
    ```

5.  Create the IPA file:

    ```bash
    zip -r App.ipa Payload
    ```
