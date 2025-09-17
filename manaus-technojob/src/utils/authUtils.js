// src/utils/authUtils.js
export const performLogin = (userType, token, userData) => {
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userType', userType);
  localStorage.setItem('authToken', token);
  localStorage.setItem(`${userType}Data`, JSON.stringify(userData));
  
  // Disparar evento para o Navbar
  window.dispatchEvent(new CustomEvent('authStateChanged'));
};

export const performLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userType');
  localStorage.removeItem('authToken');
  localStorage.removeItem('freelancerData');
  localStorage.removeItem('empresaData');
  
  // Disparar evento para o Navbar
};
  window.dispatchEvent(new CustomEvent('authStateChanged'));