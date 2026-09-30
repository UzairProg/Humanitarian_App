import { Request, Response, NextFunction } from 'express';
import { companyService } from './company.service';
import { auditService } from '../../services/audit.service';
import { AuditAction } from '@al-husseiniya/types';

export class CompanyController {
  /**
   * GET /api/v1/company
   * Public: returns the active parent company (Faeda)
   */
  async getCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.query.slug as string | undefined;
      const company = await companyService.getCompany(slug);

      if (!company) {
        // Return structured default if not seeded yet
        res.status(200).json({
          success: true,
          data: {
            name: { ar: 'فائدة', en: 'Faeda' },
            slug: 'faeda',
            description: {
              ar: 'منظومة تقنية تطوّر منصات رقمية لخدمة المجتمع، وتسهّل وصول الناس إلى الدعم الإنساني والفرص المهنية.',
              en: 'A technology group building practical digital platforms that serve communities, connecting people to relief, care, and career opportunities.',
            },
            shortDescription: {
              ar: 'منصات رقمية لخدمة المجتمع',
              en: 'Community and career platforms',
            },

            logo: null,
            website: null,
            status: 'ACTIVE',
            displayOrder: 1,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: company,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/company/products
   * Public: returns products under the parent company
   */
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const products = await companyService.getProducts(companyId);

      res.status(200).json({
        success: true,
        data: products,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/company/products/:slug
   * Public: get product details by slug
   */
  async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await companyService.getProductBySlug(req.params.slug);
      if (!product) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Product with slug '${req.params.slug}' was not found.`,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/company
   * Admin only: update parent company metadata
   */
  async updateCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await companyService.upsertCompany(req.body);

      // Audit log
      const actorId = (req.user as any)?.id || (req.user as any)?.sub || 'admin';
      await auditService.record({
        actorId,
        action: AuditAction.UPDATE,
        targetType: 'Company',
        targetId: company.id || 'faeda',
        metadata: { changes: Object.keys(req.body) },
      });

      res.status(200).json({
        success: true,
        data: company,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/company/products
   * Admin only: upsert product
   */
  async upsertProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await companyService.upsertProduct(req.body);

      // Audit log
      const actorId = (req.user as any)?.id || (req.user as any)?.sub || 'admin';
      await auditService.record({
        actorId,
        action: AuditAction.CREATE,
        targetType: 'CompanyProduct',
        targetId: product.id || product.slug,
        metadata: { slug: product.slug },
      });

      res.status(200).json({
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

}

export const companyController = new CompanyController();
