import { apiClient } from './apiClient';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload
} from '../types/auth';

const BASE_PATH = '/auth';

export const login = (payload: LoginPayload) =>
  apiClient.post<AuthResponse>(`${BASE_PATH}/login`, payload);

export const register = (payload: RegisterPayload) =>
  apiClient.post<AuthResponse>(`${BASE_PATH}/register`, payload);

