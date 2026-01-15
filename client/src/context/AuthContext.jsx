import { useReducer, useEffect } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContextDefinition';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload,
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
            };
        case 'REGISTER_FAIL':
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
            };
        default:
            return state;
    }
};

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = async () => {
        if (!localStorage.token) {
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }

        try {
            const res = await api.get('/auth/user');
            dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Register User
    const register = async (formData) => {
        try {
            const res = await api.post('/auth/register', formData);
            dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
            loadUser();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Registration failed';
            dispatch({ type: 'REGISTER_FAIL', payload: msg });
            throw msg;
        }
    };

    // Login User
    const login = async (formData) => {
        try {
            const res = await api.post('/auth/login', formData);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
        } catch (err) {
            const msg = err.response?.data?.msg || 'Login failed';
            dispatch({ type: 'LOGIN_FAIL', payload: msg });
            throw msg;
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
