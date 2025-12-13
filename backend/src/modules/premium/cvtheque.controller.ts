import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CVthequeService } from './services/cvtheque.service';
import { SearchCVDto, AddFavoriteDto, UpdateNotesDto } from './dto/search-cv.dto';

@Controller('cvtheque')
@UseGuards(JwtAuthGuard)
export class CVthequeController {
    constructor(private readonly cvthequeService: CVthequeService) { }

    /**
     * Search profiles in CVthèque
     */
    @Get('search')
    async searchProfiles(@Request() req: any, @Query() dto: SearchCVDto) {
        const result = await this.cvthequeService.searchProfiles(req.user.userId, dto);
        return result;
    }

    /**
     * View a profile (increments quota)
     */
    @Post('view/:profileId')
    async viewProfile(@Request() req: any, @Param('profileId') profileId: string) {
        const result = await this.cvthequeService.viewProfile(req.user.userId, profileId);
        return result;
    }

    /**
     * Add profile to favorites
     */
    @Post('favorites')
    async addFavorite(@Request() req: any, @Body() dto: AddFavoriteDto) {
        const favorite = await this.cvthequeService.addFavorite(
            req.user.userId,
            dto.profileId,
            dto.notes,
        );
        return { favorite };
    }

    /**
     * Remove from favorites
     */
    @Delete('favorites/:profileId')
    async removeFavorite(@Request() req: any, @Param('profileId') profileId: string) {
        await this.cvthequeService.removeFavorite(req.user.userId, profileId);
        return { removed: true };
    }

    /**
     * Get favorites
     */
    @Get('favorites')
    async getFavorites(@Request() req: any) {
        const favorites = await this.cvthequeService.getFavorites(req.user.userId);
        return { favorites };
    }

    /**
     * Update notes for favorite
     */
    @Post('favorites/:profileId/notes')
    async updateNotes(
        @Request() req: any,
        @Param('profileId') profileId: string,
        @Body() dto: UpdateNotesDto,
    ) {
        const favorite = await this.cvthequeService.updateNotes(
            req.user.userId,
            profileId,
            dto.notes,
        );
        return { favorite };
    }

    /**
     * Get view history
     */
    @Get('history')
    async getViewHistory(@Request() req: any) {
        const history = await this.cvthequeService.getViewHistory(req.user.userId);
        return { history };
    }

    /**
     * Check if profile is favorited
     */
    @Get('favorites/:profileId/check')
    async checkFavorite(@Request() req: any, @Param('profileId') profileId: string) {
        const isFavorite = await this.cvthequeService.isFavorite(req.user.userId, profileId);
        return { isFavorite };
    }
}
