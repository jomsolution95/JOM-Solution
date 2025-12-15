import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>('FACEBOOK_APP_ID') || 'PLACEHOLDER_ID',
            clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'PLACEHOLDER_SECRET',
            callbackURL: `${configService.get<string>('BASE_URL') || 'http://localhost:3005'}/api/auth/facebook/callback`,
            scope: ['email', 'public_profile'],
            profileFields: ['emails', 'name'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
        const { name, emails, id } = profile;
        // Facebook might not provide email if user signed up with phone, but assuming email scope requests it
        const email = emails && emails[0] ? emails[0].value : `${id}@facebook.placeholder`;

        const user = await this.authService.validateSocialLogin({
            email: email,
            firstName: name.givenName,
            lastName: name.familyName,
            provider: 'facebook',
            providerId: id
        });
        done(null, user);
    }
}
