import 'isomorphic-fetch';

import {cookies, checkStatus, parseJSON} from '../utils';

export const FETCH_PROFILE_REQUEST = 'FETCH_PROFILE_REQUEST';
export const FETCH_PROFILE_SUCCESS = 'FETCH_PROFILE_SUCCESS';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

function saveToken(token){
    if (token === undefined) return;

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    cookies.set({name: 'token', value: token, expires});
}

export function fetchProfile() {
    let token = cookies.get('token');

    if (token === undefined) {
        return {type: 'TOKEN_NOT_FOUND'};
    }
    return dispatch => {

        return fetch('/api/my?token=' + token, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        .then(checkStatus)
        .then(parseJSON)
        .then(json => dispatch(loginSuccess(json)));
    }
}

function loginRequest(user) {
    return {
        type: LOGIN_REQUEST,
    };
}

function loginSuccess(res) {
    saveToken(res.access_token);

    return {
        type: LOGIN_SUCCESS,
        user: res.user
    };
}

function loginFailure(errors) {

    return {
        type: LOGIN_FAILURE,
        errors: errors
    };
}

export function login(username, password) {
    return (dispatch, getState) => {
        dispatch(loginRequest());

        return fetch('/api/login', {
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        })
        .then(checkStatus)
        .then(parseJSON)
        .then(json => dispatch(loginSuccess(json)))
        .catch((errors) => {
            const response = errors.response;

            if (response === undefined) {
                dispatch(loginFailure(errors));
            } else {
                parseJSON(response).then( (json) => {
                    dispatch(loginFailure(json.errors));
                });
            }
         });
    };
}

export function logout() {
    cookies.unset('token');

    return {
        type: LOGOUT_SUCCESS
    }
}