export const logoutUser = () => {
	localStorage.removeItem('wistala');
	localStorage.removeItem('authUser');
	localStorage.clear();
};
