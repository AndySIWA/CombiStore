# CombiStore

CombiStore is a React Native application developed with Expo in TypeScript. It provides a native, fluid interface for aggregating mini web apps (single‑page HTML applications) into a store format with customizable categories. Users can
- add or remove mini apps via URL
- import or delete mini apps using an HTML file
- personalize categories to organize their store

The project follows modern patterns with context providers, custom hooks, and a streamlined UI.

## 🚀 Getting Started

### Prerequisites
- Node.js (>= 14)
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`)

### Installation
```bash
# clone the repository
git clone https://github.com/AndySIWA/CombiStore.git
cd CombiStore

# install dependencies
npm install # or yarn install
```

### Running the App
```bash
# start expo development server
npm start # or yarn start
```

For Android/iOS, follow the Expo instructions in the terminal.

### Building
Use the Expo build tools or EAS to compile for production:
```bash
expo build:android
expo build:ios
# or with EAS
eas build --platform android
``` 

## 🧩 Project Structure

- `app/` and `src/` contain application code
- `components/`, `context/`, `hooks/`, `constants/`, `types/` organize features
- `android/` holds native Android configuration

## 📦 Dependencies
Key technologies include:
- React Native & Expo
- TypeScript
- React Context APIs

## ✅ Features
- Category management
- App browsing and details
- Theme switching with context

## 📄 License
This project is licensed under the MIT License.

## 📫 Contributing
Feel free to open issues or submit pull requests.

---
*Created by [AndySIWA](https://github.com/AndySIWA)*
