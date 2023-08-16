import config from "@/config";
import ApiService from "@/services/ApiService";

const state = {
  users: [],
  isAuth: false,
  me: {},
  logining: false,
  isAdmin: false,
  token: localStorage.getItem("token") | ""
};
const getters = {
  getIsAuth(state) {
    return state.isAuth;
  },
  getIsAdmin(state) {
    return state.isAdmin;
  },
  getUsers(state) {
    return state.users;
  },
  getMe(state) {
    return state.me;
  },
  getLogining(state) {
    return state.logining;
  }
};
const actions = {
  getUsers({ commit }) {
    ApiService.getUsers().then(response => {
      commit("setUsers", response);
    });
  },
  deleteUser({ commit, dispatch }, credentials) {
    ApiService.deleteUser(credentials)
      .then(() => {
        {
          commit("setSnackText", "Пользователь удален", {
            root: true
          });
          dispatch("getUsers");
        }
      })
      .catch(error => {
        console.error(error);
        commit("setLogining", true);
        commit("setSnackText", "Возникла ошибка", {
          root: true
        });
      });
  },

  updateUser({ commit, dispatch, rootState }, credentials) {
    if (rootState.users.me._id) {
      ApiService.updateUsers({
        id: rootState.users.me._id,
        data: credentials
      })
        .then(() => {
          {
            // commit("setSnackText", "Пользователь обновлен", {
            //   root: true
            // });
          }
          dispatch("getUsers");
        })
        .catch(error => {
          console.error(error);
          commit("setLogining", true);
          commit("setSnackText", "Возникла ошибка", {
            root: true
          });
        });
    } else {
      console.log("cred", credentials);
      ApiService.updateUsers({
        id: credentials.id,
        data: credentials.data
      })
        .then(() => {
          {
            commit("setSnackText", "Пользователь обновлен добавлен", {
              root: true
            });
            dispatch("getUsers");
          }
        })
        .catch(error => {
          console.error(error);
          commit("setLogining", true);
          commit("setSnackText", "Возникла ошибка", {
            root: true
          });
        });
    }
  },
  loginAdmin({ commit }, credentials) {
    console.log("tokem", config.token);
    if (
      config.admin == credentials.username &&
      config.password == credentials.password
    ) {
      console.log("setAdminTrue");
      commit("setIsAdmin", true);
      localStorage.setItem("admin-token", config.token);
    } else {
      commit("setIsAdmin", false);
    }
  },
  login({ commit }, credentials) {
    commit("setLogining", true);
    ApiService.login(credentials)
      .then(response => {
        commit("setMe", response.data.user);
        commit("setToken", response.data.accessToken);
        commit("setIsAuth", true);
        commit("setLogining", false);
      })
      .catch(error => {
        console.log("qwe", error.response.data.message);
        commit("setLogining", true);
        // if(error.response.data.message){
        commit("setSnackText", error.response.data.message, {
          root: true
        });
      });
  },
  logout({ commit, state }) {
    commit("logout");
    ApiService.logout(state.user._id)
      .then(() => {
        commit("logout");
      })
      .catch(error => {
        console.error(error);
        commit("setSnackText", "Возникла ошибка", {
          root: true
        });
      });
  },
  approveEmail({ commit }, email) {
    ApiService.approveEmail(email)
      .then(() => {
        console.log("approved");
      })
      .catch(error => {
        console.error(error);
        commit("setSnackText", "Возникла ошибка", {
          root: true
        });
      });
  },
  registration({ commit }, payload) {
    console.log("payload", payload);
    ApiService.checkEmail(payload.email).then(resp => {
      console.log("resp.data.email_free", resp.data.email_free);
      if (resp.data.email_free) {
        ApiService.postUser(payload.data)
          .then(() => {
            commit(
              "setSnackText",
              "Дякуємо за реєстрацію! Для підтвердження пошти перейдіть за посиланням з листа, яку отримали після реєстрації.",
              {
                root: true
              }
            );
          })
          .catch(error => {
            console.error(error);
            commit("setSnackText", "Возникла ошибка", {
              root: true
            });
          });
      } else {
        commit("setSnackText", "email занят", {
          root: true
        });
      }
    });
  },
  getMe({ commit }) {
    ApiService.getMe()
      .then(resp => {
        console.log("setMe", resp.data.user);
        commit("setMe", resp.data.user);
        commit("setIsAuth", true);
      })
      .catch(error => {
        console.error(error);
        commit("setSnackText", "Возникла ошибка", {
          root: true
        });
      });
  }
};

const mutations = {
  setUsers(state, payload) {
    state.users = payload.data.users;
  },
  setMe(state, payload) {
    console.log("setMe", payload);
    state.me = payload;
  },

  setIsAuth(state, payload) {
    state.isAuth = payload;
  },
  setIsAdmin(state, payload) {
    state.isAdmin = payload;
  },
  setToken(state, token) {
    state.token = token;
    localStorage.setItem("token", token);
  },
  setLogining(state, payload) {
    state.logining = payload;
  },
  logout(state) {
    localStorage.removeItem("token");
    state.token = "";
    state.isAuth = false;
    state.me = {};
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
