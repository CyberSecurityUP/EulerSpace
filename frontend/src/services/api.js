import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
});

// Math Engine
export const solveMath = (equation, variable = 'x') =>
  api.post('/math/solve', { equation, variable });

export const differentiateMath = (expression, variable = 'x', order = 1) =>
  api.post('/math/differentiate', { expression, variable, order });

export const integrateMath = (expression, variable = 'x', lower = null, upper = null) =>
  api.post('/math/integrate', { expression, variable, lower, upper });

export const simplifyMath = (expression) =>
  api.post('/math/simplify', { expression });

export const limitMath = (expression, variable = 'x', point = 'oo') =>
  api.post('/math/limit', { expression, variable, point });

export const seriesMath = (expression, variable = 'x', point = '0', order = 6) =>
  api.post('/math/series', { expression, variable, point, order });

export const plotMath = (expression, variable = 'x', x_min = -10, x_max = 10) =>
  api.post('/math/plot', { expression, variable, x_min, x_max });

export const matrixMath = (matrix, operation) =>
  api.post('/math/matrix', { matrix, operation });

// Physics
export const simulateProjectile = (v0, angle, g = 9.81) =>
  api.post('/physics/projectile', { v0, angle, g });

export const simulateSHM = (amplitude, omega, phi = 0, t_max = 10) =>
  api.post('/physics/shm', { amplitude, omega, phi, t_max });

export const simulatePendulum = (length, theta0, g = 9.81, t_max = 10) =>
  api.post('/physics/pendulum', { length, theta0, g, t_max });

export const simulateWave = (length = 1, c = 1, n_modes = 5) =>
  api.post('/physics/wave', { length, c, n_modes });

export const simulateElectricField = (charges) =>
  api.post('/physics/electric-field', { charges });

export const simulateOrbital = (params = {}) =>
  api.post('/physics/orbital', params);

// AI
export const explainMath = (expression, operation, variable = 'x') =>
  api.post('/ai/explain', { expression, operation, variable });

export const getExercises = (topic, difficulty = 'medium', count = 5) =>
  api.post('/ai/exercises', { topic, difficulty, count });

export const validateProof = (claim, justification = '') =>
  api.post('/ai/validate-proof', { claim, justification });

export default api;
