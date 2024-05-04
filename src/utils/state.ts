type State = {
  dbConnection: globalThis.Realm.Services.MongoDB;
};

class AppState {
  appState: State = null;
  constructor() {
    this.appState = {
      dbConnection: null,
    };
  }

  setDbConnection(db: globalThis.Realm.Services.MongoDB) {
    this.appState = { ...this.appState, dbConnection: db };
  }

  getDbConnection(): globalThis.Realm.Services.MongoDB {
    return this.appState.dbConnection;
  }
}

export default new AppState();
