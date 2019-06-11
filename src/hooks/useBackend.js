import { backend as Backend } from "@freesewing/utils";
import { navigate } from "gatsby";

function useBackend(props) {
  const backend = new Backend(process.env.GATSBY_BACKEND);

  const token = props.storageData.token;

  const saveAccountToStorage = (data) => {
    if (data.account) props.updateStorageData(data.account, "account");
    if (data.models) props.updateStorageData(data.models, "models");
    if (data.recipes) props.updateStorageData(data.recipes, "recipes");
    if (data.token) props.updateStorageData(data.token, "token");
  }

  const login = (username, password) => {
    props.startLoading();
    backend
      .login(username, password)
      .then(res => {
        if (res.status === 200) {
          props.stopLoading();
          props.showNotification(
            "success",
            props.intl.formatMessage(
              { id: "app.goodToSeeYouAgain" },
              { user: "@" + res.data.account.username }
            )
          );
          saveAccountToStorage(res.data);
          navigate("/account", {replace: true});
        }
      })
      .catch(err => {
        props.stopLoading();
        console.log(err);
        props.showNotification("error", err);
      });
    };

  const saveAccount = (data, field) => {
    props.startLoading();
    backend
      .saveAccount(data, token)
      .then(res => {
        if (res.status === 200) {
          props.stopLoading();
          props.showNotification(
            "success",
            props.intl.formatMessage(
              { id: "app.fieldSaved" },
              { field: field }
            )
          );
          saveAccountToStorage(res.data);
          navigate("/account/settings", {replace: true});
        }
      })
      .catch(err => {
        props.stopLoading();
        console.log(err);
        props.showNotification("error", err);
      });
    };

  const isUsernameAvailable = (username, setResult) => {
    backend
      .availableUsername({ username })
      .then(res => {
        if (res.status === 200) setResult(true);
        else setResult(false);
      })
      .catch(err => setResult(false));
  };

  const signup = (email, password, language, setResult) => {
    backend
      .signup(email, password, language)
      .then(res => {
        if (res.status === 200) setResult(true);
        else setResult(false, res.data);
      })
      .catch(err => setResult(false, err));
  };

  const exportAccount = () => {
    props.startLoading();
    backend
      .export(token)
      .then(res => {
        props.stopLoading();
        if (res.status === 200) {
          if (typeof window !== "undefined") window.location.href = res.data.export;
        }
      })
      .catch(err => console.log(err));
  };

  const removeAccount = () => {
    props.startLoading();
    backend
      .remove(token)
      .then(res => {
        if (res.status === 200) {
          props.updateStorageData(null, "account");
          props.updateStorageData(null, "models");
          props.updateStorageData(null, "recipes");
          props.updateStorageData(null, "token");
          props.stopLoading();
          props.showNotification(
            "success",
            props.intl.formatMessage(
              { id: "account.accountRemoved" },
            )
          );
          navigate("/", {replace: true});
        }
      })
      .catch(err => console.log(err));
  };

  const logout = username => {
    props.startLoading();
    props.updateStorageData(null, "account");
    props.updateStorageData(null, "models");
    props.updateStorageData(null, "recipes");
    props.updateStorageData(null, "token");
    props.stopLoading();
    props.showNotification(
      "success",
      props.intl.formatMessage(
        { id: "app.seeYouLaterUser" },
        { user: username }
      )
    );
    navigate("/", {replace: true});
  }


  return {
    login,
    logout,
    saveAccount,
    signup,
    exportAccount,
    removeAccount,
    isUsernameAvailable,
  }

}

export default useBackend;
