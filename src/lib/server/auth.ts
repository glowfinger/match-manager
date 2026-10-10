import {
	AUTH_GOOGLE_CLIENT_ID,
	AUTH_GOOGLE_CLIENT_SECRET,
	BETTER_AUTH_SECRET,
} from '$env/static/private';
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
	secret: BETTER_AUTH_SECRET,
	session:{
		expiresIn: 60 * 60 * 24 * 30, 
		updateAge: 60 * 60 * 24,
	},
	socialProviders: {
		google: {
			clientId: AUTH_GOOGLE_CLIENT_ID || '',
			clientSecret: AUTH_GOOGLE_CLIENT_SECRET || '',
		},
	},
});
