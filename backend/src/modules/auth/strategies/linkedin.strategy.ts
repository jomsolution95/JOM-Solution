import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || 'PLACEHOLDER_ID',
            clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'PLACEHOLDER_SECRET',
            callbackURL: `${configService.get<string>('BASE_URL')}/api/auth/linkedin/callback`,
            scope: ['r_emailaddress', 'r_liteprofile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
        const { emails, id, name } = profile;
        const user = await this.authService.validateSocialLogin({
            email: emails[0].value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            provider: 'linkedin',
            providerId: id
        });
        done(null, user);
    }
}
