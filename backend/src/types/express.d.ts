import { JwtPayload as AppJwtPayload } from '@al-husseiniya/types';

declare global {
  namespace Express {
    // Extend passport's User interface so req.user has JwtPayload fields
    interface User extends AppJwtPayload {}

    interface Request {
      user?: AppJwtPayload;
      requestId?: string;
    }
  }
}
