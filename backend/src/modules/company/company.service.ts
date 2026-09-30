import { CompanyModel, CompanyProductModel } from '../../models';
import { ICompany, ICompanyProduct } from '@al-husseiniya/types';

export class CompanyService {
  /**
   * Get primary company details (Faeda)
   */
  async getCompany(slug?: string): Promise<ICompany | null> {
    const query = slug ? { slug, status: 'ACTIVE' } : { status: 'ACTIVE' };
    const company = await CompanyModel.findOne(query).sort({ displayOrder: 1 }).lean();
    return company as unknown as ICompany | null;
  }

  /**
   * Get all active products for the company
   */
  async getProducts(companyId?: string): Promise<ICompanyProduct[]> {
    const query: Record<string, any> = { status: 'ACTIVE' };
    if (companyId) {
      query.companyId = companyId;
    }
    const products = await CompanyProductModel.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    return products as unknown as ICompanyProduct[];
  }

  /**
   * Get a product by slug
   */
  async getProductBySlug(slug: string): Promise<ICompanyProduct | null> {
    const product = await CompanyProductModel.findOne({ slug, status: 'ACTIVE' }).lean();
    return product as unknown as ICompanyProduct | null;
  }

  /**
   * Update or create company information (Admin only)
   */
  async upsertCompany(data: Partial<ICompany>): Promise<ICompany> {
    const slug = data.slug || 'faeda';
    const company = await CompanyModel.findOneAndUpdate(
      { slug },
      { $set: data },
      { new: true, upsert: true },
    ).lean();
    return company as unknown as ICompany;
  }

  /**
   * Upsert a product (Admin only)
   */
  async upsertProduct(data: Partial<ICompanyProduct>): Promise<ICompanyProduct> {
    if (data.id) {
      const product = await CompanyProductModel.findByIdAndUpdate(
        data.id,
        { $set: data },
        { new: true },
      ).lean();
      return product as unknown as ICompanyProduct;
    }
    const product = await CompanyProductModel.findOneAndUpdate(
      { slug: data.slug },
      { $set: data },
      { new: true, upsert: true },
    ).lean();
    return product as unknown as ICompanyProduct;
  }
}

export const companyService = new CompanyService();
