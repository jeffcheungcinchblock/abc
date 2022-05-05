import { RootState, store } from "@/Store";
import { showSnackbar } from "@/Store/UI/actions";
import { logout } from "@/Store/Users/actions";
import { Auth } from "aws-amplify";
import { useSelector } from "react-redux";
export const validateEmail = (email : string) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

let showSnackbarTimeout : any = null
export const triggerSnackbar = (textMsg: string, autoHidingTime = 1500) => {

    let snackBarConfig = {
        visible: true,
        textMessage: textMsg,
        autoHidingTime
    }
    const {ui} = store.getState()
    const stateSnackBarConfig = ui.snackBarConfig
    if(!stateSnackBarConfig.visible){
        clearTimeout(showSnackbarTimeout)
    }
    store.dispatch(showSnackbar(snackBarConfig))

    showSnackbarTimeout = setTimeout(() => {
        store.dispatch(showSnackbar({
            visible: false,
            textMessage: "",
            autoHidingTime
        }))
    }, autoHidingTime)
}

export const awsLogout = async() => {
    try{
        await Auth.signOut({ global: true })
    }catch(err){    
        console.log('Error ', err)
    }finally{
        store.dispatch(logout())
    }
}